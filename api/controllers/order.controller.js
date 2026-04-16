import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import Transaction from "../models/transaction.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

// Create Order for P2P Prepaid
export const createP2POrder = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found!"));

    // Check if there's already a pending order for this gig/buyer
    let order = await Order.findOne({
      gigId: gig._id,
      buyerId: req.userId,
      status: "pending_payment"
    });

    if (!order) {
      order = new Order({
        gigId: gig._id,
        img: gig.cover,
        title: gig.title,
        buyerId: req.userId,
        sellerId: gig.userId,
        price: gig.price,
        paymentMethod: "prepaid",
        status: "pending_payment",
      });
      await order.save();

      // AUTO-NOTIFY SELLER
      const convId = order.sellerId + order.buyerId;
      const conversation = await Conversation.findOneAndUpdate(
        { id: convId },
        {
          $setOnInsert: {
            id: convId,
            sellerId: order.sellerId,
            buyerId: order.buyerId,
          },
          $set: {
            readBySeller: false,
            readByBuyer: true,
            lastMessage: `New Prepaid Order: ${order.title}`,
          },
        },
        { upsert: true, new: true }
      );

      const newMessage = new Message({
        conversationId: convId,
        userId: order.buyerId,
        desc: `📦 NEW ORDER: I started a prepaid order for "${order.title}". Please check the Orders tab!`,
      });
      await newMessage.save();
    }

    res.status(200).send(order._id);
  } catch (err) {
    next(err);
  }
};

// Create Order for Cash On Delivery (COD)
export const createCodOrder = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found!"));

    // CHECK FOR EXISTING COD ORDER TO PREVENT DUPLICATES
    let existingOrder = await Order.findOne({
      gigId: gig._id,
      buyerId: req.userId,
      status: "pending_confirmation",
      paymentMethod: "cod"
    });

    if (existingOrder) {
      return res.status(200).send("COD Order already requested. Waiting for seller confirmation.");
    }

    const codFee = gig.codFee || 0;
    const deliveryTimeline = req.body.deliveryTimeline || "Standard delivery window";

    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price + codFee,
      lateCharge: codFee,
      deliveryTimeline: deliveryTimeline,
      paymentMethod: "cod",
      status: "pending_confirmation",
      billData: {
        basePrice: gig.price,
        codFee: codFee,
        total: gig.price + codFee,
        timeline: deliveryTimeline
      }
    });

    await newOrder.save();

    // AUTO-NOTIFY SELLER
    const convId = newOrder.sellerId + newOrder.buyerId;
    await Conversation.findOneAndUpdate(
      { id: convId },
      {
        $setOnInsert: {
          id: convId,
          sellerId: newOrder.sellerId,
          buyerId: newOrder.buyerId,
        },
        $set: {
          readBySeller: false,
          readByBuyer: true,
          lastMessage: `New COD Order: ${newOrder.title}`,
        },
      },
      { upsert: true, new: true }
    );

    const newMessage = new Message({
      conversationId: convId,
      userId: newOrder.buyerId,
      desc: `📦 NEW COD ORDER: I requested Cash on Delivery for "${newOrder.title}". Please confirm!`,
    });
    await newMessage.save();

    res.status(200).send("COD Order requested. Waiting for seller confirmation.");
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [{ sellerId: req.userId }, { buyerId: req.userId }],
    }).sort({ createdAt: -1 });

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};

// Seller accepts a COD order request
export const sellerConfirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    
    // Convert both IDs to strings for comparison
    const orderSellerId = order.sellerId.toString();
    const reqUserId = req.userId.toString();
    
    if (orderSellerId !== reqUserId) {
      console.log(`Authorization failed: order.sellerId (${orderSellerId}) !== req.userId (${reqUserId})`);
      return next(createError(403, "Not authorized! Only the seller can confirm this order."));
    }
    
    if (order.status !== "pending_confirmation") return next(createError(400, "Invalid order status!"));

    order.status = "processing";
    await order.save();

    // GENERATE LEDGER ENTRY (DEBIT for Order confirmation)
    const transaction = new Transaction({
        userId: order.buyerId,
        orderId: order._id,
        amount: order.price,
        type: "debit",
        paymentMethod: "cod",
        status: "completed",
        desc: `COD Order confirmed: ${order.title}`
    });
    await transaction.save();

    res.status(200).send("Order confirmed and invoice generated.");
  } catch (err) {
    next(err);
  }
};

// Confirm Prepaid Payment (Triggered after successful Hyperswitch redirection)
// Buyer submits proof of P2P payment
export const submitP2PProof = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    
    // Convert both IDs to strings for comparison
    const orderBuyerId = order.buyerId.toString();
    const reqUserId = req.userId.toString();
    
    if (orderBuyerId !== reqUserId) {
      console.log(`Authorization failed: order.buyerId (${orderBuyerId}) !== req.userId (${reqUserId})`);
      return next(createError(403, "Not authorized! Only the buyer can submit proof."));
    }

    order.paymentReference = req.body.paymentReference;
    order.paymentScreenshot = req.body.paymentScreenshot;
    order.isUserConfirmed = true;
    order.status = "pending_confirmation"; // Move to seller for verification
    
    await order.save();
    res.status(200).send("Payment proof submitted. Waiting for seller to verify.");
  } catch (err) {
    next(err);
  }
};

