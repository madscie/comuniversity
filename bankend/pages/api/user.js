const express = require('express');
const router = express.Router();
const { Clerk } = require('@clerk/clerk-sdk-node');

// Configure Clerk
Clerk.configure({
  secretKey: process.env.CLERK_SECRET_KEY
});

// ✅ ADD THESE ADMIN ROUTES TO YOUR EXISTING USER API

// Get all users from Clerk (Admin only)
router.get('/admin/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the token
    const decoded = await Clerk.verifyToken(token);
    
    // Check if user is admin
    if (decoded.metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch users from Clerk
    const userList = await Clerk.users.getUserList({
      limit: 100,
    });

    res.status(200).json({
      success: true,
      users: userList.data
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (Admin only)
router.post('/admin/users/update-role', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { userId, role } = req.body;

    if (!token || !userId || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the token and check admin role
    const decoded = await Clerk.verifyToken(token);
    if (decoded.metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update user metadata in Clerk
    await Clerk.users.updateUser(userId, {
      publicMetadata: {
        role: role,
        ...decoded.metadata // Keep existing metadata
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user status (ban/unban)
router.post('/admin/users/toggle-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { userId, banned } = req.body;

    if (!token || !userId || typeof banned === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the token and check admin role
    const decoded = await Clerk.verifyToken(token);
    if (decoded.metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update user ban status in Clerk
    await Clerk.users.updateUser(userId, {
      banned: banned
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user from Clerk
router.delete('/admin/users/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { userId } = req.params;

    if (!token || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the token and check admin role
    const decoded = await Clerk.verifyToken(token);
    if (decoded.metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete user from Clerk
    await Clerk.users.deleteUser(userId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the router with your existing routes + new admin routes
module.exports = router;