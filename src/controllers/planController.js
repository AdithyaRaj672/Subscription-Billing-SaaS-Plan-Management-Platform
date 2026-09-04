const Plan = require('../models/Plan');

// 1. CREATE PLAN (Admin only)
exports.createPlan = async (req, res) => {
  try {
    const { name, code, description, price, currency, billingCycle, trialPeriodDays, features } = req.body;

    const existingPlan = await Plan.findOne({ code: code.toLowerCase() });
    if (existingPlan) {
      return res.status(400).json({ message: 'Plan code already in use' });
    }

    const newPlan = await Plan.create({
      name,
      code: code.toLowerCase(),
      description,
      price,
      currency,
      billingCycle,
      trialPeriodDays,
      features
    });

    res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. GET ALL ACTIVE PLANS (Public)
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. GET PLAN BY ID
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. UPDATE PLAN (Admin only)
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(200).json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 5. TOGGLE ACTIVE STATUS (Soft delete)
exports.togglePlanStatus = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({ 
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`, 
      plan 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};