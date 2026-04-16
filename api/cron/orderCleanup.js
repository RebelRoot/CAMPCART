import cron from "node-cron";
import Order from "../models/order.model.js";

/**
 * Auto-cleanup job that deletes unpaid orders (pending_payment) 
 * after 5 minutes if no proof has been submitted
 */
const startOrderCleanupJob = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Find orders that:
      // 1. Are in "pending_payment" status
      // 2. Were created more than 5 minutes ago
      // 3. Have no payment proof (screenshot is null/empty)
      // 4. Have no payment reference (UTR is null/empty)
      const expiredOrders = await Order.find({
        status: "pending_payment",
        createdAt: { $lt: fiveMinutesAgo },
        $or: [
          { paymentScreenshot: { $exists: false } },
          { paymentScreenshot: null },
          { paymentScreenshot: "" },
        ],
        $or: [
          { paymentReference: { $exists: false } },
          { paymentReference: null },
          { paymentReference: "" },
        ],
      });

      if (expiredOrders.length > 0) {
        console.log(`[Cron] Found ${expiredOrders.length} expired unpaid orders to delete`);
        
        const orderIds = expiredOrders.map(order => order._id);
        await Order.deleteMany({ _id: { $in: orderIds } });
        
        console.log(`[Cron] Deleted ${expiredOrders.length} expired orders:`, 
          expiredOrders.map(o => o._id.toString())
        );
      }
    } catch (err) {
      console.error("[Cron] Error in order cleanup job:", err);
    }
  });

  console.log("[Cron] Order cleanup job scheduled - runs every minute");
};

export default startOrderCleanupJob;
