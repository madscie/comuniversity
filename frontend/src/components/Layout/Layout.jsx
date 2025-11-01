// src/components/Layout/Layout.jsx
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
  FiDollarSign,
} from "react-icons/fi";
import { FaDesktop } from "react-icons/fa";
import { PiArticleNyTimes } from "react-icons/pi";
import ProfileDropdown from "../../pages/public/Profile/ProfileDropdown";
import { componentClasses, colorMap } from "../UI/TailwindColors";

// Option 1: If you have a logo image file, import it like this:
import logo from "../../assets/logo.jpg"; // Make sure the path is correct

// Option 2: Or use an icon as fallback (current approach)
const LogoIcon = FiBookOpen;

const navigation = [
  { name: "Home", href: "/", icon: FiHome },
  { name: "Browse", href: "/browse", icon: FiBookOpen },
  { name: "Articles", href: "/articles", icon: PiArticleNyTimes },
  { name: "Webinars", href: "/webinars", icon: FaDesktop },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  // Dynamic navigation based on user status
  const getNavigation = () => {
    const baseNav = [...navigation];

    // Add affiliate link if user is affiliate or can apply
    if (isAuthenticated && user) {
      if (user.isAffiliate || user.affiliateStatus === "pending") {
        baseNav.push({
          name: "Affiliate",
          href: "/affiliate-dashboard",
          icon: FiDollarSign,
        });
      } else if (user.affiliateStatus === "not_applied") {
        baseNav.push({
          name: "Become Affiliate",
          href: "/affiliate-signup",
          icon: FiDollarSign,
        });
      }
    }

    return baseNav;
  };

  const currentNavigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Disclosure
        as="nav"
        className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
              <div className="flex justify-between h-14 sm:h-16">
                {/* Logo and main nav */}
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 flex items-center">
                    {/* Option 1: Using an image logo */}
                    <img
                      src={logo}
                      alt="Communiversity Library"
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-3xl"
                    />

                    {/* Option 2: Using an icon as logo (current approach) */}
                    {/* <LogoIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-gray-800 dark:text-gray-200" /> */}

                    <span className="ml-2 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white  xs:block">
                      Communiversity
                    </span>
                    <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:block ">
                      Library
                    </span>
                  </Link>

                  {/* Desktop navigation */}
                  <div className="hidden sm:ml-4 lg:ml-6 sm:flex sm:space-x-1 lg:space-x-2">
                    {currentNavigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            isActive
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                            "flex items-center px-2 py-1 lg:px-3 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200"
                          )}
                        >
                          {/* Using React Icons - CORRECT WAY */}
                          <item.icon className="h-3 w-3 lg:h-4  lg:w-4 mr-1 lg:mr-2" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Right side items */}
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                  {isAuthenticated ? (
                    <ProfileDropdown />
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Link
                        to="/login"
                        className={`px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center transition-colors duration-200 ${componentClasses.btn.secondary} dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700`}
                      >
                        {/* Using React Icons */}
                        <FiUser className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">Login</span>
                      </Link>
                      <Link
                        to="/signup"
                        className={`px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center transition-colors duration-200 ${componentClasses.btn.primary}`}
                      >
                        {/* Using React Icons */}
                        <FiUserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden xs:inline">Sign Up</span>
                      </Link>
                    </div>
                  )}

                  {/* Mobile menu button */}
                  <div className="sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors duration-200">
                      <span className="sr-only">Open main menu</span>
                      {/* Using React Icons */}
                      {open ? (
                        <FiX className="h-5 w-5" />
                      ) : (
                        <FiMenu className="h-5 w-5" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                {currentNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className={classNames(
                        isActive
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                        "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                      )}
                    >
                      {/* Using React Icons */}
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                      {item.name}
                    </Disclosure.Button>
                  );
                })}

                {!isAuthenticated && (
                  <>
                    <Disclosure.Button
                      as={Link}
                      to="/admin/login"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                      {/* Using React Icons */}
                      <FiBarChart2 className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                      Admin Login
                    </Disclosure.Button>
                  </>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="flex-grow container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 mt-auto transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div className="xs:col-span-2 sm:col-span-1 lg:col-span-1">
            <h4 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              About Us
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed">
              Communiversity Library is a digital-first initiative to make
              knowledge accessible globally. Explore, learn, and grow with
              2,500+ books and resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {currentNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="hover:text-white transition-colors duration-200 flex items-center"
                  >
                    {/* Using React Icons */}
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Archives */}
          <div>
            <h4 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Archives
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/archives/2024"
                  className="hover:text-white transition-colors duration-200 flex items-center"
                >
                  {/* Using React Icons */}
                  <FiArchive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  2024
                </Link>
              </li>
              <li>
                <Link
                  to="/archives/2023"
                  className="hover:text-white transition-colors duration-200 flex items-center"
                >
                  <FiArchive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  2023
                </Link>
              </li>
              <li>
                <Link
                  to="/archives/2022"
                  className="hover:text-white transition-colors duration-200 flex items-center"
                >
                  <FiArchive className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  2022
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="xs:col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Connect With Us
            </h4>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="#"
                className="p-2 bg-gray-700 dark:bg-gray-800 rounded-full hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {/* Using React Icons */}
                <FiTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-700 dark:bg-gray-800 rounded-full hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <FiFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-700 dark:bg-gray-800 rounded-full hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <FiLinkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <p>
            © {new Date().getFullYear()} Communiversity Digital Library. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
