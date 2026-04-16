# Deployment Guide (24/7 FREE PRODUCTION STACK)

Follow these steps to deploy your project with **Cloudflare Workers** (Backend) and **Cloudflare Pages** (Frontend).

## 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the sidebar under **DATABASE**, click **Clusters**.
3. Click the **Connect** button on your cluster (e.g., `campcart`).
4. Select **Drivers**.
5. Select **Node.js** as the driver.
6. Copy the connection string (it looks like `mongodb+srv://...`).
7. **Replace `<password>`** in the string with your actual database user password.

## 2. Backend API Setup (Cloudflare Workers)
1. In the `api` folder, run:
   ```bash
   npx wrangler deploy
   ```
2. In the **Cloudflare Dashboard**, go to your Worker > **Settings > Variables**.
3. Add these Secrets:
   - `MONGODB_URI`: *Your MongoDB Connection String*
   - `JWT_KEY`: *Any random string*
   - `MONGODB_DATABASE`: `gigmart` (or your name)

## 3. Frontend Setup (Cloudflare Pages)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. **Workers & Pages > Create > Pages > Connect to Git**.
3. Set **Build settings**:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `client`
4. Add **Environment Variables**:
   - `VITE_BACKEND_URL`: `https://camp-cash-api.yourname.workers.dev/api` (Use your Worker URL)

---

## Technical Details
- **Framework**: Hono
- **Driver**: Official MongoDB Node.js Driver (via `nodejs_compat`)
- **Benefit**: No "sleeping" restarts, faster response times, and 24/7 availability on the free tier.
