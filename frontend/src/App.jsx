// // App.jsx
// import { Routes, Route } from "react-router-dom";
// import { useAuth } from "@clerk/clerk-react";
// import Layout from "./components/Layout/Layout";
// import AdminLayout from "./components/Layout/AdminLayout";

// // Public pages (no auth required)
// import SignInPage from "./pages/user/SignIn";
// import SignUpPage from "./pages/user/SignUp";

// // Protected pages
// import HomePage from "./pages/public/HomePage";
// import BrowsePage from "./pages/public/BrowsePage";
// import SearchPage from "./pages/public/SearchPage";
// import AboutPage from "./pages/public/AboutPage";
// import ArticlesPage from "./pages/public/ArticlesPage";
// import SingleArticlePage from "./pages/public/SingleArticlePage";
// import WebinarsPage from "./pages/public/webinars/WebinarsPage";
// import BookDetail from "./pages/public/BookDetail";
// import Profile from "./pages/public/Profile/ProfilePage";
// import MyLibraryPage from "./pages/public/MyLibraryPage";

// // Admin pages
// import DashboardPage from "./pages/admin/Pages/AdminDashboardPage";
// import AddBookPage from "./pages/admin/Pages/AddBookPage";
// import ManageBooksPage from "./pages/admin/Pages/ManageBooksPage";
// import ManageArticlesPage from "./pages/admin/Pages/ManageArticlesPage";
// import ManageAffiliatesPage from "./pages/admin/Pages/ManageAffiliatePage";
// import UserManagementPage from "./pages/admin/Pages/UserManagementPage";
// import ManageWebinarsPage from "./pages/admin/Pages/ManageWebinarsPage";

// // Affiliate pages
// import CheckoutDownloadPage from "./pages/payments/CheckoutPage";
// import AffiliateSignup from "./pages/affiliate/AffiliateSignup";
// import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
// import AffiliateStatus from "./pages/affiliate/AffiliateStatus";

// import MemberRoute from "./components/MemberRoute";
// import AdminRoute from "./components/AdminRoute";

// const App = () => {
//   const { isLoaded } = useAuth();

//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading application...</div>
//       </div>
//     );
//   }

//   return (
//     // REMOVED BrowserRouter from here - it's already in main.jsx
//     <Routes>
//       {/* PUBLIC ROUTES */}
//       <Route path="/sign-in" element={<SignInPage />} />
//       <Route path="/sign-up" element={<SignUpPage />} />

//       {/* PROTECTED ROUTES */}
//       <Route
//         path="/"
//         element={
//           <MemberRoute>
//             <Layout>
//               <HomePage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/browse"
//         element={
//           <MemberRoute>
//             <Layout>
//               <BrowsePage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/search"
//         element={
//           <MemberRoute>
//             <Layout>
//               <SearchPage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/about"
//         element={
//           <MemberRoute>
//             <Layout>
//               <AboutPage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/articles"
//         element={
//           <MemberRoute>
//             <Layout>
//               <ArticlesPage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/articles/:id"
//         element={
//           <MemberRoute>
//             <Layout>
//               <SingleArticlePage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/webinars"
//         element={
//           <MemberRoute>
//             <Layout>
//               <WebinarsPage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/books/:id"
//         element={
//           <MemberRoute>
//             <Layout>
//               <BookDetail />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/profile"
//         element={
//           <MemberRoute>
//             <Layout>
//               <Profile />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/my-library"
//         element={
//           <MemberRoute>
//             <Layout>
//               <MyLibraryPage />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/checkout/:bookId"
//         element={
//           <MemberRoute>
//             <Layout>
//               <CheckoutDownloadPage />
//             </Layout>
//           </MemberRoute>
//         }
//       />

//       {/* AFFILIATE ROUTES */}
//       <Route
//         path="/affiliate-signup"
//         element={
//           <MemberRoute>
//             <Layout>
//               <AffiliateSignup />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/affiliate-dashboard"
//         element={
//           <MemberRoute>
//             <Layout>
//               <AffiliateDashboard />
//             </Layout>
//           </MemberRoute>
//         }
//       />
//       <Route
//         path="/affiliate-status"
//         element={
//           <MemberRoute>
//             <Layout>
//               <AffiliateStatus />
//             </Layout>
//           </MemberRoute>
//         }
//       />

//       {/* ADMIN ROUTES */}
//       <Route
//         path="/admin/dashboard"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <DashboardPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin/manage-books"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <ManageBooksPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin/add-book"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <AddBookPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin/articles"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <ManageArticlesPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin/affiliates"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <ManageAffiliatesPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin/users"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <UserManagementPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin/manage-webinars"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <ManageWebinarsPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />
//       <Route
//         path="/admin"
//         element={
//           <AdminRoute>
//             <AdminLayout>
//               <DashboardPage />
//             </AdminLayout>
//           </AdminRoute>
//         }
//       />

//       {/* CATCH ALL - Redirect to home */}
//       <Route path="*" element={
//         <MemberRoute>
//           <Layout>
//             <HomePage />
//           </Layout>
//         </MemberRoute>
//       } />
//     </Routes>
//   );
// };

// export default App;







// App.jsx
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";

// Public pages (no auth required)
import SignInPage from "./pages/user/SignIn";
import SignUpPage from "./pages/user/SignUp";
import AuthRedirect from "./components/AuthRedirect"; // ✅ NEW IMPORT

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

const App = () => {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading application...</div>
      </div>
    );
  }

  return (
    // REMOVED BrowserRouter from here - it's already in main.jsx
    <Routes>
      {/* PUBLIC ROUTES - No authentication required */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/auth-redirect" element={<AuthRedirect />} /> {/* ✅ NEW ROUTE - Handles post-login redirects */}

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
      <Route path="*" element={
        <MemberRoute>
          <Layout>
            <HomePage />
          </Layout>
        </MemberRoute>
      } />
    </Routes>
  );
};

export default App;