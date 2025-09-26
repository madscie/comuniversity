// src/pages/admin/Pages/AdminLoginPage.jsx
import AdminLoginModal from "../AdminLoginModal";

const AdminLoginPage = () => {
  const handleClose = () => {
    window.location.href = "/"; // Use direct navigation instead of navigate()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <AdminLoginModal isOpen={true} onClose={handleClose} />
    </div>
  );
};

export default AdminLoginPage;
