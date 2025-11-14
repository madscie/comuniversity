import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";

// Public pages (no auth required)
import SignInPage from "./pages/user/SignIn";
import SignUpPage from "./pages/user/SignUp";
import AuthRedirect from "./components/AuthRedirect";

// Protected pages
import HomePage from "./pages/public/HomePage";
import BrowsePage from "./pages/public/BrowsePage";
import SearchPage from "./pages/public/SearchPage";
import AboutPage from "./pages/public/AboutPage";
import ArticlesPage from "./pages/public/ArticlesPage";
import SingleArticlePage from "./pages/public/SingleArticlePage";
import WebinarsPage from "./pages/public/webinars/WebinarsPage";
import BookDetail from "./pages/public/BookDetail";
import Profile from "./pages/public/Profile/ProfilePage";
import MyLibraryPage from "./pages/public/MyLibraryPage";

// Admin pages
import DashboardPage from "./pages/admin/Pages/AdminDashboardPage";
import AddBookPage from "./pages/admin/Pages/AddBookPage";
import ManageBooksPage from "./pages/admin/Pages/ManageBooksPage";
import ManageArticlesPage from "./pages/admin/Pages/ManageArticlesPage";
import ManageAffiliatesPage from "./pages/admin/Pages/ManageAffiliatePage";
import UserManagementPage from "./pages/admin/Pages/UserManagementPage";
import ManageWebinarsPage from "./pages/admin/Pages/ManageWebinarsPage";

// Affiliate pages
import CheckoutDownloadPage from "./pages/payments/CheckoutPage";
import AffiliateSignup from "./pages/affiliate/AffiliateSignup";
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import AffiliateStatus from "./pages/affiliate/AffiliateStatus";

import MemberRoute from "./components/MemberRoute";
import AdminRoute from "./components/AdminRoute";

// Enhanced Loading Spinner Component
const LoadingSpinner = ({ size = "large", message = "Loading application..." }) => {
  const sizes = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}></div>
          <div className={`absolute top-0 left-0 ${sizes[size]} border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin`}></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
          {message}
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Communiversity Library
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const { isLoaded } = useAuth();

  useEffect(() => {
    // Enhanced theme detection with localStorage support
    const detectTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      
      if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    detectTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => mediaQuery.removeEventListener('change', detectTheme);
  }, []);

  if (!isLoaded) {
    return <LoadingSpinner message="Initializing application..." />;
  }

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES - No authentication required */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />

        {/* PROTECTED ROUTES - Require user authentication */}
        <Route
          path="/"
          element={
            <MemberRoute>
              <Layout>
                <HomePage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <MemberRoute>
              <Layout>
                <BrowsePage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/search"
          element={
            <MemberRoute>
              <Layout>
                <SearchPage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/about"
          element={
            <MemberRoute>
              <Layout>
                <AboutPage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <MemberRoute>
              <Layout>
                <ArticlesPage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <MemberRoute>
              <Layout>
                <SingleArticlePage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/webinars"
          element={
            <MemberRoute>
              <Layout>
                <WebinarsPage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/books/:id"
          element={
            <MemberRoute>
              <Layout>
                <BookDetail />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <MemberRoute>
              <Layout>
                <Profile />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/my-library"
          element={
            <MemberRoute>
              <Layout>
                <MyLibraryPage />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/checkout/:bookId"
          element={
            <MemberRoute>
              <Layout>
                <CheckoutDownloadPage />
              </Layout>
            </MemberRoute>
          }
        />

        {/* AFFILIATE ROUTES - Protected affiliate pages */}
        <Route
          path="/affiliate-signup"
          element={
            <MemberRoute>
              <Layout>
                <AffiliateSignup />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/affiliate-dashboard"
          element={
            <MemberRoute>
              <Layout>
                <AffiliateDashboard />
              </Layout>
            </MemberRoute>
          }
        />
        <Route
          path="/affiliate-status"
          element={
            <MemberRoute>
              <Layout>
                <AffiliateStatus />
              </Layout>
            </MemberRoute>
          }
        />

        {/* ADMIN ROUTES - Require admin privileges */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-books"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageBooksPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/add-book"
          element={
            <AdminRoute>
              <AdminLayout>
                <AddBookPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageArticlesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/affiliates"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageAffiliatesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <UserManagementPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-webinars"
          element={
            <AdminRoute>
              <AdminLayout>
                <ManageWebinarsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* CATCH ALL ROUTE - Redirect unknown paths to home */}
        <Route
          path="*"
          element={
            <MemberRoute>
              <Layout>
                <HomePage />
              </Layout>
            </MemberRoute>
          }
        />
      </Routes>

      {/* Enhanced Toast Notifications Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="dark:bg-gray-800 dark:text-white"
        progressClassName="bg-gradient-to-r from-gray-700 to-green-600"
        bodyClassName="dark:bg-gray-800 dark:text-white"
        style={{
          '--toastify-color-light': '#ffffff',
          '--toastify-color-dark': '#1f2937',
          '--toastify-color-info': '#059669',
          '--toastify-color-success': '#059669',
          '--toastify-color-warning': '#d97706',
          '--toastify-color-error': '#dc2626',
          '--toastify-color-transparent': 'rgba(255, 255, 255, 0.7)',
        }}
      />
    </>
  );
};

export default App;