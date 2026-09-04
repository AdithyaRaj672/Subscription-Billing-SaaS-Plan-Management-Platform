const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { 
    type: String, 
    enum: ['credit_card', 'stripe', 'paypal', 'bank_transfer'], 
    default: 'credit_card' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'succeeded', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionId: { type: String, required: true },
  processedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);