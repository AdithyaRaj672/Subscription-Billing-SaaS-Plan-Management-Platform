const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Tenant = require('../models/Tenant');

// 1. GENERATE INVOICE FOR TENANT
exports.generateInvoice = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const subscription = await Subscription.findOne({ tenantId }).populate('planId');
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found to invoice' });
    }

    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const invoice = await Invoice.create({
      tenantId,
      subscriptionId: subscription._id,
      invoiceNumber,
      amount: subscription.planId.price,
      currency: subscription.planId.currency,
      status: 'open',
      dueDate
    });

    res.status(201).json({ message: 'Invoice generated successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. PROCESS PAYMENT FOR AN INVOICE
exports.processPayment = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;
    const tenantId = req.user.tenantId;

    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    // Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payment = await Payment.create({
      tenantId,
      invoiceId: invoice._id,
      amount: invoice.amount,
      currency: invoice.currency,
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: 'succeeded',
      transactionId
    });

    // Mark invoice as paid
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    res.status(200).json({ message: 'Payment processed successfully', payment, invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. GET ALL INVOICES FOR CURRENT TENANT
exports.getTenantInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. ADMIN DASHBOARD ANALYTICS (Aggregated Financial & Tenant Metrics)
exports.getAdminDashboardMetrics = async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: { $in: ['active', 'trialing'] } });

    // Aggregate total revenue from successful payments
    const revenueResult = await Payment.aggregate([
      { $match: { paymentStatus: 'succeeded' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      metrics: {
        totalTenants,
        activeSubscriptions,
        totalRevenue,
        currency: 'USD'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};