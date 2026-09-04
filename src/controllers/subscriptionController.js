const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const UsageRecord = require('../models/UsageRecord');

// 1. SUBSCRIBE OR UPGRADE PLAN
exports.createOrUpdateSubscription = async (req, res) => {
  try {
    const { planId } = req.body;
    const tenantId = req.user.tenantId;

    // Verify Plan exists and is active
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Active plan not found' });
    }

    // Calculate billing end date based on plan billing cycle
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.billingCycle === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1);
    } else if (plan.billingCycle === 'quarterly') {
      periodEnd.setMonth(now.getMonth() + 3);
    } else {
      periodEnd.setDate(now.getDate() + 30); // Default monthly
    }

    // Check for existing subscription
    let subscription = await Subscription.findOne({ tenantId });

    if (subscription) {
      // Update existing subscription (Upgrade / Downgrade)
      subscription.planId = plan._id;
      subscription.status = plan.trialPeriodDays > 0 ? 'trialing' : 'active';
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
      await subscription.save();
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        tenantId,
        planId: plan._id,
        status: plan.trialPeriodDays > 0 ? 'trialing' : 'active',
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd
      });
    }

    res.status(200).json({
      message: 'Subscription processed successfully',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. GET CURRENT TENANT SUBSCRIPTION (Populates Plan Details)
exports.getTenantSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ tenantId: req.user.tenantId })
      .populate('planId');

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found for this tenant' });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. CANCEL SUBSCRIPTION AT PERIOD END
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ tenantId: req.user.tenantId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.status(200).json({
      message: 'Subscription set to cancel at end of billing cycle',
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. RECORD FEATURE USAGE
exports.recordUsage = async (req, res) => {
  try {
    const { featureKey, quantity } = req.body;
    const tenantId = req.user.tenantId;

    const usage = await UsageRecord.create({
      tenantId,
      featureKey,
      quantity: quantity || 1
    });

    res.status(201).json({ message: 'Usage recorded successfully', usage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};