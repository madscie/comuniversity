import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { useAuthStore } from "../../store/authStore";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiSearch,
  FiUser,
  FiLogOut,
  FiBarChart2,
  FiMenu,
  FiX,
} from "react-icons/fi";

const navigation = [
  { name: "Home", href: "/", icon: FiHome },
  { name: "Browse", href: "/browse", icon: FiBookOpen },
  { name: "Search", href: "/search", icon: FiSearch },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo and main nav */}
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 flex items-center">
                    <FiBookOpen className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                      Communityersity Library
                    </span>
                  </Link>

                  {/* Desktop navigation */}
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            isActive
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Right side items */}
                <div className="flex items-center space-x-4">
                  {/* Auth section */}
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700 flex items-center">
                        <FiUser className="h-5 w-5 mr-1" />
                        Hi, {user?.name}
                      </span>
                      <button
                        onClick={logout}
                        className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <FiLogOut className="h-5 w-5 mr-1" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/admin/login"
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <FiBarChart2 className="h-5 w-5 mr-1" />
                      Admin Login
                    </Link>
                  )}

                  {/* Mobile menu button */}
                  <div className="sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <FiX className="h-6 w-6" />
                      ) : (
                        <FiMenu className="h-6 w-6" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className={classNames(
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        "flex items-center px-3 py-2 rounded-md text-base font-medium"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Disclosure.Button>
                  );
                })}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Communityersity Digital Library. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
