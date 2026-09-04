const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  featureKey: { type: String, required: true }, // e.g., "max_users", "export_pdf", "api_rate_limit"
  featureName: { type: String, required: true }, // e.g., "Max Active Users"
  valueType: { 
    type: String, 
    enum: ['boolean', 'numeric', 'unlimited'], 
    default: 'boolean' 
  },
  limit: { type: Number, default: 0 } // e.g., 10 for max_users
});

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g., "Pro Monthly"
  code: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g., "plan_pro_monthly"
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 }, // e.g., 29.99
  currency: { type: String, default: 'USD', uppercase: true },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'yearly'], 
    default: 'monthly' 
  },
  trialPeriodDays: { type: Number, default: 0 },
  features: [featureSchema], // Embedded array of entitlements
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);