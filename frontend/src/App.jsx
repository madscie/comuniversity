import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";
import HomePage from "./pages/public/HomePage";
import BrowsePage from "./pages/public/BrowsePage";
import SearchPage from "./pages/public/SearchPage";
import AdminLoginPage from "./pages/admin/Pages/AdminLoginPage";
import DashboardPage from "./pages/admin/Pages/AdminDashboardPage";
import AddBookPage from "./pages/admin/Pages/AddBookPage";
import ManageBooksPage from "./pages/admin/Pages/ManageBooksPage";
import AboutPage from "./pages/public/AboutPage";
import SignUp from "./pages/user/SignUp";
import ArticlesPage from "./pages/public/ArticlesPage";
import MemberRoute from "./components/MemberRoute";
import AdminRoute from "./components/AdminRoute";
import WebinarsPage from "./pages/public/webinars/WebinarsPage";
import Login from "./pages/user/Login";
import ManageArticlesPage from "./pages/admin/Pages/ManageArticlesPage";
import ManageAffiliatesPage from "./pages/admin/Pages/ManageAffiliatePage";
import UserManagementPage from "./pages/admin/Pages/UserManagementPage";
import ManageWebinarsPage from "./pages/admin/Pages/ManageWebinarsPage";
import BookDetail from "./pages/public/BookDetail";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Simple loading state
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading application...</div>
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        {/* ---------- PUBLIC ROUTES (No authentication required) ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ---------- MEMBER ROUTES (Require user authentication) ---------- */}
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

        {/* ---------- ADMIN ROUTES (Require admin authentication) ---------- */}
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
          path="/admin/Users"
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

        {/* Redirect admin root to dashboard */}
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
      </Routes>
    </Router>
  );
};

export default App;
