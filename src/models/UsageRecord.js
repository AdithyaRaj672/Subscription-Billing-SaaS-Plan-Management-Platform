const mongoose = require('mongoose');

const usageRecordSchema = new mongoose.Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  featureKey: { type: String, required: true }, // e.g., "max_users" or "api_calls"
  quantity: { type: Number, required: true, default: 1 },
  recordedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UsageRecord', usageRecordSchema);