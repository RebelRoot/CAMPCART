
# Backend & Auth Audit — Fix Plan

## Bugs Found

### AUTH BUGS

#### BUG 1 (CRITICAL): Mobile sends token via Authorization header, backend only reads cookie
- **Mobile** `api.ts:23` sends `Authorization: Bearer <token>`
- **Express backend** `jwt.js:5` reads `req.cookies.accessToken` only — never checks Authorization header
- **Worker backend** `auth.js:6` reads `getCookie(c, 'accessToken')` only
- **Result**: Every authenticated request from mobile fails with 401 "You are not authenticated!"
- **Fix**: Both `jwt.js` and `auth.js` middleware must fall back to `Authorization: Bearer <token>` header when no cookie present

#### BUG 2 (CRITICAL): Mobile login stores user data but token extraction from set-cookie header unreliable
- `AuthContext.tsx:63-66` tries to parse `res.headers['set-cookie']` — React Native often strips this header
- If parsing fails, token never stored → all subsequent requests 401
- **Fix**: Auth endpoint should return token in response body; mobile stores it directly

#### BUG 3 (MEDIUM): Express backend `verifySeller` in jwt.js doesn't return after error
- `jwt.js:37` calls `next(createError(...))` but doesn't `return` — execution continues to `next()` on line 39
- Same bug in `verifyAdmin` line 26, `verifyAuthority` line 47
- **Fix**: Add `return` before all `next(createError(...))` calls

#### BUG 4 (MEDIUM): Worker `verifyAdmin`/`verifySeller`/`verifyAuthority` wrong control flow
- `auth.js:24` `verifyAdmin` calls `verifyToken(c, async () => {...})` — `verifyToken` calls `await next()` then callback runs, but `verifyAdmin`'s own `next` is shadowed
- The nested callback pattern is incorrect for Hono middleware — should use sequential awaits
- **Fix**: Rewrite to check role after verifyToken completes, using simple if/throw pattern

#### BUG 5 (LOW): Express JWT token never expires
- `auth.controller.js:57-68` `jwt.sign()` has no `expiresIn` option
- Worker version correctly sets `exp` (line 91)
- **Fix**: Add `expiresIn: '24h'` to Express login

### GIG / ADD ITEM BUGS

#### BUG 6 (CRITICAL): Gig creation allows `userId` override from request body
- `gig.controller.js:10-13` uses `{ userId: req.userId, ...req.body }` — spread AFTER userId
- If `req.body` contains `userId`, it overwrites the authenticated user's ID
- Same in worker `gig.js:17` — `...body` after `userId`
- **Result**: User can create gigs under another user's ID
- **Fix**: Destructure body to exclude `userId`, or spread body first then set `userId`

#### BUG 7 (HIGH): Gig `getGig` missing return after error
- `gig.controller.js:37-38`: `if (!gig) next(createError(...))` — no `return`, execution falls through to `res.status(200).send(gig)` which sends `null`
- **Fix**: Add `return` before `next(createError(...))`

#### BUG 8 (MEDIUM): Gig route `/new` conflicts with `/:id` pattern (Express only)
- `gig.route.js:25` `router.get("/new", getNewGigs)` — works fine because it's a literal path
- But `/single/:id` (line 21) is placed before `/new` — no conflict there since paths differ
- Actually this is fine. No bug here.

### OTHER BUGS

#### BUG 9 (HIGH): Cron job `$or` override bug
- `orderCleanup.js:23-32` defines two `$or` conditions — the second `$or` overwrites the first in the query object
- Should use `$and` to combine both conditions
- **Fix**: Wrap both `$or` in `$and: [{ $or: [...] }, { $or: [...] }]`

#### BUG 10 (MEDIUM): Worker `addMoney` response calculates wrong balance
- `wallet.js:84`: `newBalance: (amount || 0) + (amount)` — always returns `2 * amount`
- **Fix**: Read actual balance after update, or calculate properly

#### BUG 11 (MEDIUM): Worker `sendMoney` compares ObjectId with string
- `wallet.js:33`: `sender._id.toString() === receiver._id.toString()` — `_id` from MongoDB is ObjectId, but `.toString()` should work
- But line 34: `sender.campCash < amount` — `campCash` might not exist yet, defaults to undefined
- **Fix**: Ensure `campCash` defaults: `(sender.campCash || 0) < amount`

---

## File Changes

