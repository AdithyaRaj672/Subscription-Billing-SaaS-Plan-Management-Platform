const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g., "PROMO20"
  discountPercent: { type: Number, required: true, min: 1, max: 100 }, // e.g., 20 for 20% off
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', couponSchema);