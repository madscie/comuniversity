// store/authStore.js
import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email: email,
        role: "user",
        isAdmin: false,
        isAffiliate: false,
        affiliateStatus: "not_applied",
        affiliateCode: null,
        affiliateSince: null,
        referredBy: null,
        joinDate: new Date().toISOString(),
      };

      // Check for referral code in URL or localStorage (automated detection)
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode =
        urlParams.get("ref") || localStorage.getItem("referralCode");

      if (referralCode) {
        userData.referredBy = referralCode;
        localStorage.removeItem("referralCode"); // Clear after use

        // Track the referral for the affiliate
        await get().trackReferral(referralCode, userData.id, "login");
      }

      localStorage.removeItem("adminUser");
      localStorage.setItem("user", JSON.stringify(userData));

      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
      });

      return { success: true };
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { success: false, error: "Login failed" };
    }
  },

  // Enhanced signup function with referral tracking
  signup: async (userData) => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check for duplicate email (mock)
      if (userData.email === "existing@example.com") {
        throw new Error("An account with this email already exists");
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        role: "user",
        isAdmin: false,
        isAffiliate: false,
        affiliateStatus: "not_applied",
        affiliateCode: null,
        affiliateSince: null,
        referredBy: null,
        joinDate: new Date().toISOString(),
      };

      // **REFERRAL TRACKING: BOTH AUTOMATED AND MANUAL**
      let finalReferralCode = null;

      // 1. First priority: Check URL parameter (automated)
      const urlParams = new URLSearchParams(window.location.search);
      const urlReferralCode = urlParams.get("ref");

      // 2. Second priority: Check manual input in form
      const manualReferralCode = userData.affiliateCode;

      // 3. Third priority: Check localStorage (fallback)
      const storedReferralCode = localStorage.getItem("referralCode");

      // Determine which referral code to use
      if (urlReferralCode) {
        finalReferralCode = urlReferralCode;
      } else if (manualReferralCode) {
        finalReferralCode = manualReferralCode;
      } else if (storedReferralCode) {
        finalReferralCode = storedReferralCode;
      }

      if (finalReferralCode) {
        newUser.referredBy = finalReferralCode;

        // Track the referral
        await get().trackReferral(finalReferralCode, newUser.id, "signup");

        // Clear stored referral code after use
        localStorage.removeItem("referralCode");
      }

      localStorage.removeItem("adminUser");
      localStorage.setItem("user", JSON.stringify(newUser));

      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
      });

      return {
        success: true,
        message: "Account created successfully!",
        referredBy: finalReferralCode,
      };
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { success: false, error: error.message };
    }
  },

  adminLogin: async (email, password) => {
    set({ isLoading: true });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@communiversity.com" && password === "admin123") {
        const adminData = {
          id: 1,
          name: "Admin User",
          email: email,
          role: "admin",
          isAdmin: true,
          isAffiliate: false,
          affiliateStatus: "not_applied",
          affiliateCode: null,
        };

        localStorage.removeItem("user");
        localStorage.setItem("adminUser", JSON.stringify(adminData));

        set({
          user: adminData,
          isAuthenticated: true,
          isLoading: false,
          hasCheckedAuth: true,
        });

        return { success: true };
      } else {
        throw new Error("Invalid admin credentials");
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
      return { success: false, error: error.message };
    }
  },

  // Update user affiliate status
  updateAffiliateStatus: (status, code = null) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      isAffiliate: status === "approved",
      affiliateStatus: status,
      affiliateCode: code || currentUser.affiliateCode,
      affiliateSince:
        status === "approved"
          ? new Date().toISOString()
          : currentUser.affiliateSince,
    };

    // Update localStorage
    const storageKey = currentUser.role === "admin" ? "adminUser" : "user";
    localStorage.setItem(storageKey, JSON.stringify(updatedUser));

    set({ user: updatedUser });
  },

  // Track referral function
  trackReferral: async (affiliateCode, newUserId, source = "unknown") => {
    try {
      console.log(
        `Tracking referral: ${affiliateCode} referred user ${newUserId} via ${source}`
      );

      // Get existing referrals from localStorage or initialize
      const referrals = JSON.parse(localStorage.getItem("referrals") || "[]");

      const newReferral = {
        id: referrals.length + 1,
        affiliateCode,
        referredUserId: newUserId,
        date: new Date().toISOString(),
        source, // 'url', 'manual', 'login', 'signup'
        status: "pending",
        commission: 10.0,
        trackedAt: new Date().toISOString(),
      };

      referrals.push(newReferral);
      localStorage.setItem("referrals", JSON.stringify(referrals));

      return newReferral;
    } catch (error) {
      console.error("Error tracking referral:", error);
      return null;
    }
  },

  // Get referrals for an affiliate
  getAffiliateReferrals: (affiliateCode) => {
    try {
      const referrals = JSON.parse(localStorage.getItem("referrals") || "[]");
      return referrals.filter((ref) => ref.affiliateCode === affiliateCode);
    } catch (error) {
      console.error("Error getting affiliate referrals:", error);
      return [];
    }
  },

  // Get affiliate stats
  getAffiliateStats: (affiliateCode) => {
    try {
      const referrals = get().getAffiliateReferrals(affiliateCode);
      const totalReferrals = referrals.length;
      const approvedReferrals = referrals.filter(ref => ref.status === "approved").length;
      const pendingReferrals = referrals.filter(ref => ref.status === "pending").length;
      const totalEarnings = referrals
        .filter(ref => ref.status === "approved")
        .reduce((sum, ref) => sum + ref.commission, 0);
      const pendingEarnings = referrals
        .filter(ref => ref.status === "pending")
        .reduce((sum, ref) => sum + ref.commission, 0);
      
      return {
        totalReferrals,
        approvedReferrals,
        pendingReferrals,
        totalEarnings,
        pendingEarnings,
        conversionRate: totalReferrals > 0 ? Math.round((approvedReferrals / totalReferrals) * 100) : 0
      };
    } catch (error) {
      console.error("Error getting affiliate stats:", error);
      return {
        totalReferrals: 0,
        approvedReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        conversionRate: 0
      };
    }
  },

  // Update referral status
  updateReferralStatus: (referralId, status) => {
    try {
      const referrals = JSON.parse(localStorage.getItem("referrals") || "[]");
      const updatedReferrals = referrals.map(ref => 
        ref.id === referralId ? { ...ref, status } : ref
      );
      localStorage.setItem("referrals", JSON.stringify(updatedReferrals));
      return true;
    } catch (error) {
      console.error("Error updating referral status:", error);
      return false;
    }
  },

  // Store referral code for later use (if user navigates away)
  storeReferralCode: (code) => {
    try {
      localStorage.setItem("referralCode", code);
      return true;
    } catch (error) {
      console.error("Error storing referral code:", error);
      return false;
    }
  },

  // Clear stored referral code
  clearStoredReferralCode: () => {
    try {
      localStorage.removeItem("referralCode");
      return true;
    } catch (error) {
      console.error("Error clearing referral code:", error);
      return false;
    }
  },

  // Get all affiliates (for admin)
  getAllAffiliates: () => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      return users.filter(user => user.isAffiliate || user.affiliateStatus === "approved");
    } catch (error) {
      console.error("Error getting all affiliates:", error);
      return [];
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("adminUser");
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCheckedAuth: true,
    });
  },

  checkAuth: () => {
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true });

    setTimeout(() => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedAdmin = localStorage.getItem("adminUser");

        if (storedUser && storedAdmin) {
          localStorage.removeItem("adminUser");
        }

        if (storedUser) {
          const user = JSON.parse(storedUser);
          set({
            user,
            isAuthenticated: true,
            hasCheckedAuth: true,
            isLoading: false,
          });
          return;
        }

        if (storedAdmin) {
          const user = JSON.parse(storedAdmin);
          set({
            user,
            isAuthenticated: true,
            hasCheckedAuth: true,
            isLoading: false,
          });
          return;
        }

        set({
          user: null,
          isAuthenticated: false,
          hasCheckedAuth: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("adminUser");
        set({
          user: null,
          isAuthenticated: false,
          hasCheckedAuth: true,
          isLoading: false,
        });
      }
    }, 100);
  },
}));