const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// 1. REGISTER TENANT + PRIMARY ADMIN (Company Onboarding)
exports.registerTenant = async (req, res) => {
  try {
    const { companyName, slug, adminName, email, password } = req.body;

    // Check if tenant slug or user email already exists
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      return res.status(400).json({ message: 'Company slug already in use' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Step A: Create Tenant
    const newTenant = await Tenant.create({
      name: companyName,
      slug: slug.toLowerCase()
    });

    // Step B: Hash Password
    const hashedPassword = await hashPassword(password);

    // Step C: Create Primary Tenant Admin User
    const adminUser = await User.create({
      tenantId: newTenant._id,
      name: adminName,
      email,
      passwordHash: hashedPassword,
      role: 'tenant_admin'
    });

    // Step D: Generate Token
    const token = generateToken(adminUser);

    res.status(201).json({
      message: 'Tenant and Admin created successfully',
      token,
      tenant: { id: newTenant._id, name: newTenant.name, slug: newTenant.slug },
      user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. REGISTER USER UNDER EXISTING TENANT (Only run by tenant_admin)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Tenant ID is extracted directly from logged-in user's token
    const tenantId = req.user.tenantId;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      tenantId,
      name,
      email,
      passwordHash: hashedPassword,
      role: role || 'end_user'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate Token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. GET LOGGED IN USER PROFILE
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};