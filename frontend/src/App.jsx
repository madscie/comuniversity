// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/public/HomePage";
import BrowsePage from "./pages/public/BrowsePage";
import SearchPage from "./pages/public/SearchPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AddBookPage from "./pages/admin/AddBookPage";
import ManageBooksPage from "./pages/admin/ManageBooksPage";
import AboutPage from "./pages/public/AboutPage";
import SignUp from "./pages/user/SignUp";
import ArticlesPage from "./pages/public/ArticlesPage";
import MemberRoute from "./components/MemberRoute";
import AdminRoute from "./components/AdminRoute";
import ProfilePage from "./pages/user/ProfilePage";
import WebinarsPage from "./pages/public/webinars/WebinarsPage";
import Login from "./pages/user/Login";
import SettingsPage from "./pages/user/SettingsPage";


const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* ---------- PUBLIC ROUTES (Only Login & Signup) ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ---------- PROTECTED MEMBER ROUTES (Closed System) ---------- */}
          {/* All these routes now require a user to be logged in */}
          <Route
            path="/"
            element={
              <MemberRoute>
                <HomePage />
              </MemberRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <MemberRoute>
                <BrowsePage />
              </MemberRoute>
            }
          />
          <Route
            path="/search"
            element={
              <MemberRoute>
                <SearchPage />
              </MemberRoute>
            }
          />
          <Route
            path="/about"
            element={
              <MemberRoute>
                <AboutPage />
              </MemberRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <MemberRoute>
                <ArticlesPage />
              </MemberRoute>
            }
          />
          <Route
            path="/webinars"
            element={
              <MemberRoute>
                <WebinarsPage />
              </MemberRoute>
            }
          />
          {/* PROFILE ROUTE - MOVED INSIDE Routes */}
          <Route
            path="/profile"
            element={
              <MemberRoute>
                <ProfilePage />
              </MemberRoute>
            }
          />

          <Route
            path="/settings"
              element={
               <MemberRoute>
                <SettingsPage />
              </MemberRoute>
            }
          />

          {/* ---------- PROTECTED ADMIN ROUTES ---------- */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/add-book"
            element={
              <AdminRoute>
                <AddBookPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-books"
            element={
              <AdminRoute>
                <ManageBooksPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;