import { getCollection } from "../config/database.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get collections
    const booksCollection = await getCollection("books");
    const usersCollection = await getCollection("users");
    const contentCollection = await getCollection("content");
    
    // Execute parallel count operations (faster than sequential)
    const [
      booksCount,
      usersCount,
      articlesCount,
      webinarsCount,
      affiliatesCount
    ] = await Promise.all([
      // Total books
      booksCollection.countDocuments({}),
      
      // Total users
      usersCollection.countDocuments({}),
      
      // Total articles
      contentCollection.countDocuments({ type: "article" }),
      
      // Total webinars
      contentCollection.countDocuments({ type: "webinar" }),
      
      // Active affiliates (users with active affiliate status)
      usersCollection.countDocuments({
        "affiliate.status": "active"
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks: booksCount,
          totalUsers: usersCount,
          totalArticles: articlesCount,
          totalWebinars: webinarsCount,
          activeAffiliates: affiliatesCount,
          monthlyRevenue: 0,
          pendingReviews: 0,
        },
        recentActivity: [],
      },
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const usersCollection = await getCollection("users");
    
    // Get users with projection (similar to SELECT specific fields)
    const users = await usersCollection.find({}, {
      projection: {
        _id: 1,
        userId: 1,
        name: 1,
        email: 1,
        role: 1,
        status: 1, // replaces is_active
        affiliate: 1,
        createdAt: 1,
        updatedAt: 1
      }
    })
    .sort({ createdAt: -1 }) // ORDER BY created_at DESC
    .toArray();

    // Transform data to match your expected format
    const transformedUsers = users.map((user) => ({
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.status === "active", // Convert status to boolean
      affiliate_status: user.affiliate?.status || "inactive",
      total_referrals: user.affiliate?.totalReferrals || 0,
      total_earnings: user.affiliate?.totalEarnings || 0,
      join_date: user.createdAt,
      last_login: user.lastLogin || null,
      bio: user.bio || "",
      profile_image: user.profileImage || "",
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));

    res.json({
      success: true,
      data: {
        users: transformedUsers,
      },
    });
  } catch (error) {
    console.error("❌ Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, affiliate_status } = req.body;

    const usersCollection = await getCollection("users");
    
    // Check if user exists
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update object
    const updateFields = {};
    const updateOperations = { $set: {} };

    if (role !== undefined) {
      updateOperations.$set.role = role;
    }

    if (is_active !== undefined) {
      // Convert boolean to status string
      updateOperations.$set.status = is_active ? "active" : "inactive";
    }

    if (affiliate_status !== undefined) {
      // Update affiliate subdocument
      if (!existingUser.affiliate) {
        updateOperations.$set.affiliate = {
          status: affiliate_status,
          totalReferrals: 0,
          totalEarnings: 0
        };
      } else {
        updateOperations.$set["affiliate.status"] = affiliate_status;
      }
    }

    // Always update updatedAt timestamp
    updateOperations.$set.updatedAt = new Date();

    if (Object.keys(updateOperations.$set).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Perform update
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperations
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes made to user",
      });
    }

    // Get updated user
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          affiliate: 1
        }
      }
    );

    console.log(`✅ User updated: ID ${id}`);

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          is_active: updatedUser.status === "active",
          affiliate_status: updatedUser.affiliate?.status || "inactive"
        },
      },
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user: " + error.message,
    });
  }
};

// Import ObjectId if needed
import { ObjectId } from "mongodb";