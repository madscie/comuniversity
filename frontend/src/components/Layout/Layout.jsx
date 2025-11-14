import { Fragment } from "react";
import { Disclosure } from "@headlessui/react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiUser,
  FiBarChart2,
  FiMenu,
  FiX,
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
import { componentClasses } from "../UI/TailwindColors";

// Enhanced Loading Spinner Component
const LoadingSpinner = ({ size = "medium" }) => {
  const sizes = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizes[size]} border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin`}
        ></div>
      </div>
    </div>
  );
};

const baseNavigation = [
  { name: "Home", href: "/", icon: FiHome },
  { name: "Browse", href: "/browse", icon: FiBookOpen },
  { name: "Articles", href: "/articles", icon: PiArticleNyTimes },
  { name: "Webinars", href: "/webinars", icon: FaDesktop },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Layout = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  // Wait until Clerk auth is loaded with enhanced loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Loading Library...
          </p>
        </div>
      </div>
    );
  }

  // Add dynamic navigation for affiliates
  const getNavigation = () => {
    const nav = [...baseNavigation];

    if (isSignedIn && user) {
      const isAffiliate = user.publicMetadata?.isAffiliate || false;
      const affiliateStatus =
        user.publicMetadata?.affiliateStatus || "not_applied";

      if (isAffiliate || affiliateStatus === "pending") {
        nav.push({
          name: "Affiliate",
          href: "/affiliate-dashboard",
          icon: FiDollarSign,
        });
      } else if (affiliateStatus === "not_applied") {
        nav.push({
          name: "Become Affiliate",
          href: "/affiliate-signup",
          icon: FiDollarSign,
        });
      }
    }

    return nav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* NAVBAR */}
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
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-700 to-green-600 rounded-3xl flex items-center justify-center">
                      <FiBookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span className="ml-2 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white xs:block">
                      Communiversity
                    </span>
                    <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                      Library
                    </span>
                  </Link>

                  {/* Desktop Menu */}
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center space-x-4">
                  {isSignedIn ? (
                    <ProfileDropdown />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link
                        to="/sign-up"
                        className={`${componentClasses.btn.primary} px-4 py-2 text-sm font-medium flex items-center transition-colors`}
                      >
                        <FiUserPlus className="h-4 w-4 mr-1" />
                        Sign Up
                      </Link>
                      <Link
                        to="/sign-in"
                        className={`${componentClasses.btn.secondary} px-4 py-2 text-sm font-medium flex items-center transition-colors`}
                      >
                        <FiUser className="h-4 w-4 mr-1" />
                        Sign In
                      </Link>
                    </div>
                  )}

                  {/* Mobile Menu Button */}
                  <div className="sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors duration-200">
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

            {/* Mobile Menu */}
            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className={classNames(
                        isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                        "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Disclosure.Button>
                  );
                })}

                {!isSignedIn && (
                  <>
                    <Disclosure.Button
                      as={Link}
                      to="/sign-in?redirect=/admin/dashboard"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                      <FiBarChart2 className="h-5 w-5 mr-3" />
                      Admin Login
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/sign-up"
                      className={`${componentClasses.btn.primary} flex items-center px-3 py-2 rounded-md text-base font-medium mx-2`}
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

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-4 py-8 transition-colors duration-300">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-300 mt-auto transition-colors duration-300">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">About Us</h4>
            <p className="text-sm leading-relaxed">
              Communiversity Library is a digital-first initiative to make
              knowledge accessible globally.
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
                    className="hover:text-white flex items-center transition-colors duration-200"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Archives */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Archives</h4>
            <ul className="space-y-2 text-sm">
              {[2024, 2023, 2022].map((year) => (
                <li key={year}>
                  <Link
                    to={`/archives/${year}`}
                    className="hover:text-white flex items-center transition-colors duration-200"
                  >
                    <FiArchive className="h-4 w-4 mr-2" />
                    {year}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Connect With Us
            </h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-gray-800 dark:bg-gray-700 rounded-full hover:bg-green-600 transition-colors duration-200"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 dark:bg-gray-700 rounded-full hover:bg-green-700 transition-colors duration-200"
              >
                <FiFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 dark:bg-gray-700 rounded-full hover:bg-green-800 transition-colors duration-200"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Communiversity Digital Library. All
          rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
