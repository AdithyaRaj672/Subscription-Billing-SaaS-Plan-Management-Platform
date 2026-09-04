const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  invoiceNumber: { type: String, required: true, unique: true }, // e.g., "INV-2026-0001"
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['draft', 'open', 'paid', 'uncollectible', 'void'], 
    default: 'open' 
  },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);