### 1. `api/middleware/jwt.js` — Fix auth header support + missing returns
```js
// Add Authorization header fallback + return before next(createError)
export const verifyToken = (req, res, next) => {
  // Try cookie first, then Authorization header
  const token = req.cookies.accessToken || 
    (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);
  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }
  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    req.role = payload.role;
    req.college = payload.college;
    next();
  });
};
// Add return before all next(createError(...)) in verifyAdmin, verifySeller, verifyAuthority
```

### 2. `api/middleware/auth.js` — Fix auth header support + rewrite verifyAdmin/Seller/Authority
```js
// Add Authorization header fallback
// Rewrite verifyAdmin/verifySeller/verifyAuthority to not use nested callback anti-pattern
export const verifyToken = async (c, next) => {
  const token = getCookie(c, 'accessToken') || 
    (c.req.header('Authorization')?.startsWith('Bearer ') && c.req.header('Authorization').split(' ')[1]);
  if (!token) throw createError(401, 'You are not authenticated!');
  try {
    const payload = await verify(token, c.env.JWT_KEY);
    c.set('userId', payload.id);
    c.set('isSeller', payload.isSeller);
    c.set('role', payload.role);
    c.set('college', payload.college);
    await next();
  } catch (err) {
    throw createError(403, 'Token is not valid!');
  }
};

export const verifyAdmin = async (c, next) => {
  await verifyToken(c, async () => {});
  if (c.get('role') !== 'admin') throw createError(403, 'Only admins can perform this action!');
  await next();
};
// Similar pattern for verifySeller and verifyAuthority
```

### 3. `api/controllers/auth.controller.js` — Add token to response body + JWT expiry
```js
// Login: add expiresIn, include token in response for mobile clients
const token = jwt.sign({...}, process.env.JWT_KEY, { expiresIn: '24h' });
res.cookie("accessToken", token, {...})
   .status(200)
   .send({ ...info, accessToken: token });
```

### 4. `api/controllers-worker/auth.js` — Include token in response body
```js
// Login: already has token, add to JSON response
return c.json({ ...info, accessToken: token }, 200);
```

### 5. `mobile/lib/api.ts` — Fix token sending
```ts
// Already sends via Authorization header — this will work once backend is fixed
// No changes needed here (the Bearer token approach is correct)
```

### 6. `mobile/contexts/AuthContext.tsx` — Store token from response body
```tsx
// Login: extract token from response data (more reliable than set-cookie header)
const userData = res.data;
const token = userData.accessToken; // From response body
await SecureStore.setItemAsync('accessToken', token);
await SecureStore.setItemAsync('currentUser', JSON.stringify(userData));
```

### 7. `api/controllers/gig.controller.js` — Fix userId override + missing return
```js
// createGig: spread body first, then set userId (prevents override)
const newGig = new Gig({
  ...req.body,
  userId: req.userId,
});

// getGig: add return before next(createError)
if (!gig) return next(createError(404, "Gig not found!"));
```

### 8. `api/controllers-worker/gig.js` — Fix userId override
```js
const newGig = {
  ...body,
  userId,  // After spread, so it wins
};
```

### 9. `api/cron/orderCleanup.js` — Fix $or override
```js
const expiredOrders = await Order.find({
  status: "pending_payment",
  createdAt: { $lt: fiveMinutesAgo },
  $and: [
    { $or: [
      { paymentScreenshot: { $exists: false } },
      { paymentScreenshot: null },
      { paymentScreenshot: "" },
    ]},
    { $or: [
      { paymentReference: { $exists: false } },
      { paymentReference: null },
      { paymentReference: "" },
    ]},
  ],
});
```

### 10. `api/controllers-worker/wallet.js` — Fix addMoney balance + sendMoney campCash default
```js
// addMoney: fix newBalance calculation
// sendMoney: default campCash
if ((sender.campCash || 0) < amount) throw createError(400, "Insufficient balance!");
```

---

## Verification

| Step | Target | Verify |
|------|--------|--------|
| 1 | Auth middleware reads both cookie + Bearer header | Mobile `Authorization: Bearer` requests authenticated |
| 2 | Login returns token in response body | Mobile can extract & store token |
| 3 | JWT has 24h expiry | Token expires properly |
| 4 | Missing returns in middleware | No double next() calls |
| 5 | Worker verifyAdmin/Seller/Authority | No nested callback anti-pattern |
| 6 | Gig create userId override fixed | `...req.body` then `userId: req.userId` |
| 7 | getGig missing return fixed | No null response sent after 404 |
| 8 | Cron $or override fixed | Both conditions checked |
| 9 | Wallet balance calc fixed | addMoney returns correct balance |