// Seller verifies the P2P payment and completes order
export const sellerVerifyP2P = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    
    // Convert both IDs to strings for comparison to avoid type mismatch
    const orderSellerId = order.sellerId.toString();
    const reqUserId = req.userId.toString();
    
    if (orderSellerId !== reqUserId) {
      console.log(`Authorization failed: order.sellerId (${orderSellerId}) !== req.userId (${reqUserId})`);
      return next(createError(403, "Not authorized! Only the seller can verify payment."));
    }
    
    if (!order.isUserConfirmed) return next(createError(400, "Buyer has not submitted proof yet!"));

    order.status = "processing";
    await order.save();
    console.log(`Order ${order._id} status updated to processing by seller ${reqUserId}`);

    // LEDGER ENTRY (P2P TRANFER)
    const transaction = new Transaction({
        userId: order.buyerId,
        orderId: order._id,
        amount: order.price,
        type: "debit",
        paymentMethod: "prepaid", // P2P is prepaid from seller's view
        status: "completed",
        desc: `P2P Payment Verified: ${order.title} (Ref: ${order.paymentReference})`
    });
    await transaction.save();

    res.status(200).send("Payment verified and order accepted.");
  } catch (err) {
    next(err);
  }
};

export const confirm = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        payment_intent: req.body.payment_intent,
      },
      {
        $set: {
          isCompleted: true,
          status: "processing",
        },
      },
      { new: true }
    );

    if (order) {
        // GENERATE LEDGER ENTRY (PREPAID)
        const transaction = new Transaction({
            userId: order.buyerId,
            orderId: order._id,
            amount: order.price,
            type: "debit",
            paymentMethod: "prepaid",
            status: "completed",
            desc: `Prepaid Order successful: ${order.title}`
        });
        await transaction.save();
    }

    res.status(200).send("Order has been confirmed.");
  } catch (err) {
    next(err);
  }
};

// Get single order by ID (for tracking)
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    
    // Check if user is authorized (buyer or seller of this order)
    if (order.buyerId.toString() !== req.userId && order.sellerId.toString() !== req.userId) {
      return next(createError(403, "Not authorized to view this order!"));
    }
    
    res.status(200).send(order);
  } catch (err) {
    next(err);
  }
};

// Seller marks order as shipped/processing (Phase 2)
export const markOrderShipped = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    if (order.sellerId.toString() !== req.userId) return next(createError(403, "Only seller can update order status!"));
    if (order.status !== "processing") return next(createError(400, "Order must be in processing status!"));

    order.status = "shipped";
    order.shippedAt = new Date();
    await order.save();

    // Notify buyer via conversation
    const convId = order.sellerId.toString() + order.buyerId.toString();
    await Conversation.findOneAndUpdate(
      { id: convId },
      {
        $set: {
          lastMessage: `📦 Order #${order._id.toString().slice(-6)} has been shipped!`,
          readByBuyer: false,
        },
      }
    );

    const newMessage = new Message({
      conversationId: convId,
      userId: order.sellerId,
      desc: `📦 Your order "${order.title}" has been shipped and is on the way!`,
    });
    await newMessage.save();

    res.status(200).send("Order marked as shipped.");
  } catch (err) {
    next(err);
  }
};

// Seller or Buyer marks order as completed (Phase 3)
export const markOrderCompleted = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    
    // Both buyer and seller can mark as completed
    const userId = req.userId;
    const isSeller = order.sellerId.toString() === userId;
    const isBuyer = order.buyerId.toString() === userId;
    
    if (!isSeller && !isBuyer) {
      return next(createError(403, "Not authorized!"));
    }
    
    if (order.status !== "shipped" && order.status !== "processing") {
      return next(createError(400, "Order must be shipped or processing to complete!"));
    }

    order.status = "completed";
    order.completedAt = new Date();
    order.isCompleted = true;
    order.completedBy = isSeller ? "seller" : "buyer";
    await order.save();

    // Auto-generate bill data
    order.billGenerated = true;
    order.billData = {
      billNumber: `BILL-${Date.now()}`,
      generatedAt: new Date(),
      items: [{
        title: order.title,
        price: order.price,
        quantity: 1,
      }],
      total: order.price,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference || null,
    };
    await order.save();

    // Notify both parties
    const convId = order.sellerId.toString() + order.buyerId.toString();
    await Conversation.findOneAndUpdate(
      { id: convId },
      {
        $set: {
          lastMessage: `✅ Order #${order._id.toString().slice(-6)} completed! Bill generated.`,
          readByBuyer: !isBuyer,
          readBySeller: !isSeller,
        },
      }
    );

    const newMessage = new Message({
      conversationId: convId,
      userId: userId,
      desc: `✅ Order "${order.title}" marked as completed! Bill has been generated.`,
    });
    await newMessage.save();

    res.status(200).send("Order completed and bill generated.");
  } catch (err) {
    next(err);
  }
};

// Get bill for an order
export const getBill = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError(404, "Order not found!"));
    
    // Only buyer or seller can view bill
    if (order.buyerId.toString() !== req.userId && order.sellerId.toString() !== req.userId) {
      return next(createError(403, "Not authorized!"));
    }
    
    if (!order.billGenerated) {
      return next(createError(400, "Bill not generated yet!"));
    }

    res.status(200).send(order.billData);
  } catch (err) {
    next(err);
  }
};