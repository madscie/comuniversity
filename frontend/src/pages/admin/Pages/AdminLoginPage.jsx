// // src/pages/admin/Pages/AdminLoginPage.jsx
// import AdminLoginModal from "../AdminLoginModal";

// const AdminLoginPage = () => {
//   const handleClose = () => {
//     window.location.href = "/"; // Use direct navigation instead of navigate()
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
//       <AdminLoginModal isOpen={true} onClose={handleClose} />
//     </div>
//   );
// };

// export default AdminLoginPage;







import { SignIn } from '@clerk/clerk-react';

const AdminLoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Access the admin dashboard</p>
        </div>
        
        <SignIn 
          redirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded',
              card: 'shadow-lg rounded-lg border-0',
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdminLoginPage;