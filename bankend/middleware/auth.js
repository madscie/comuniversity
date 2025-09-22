const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type === 'admin') {
      req.admin = await Admin.findById(decoded.id);
      req.userType = 'admin';
    } else {
      req.user = await User.findById(decoded.id);
      req.userType = 'user';
    }

    if (!req.admin && !req.user) {
      return res.status(401).json({ message: 'Token is not valid.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

module.exports = { auth, requireAdmin };