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
  FiInfo,
  FiUserPlus,
  FiArchive,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiSettings,
} from "react-icons/fi";
import { FaDesktop } from "react-icons/fa";
import UserProfile from "../UserProfile/UserProfile";

// Define navigation items for the navbar
const navigation = [
  { name: "Home", href: "/", icon: FiHome },
  { name: "Browse", href: "/browse", icon: FiBookOpen },
  { name: "Search", href: "/search", icon: FiSearch },
  { name: "About Us", href: "/about", icon: FiInfo },
  { name: "Webinars", href: "/webinars", icon: FaDesktop },
];

// Helper function to combine CSS classes
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  // Define pages where we want to HIDE the navbar and footer
  // This includes login, signup, and admin login pages
  const hideNavbarPaths = ['/login', '/signup', '/admin/login'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conditionally render the navbar based on current page */}
      {/* Only show navbar if we're NOT on login, signup, or admin login pages */}
      {shouldShowNavbar && (
        <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  {/* Logo and main navigation section */}
                  <div className="flex items-center">
                    <Link to="/" className="flex-shrink-0 flex items-center">
                      <FiBookOpen className="h-8 w-8 text-blue-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                        Communiversity Library
                      </span>
                    </Link>

                    {/* Desktop navigation links - hidden on mobile */}
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

                  {/* Right side items - user profile, auth buttons, etc. */}
                  <div className="flex items-center space-x-4">
                    {/* Authentication section */}
                    {isAuthenticated ? (
                      <div className="flex items-center space-x-4">
                        {/* User Profile Dropdown for authenticated users */}
                        <Menu as="div" className="relative">
                          <Menu.Button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <UserProfile 
                              user={user} 
                              size="small" 
                              showName={true}
                              className="hidden sm:flex"
                            />
                            
                            {/* Mobile view - just the profile picture without name */}
                            <div className="sm:hidden">
                              <UserProfile user={user} size="small" />
                            </div>
                          </Menu.Button>

                          {/* Dropdown menu with smooth transition */}
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {/* User info header in dropdown */}
                              <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">
                                  {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {user?.email}
                                </p>
                              </div>
                              
                              {/* Dropdown menu items */}
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <Link
                                      to="/profile"
                                      className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'flex items-center px-4 py-2 text-sm'
                                      )}
                                    >
                                      <FiUser className="h-4 w-4 mr-3" />
                                      My Profile
                                    </Link>
                                  )}
                                </Menu.Item>
                                
                                <Menu.Item>
                                  {({ active }) => (
                                    <Link
                                      to="/settings"
                                      className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'flex items-center px-4 py-2 text-sm'
                                      )}
                                    >
                                      <FiSettings className="h-4 w-4 mr-3" />
                                      Settings
                                    </Link>
                                  )}
                                </Menu.Item>
                              </div>
                              
                              {/* Logout option */}
                              <div className="py-1 border-t border-gray-100">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={logout}
                                      className={classNames(
                                        active ? 'bg-gray-100 text-red-600' : 'text-red-500',
                                        'flex w-full items-center px-4 py-2 text-sm'
                                      )}
                                    >
                                      <FiLogOut className="h-4 w-4 mr-3" />
                                      Sign out
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    ) : (
                      // Show these buttons when user is NOT authenticated
                      <div className="flex items-center space-x-3">
                        {/* Admin Login Link - hidden on mobile */}
                        <Link
                          to="/admin/login"
                          className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <FiBarChart2 className="h-5 w-5 mr-1" />
                          Admin Login
                        </Link>

                        {/* Sign Up Button */}
                        <Link
                          to="/signup"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                        >
                          <FiUserPlus className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Sign Up</span>
                        </Link>
                      </div>
                    )}

                    {/* Mobile menu button - only visible on small screens */}
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

              {/* Mobile menu panel - appears when menu button is clicked */}
              <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                  {/* Mobile navigation links */}
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

                  {/* Show user info in mobile menu when authenticated */}
                  {isAuthenticated && user && (
                    <div className="px-3 py-2 border-t border-gray-200">
                      <div className="flex items-center">
                        <UserProfile user={user} size="small" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* Mobile menu user options */}
                      <div className="mt-3 space-y-1">
                        <Disclosure.Button
                          as={Link}
                          to="/profile"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <FiUser className="h-5 w-5 mr-3" />
                          My Profile
                        </Disclosure.Button>
                        
                        <Disclosure.Button
                          as={Link}
                          to="/settings"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <FiSettings className="h-5 w-5 mr-3" />
                          Settings
                        </Disclosure.Button>
                        
                        <Disclosure.Button
                          onClick={logout}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
                        >
                          <FiLogOut className="h-5 w-5 mr-3" />
                          Sign out
                        </Disclosure.Button>
                      </div>
                    </div>
                  )}

                  {/* Show auth links in mobile menu when NOT authenticated */}
                  {!isAuthenticated && (
                    <>
                      <Disclosure.Button
                        as={Link}
                        to="/admin/login"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <FiBarChart2 className="h-5 w-5 mr-3" />
                        Admin Login
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        to="/signup"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FiUserPlus className="h-5 w-5 mr-3" />
                        Sign Up
                      </Disclosure.Button>
                    </>
                  )}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}

      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      {/* Conditionally render the footer - same logic as navbar */}
      {/* Only show footer if we're NOT on login, signup, or admin login pages */}
      {shouldShowNavbar && (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
          <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">About Us</h4>
              <p className="text-sm leading-relaxed">
                Communiversity Library is a digital-first initiative to make
                knowledge accessible globally. Explore, learn, and grow with
                2,500+ books and resources.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="hover:text-white transition-colors flex items-center"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Archives Section */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Archives</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/archives/2024"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <FiArchive className="h-4 w-4 mr-2" /> 2024
                  </Link>
                </li>
                <li>
                  <Link
                    to="/archives/2023"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <FiArchive className="h-4 w-4 mr-2" /> 2023
                  </Link>
                </li>
                <li>
                  <Link
                    to="/archives/2022"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <FiArchive className="h-4 w-4 mr-2" /> 2022
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">
                Connect With Us
              </h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition"
                >
                  <FiTwitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-800 transition"
                >
                  <FiFacebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-700 transition"
                >
                  <FiLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer bottom bar with copyright */}
          <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Communiversity Digital Library. All
              rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;