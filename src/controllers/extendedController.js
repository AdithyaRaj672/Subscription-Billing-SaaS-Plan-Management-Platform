const Coupon = require('../models/Coupon');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const UsageRecord = require('../models/UsageRecord');
const Tenant = require('../models/Tenant');

// MODULE 9: CREATE & APPLY COUPONS
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, validUntil } = req.body;
    const coupon = await Coupon.create({ code: code.toUpperCase(), discountPercent, validUntil });
    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.applyCouponToInvoice = async (req, res) => {
  try {
    const { invoiceId, couponCode } = req.body;
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

    if (!coupon || new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice || invoice.status === 'paid') {
      return res.status(400).json({ message: 'Cannot apply coupon to this invoice' });
    }

    const discountAmount = (invoice.amount * coupon.discountPercent) / 100;
    invoice.amount = Math.max(0, invoice.amount - discountAmount);
    await invoice.save();

    res.status(200).json({ message: `Applied ${coupon.discountPercent}% discount`, invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MODULE 10: CUSTOMER BILLING DASHBOARD
exports.getCustomerDashboard = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const subscription = await Subscription.findOne({ tenantId }).populate('planId');
    const usage = await UsageRecord.find({ tenantId }).sort({ recordedAt: -1 }).limit(10);
    const invoices = await Invoice.find({ tenantId }).sort({ createdAt: -1 });

    res.status(200).json({
      dashboard: {
        subscription: subscription || 'No active subscription',
        recentUsage: usage,
        invoiceHistory: invoices
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MODULE 11: DUNNING & FAILED PAYMENT RETRY
exports.retryFailedPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Simulate dunning retry logic
    const isSuccess = Math.random() > 0.3; // 70% retry success rate

    if (isSuccess) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      await invoice.save();
      return res.status(200).json({ message: 'Dunning retry succeeded. Invoice paid.', invoice });
    } else {
      invoice.status = 'uncollectible';
      await invoice.save();

      // Mark subscription as past_due
      await Subscription.updateOne({ _id: invoice.subscriptionId }, { status: 'past_due' });

      return res.status(400).json({ message: 'Dunning retry failed. Subscription set to past_due.', invoice });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MODULE 12: ADMIN REVENUE, MRR & CHURN REPORT
exports.getRevenueAndChurnReport = async (req, res) => {
  try {
    const activeSubs = await Subscription.find({ status: 'active' }).populate('planId');
    const canceledCount = await Subscription.countDocuments({ status: 'canceled' });
    const totalSubs = await Subscription.countDocuments();

    // Calculate Monthly Recurring Revenue (MRR)
    let mrr = 0;
    activeSubs.forEach(sub => {
      if (sub.planId) {
        mrr += sub.planId.billingCycle === 'yearly' ? sub.planId.price / 12 : sub.planId.price;
      }
    });

    const churnRate = totalSubs > 0 ? ((canceledCount / totalSubs) * 100).toFixed(2) : 0;

    res.status(200).json({
      report: {
        mrr: parseFloat(mrr.toFixed(2)),
        activeSubscribers: activeSubs.length,
        churnRate: `${churnRate}%`,
        canceledSubscribers: canceledCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};