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

  // Wait until Clerk auth is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Add dynamic navigation for affiliates
  const getNavigation = () => {
    const nav = [...baseNavigation];

    if (isSignedIn && user) {
      const isAffiliate = user.publicMetadata?.isAffiliate || false;
      const affiliateStatus = user.publicMetadata?.affiliateStatus || "not_applied";

      if (isAffiliate || affiliateStatus === "pending") {
        nav.push({ name: "Affiliate", href: "/affiliate-dashboard", icon: FiDollarSign });
      } else if (affiliateStatus === "not_applied") {
        nav.push({ name: "Become Affiliate", href: "/affiliate-signup", icon: FiDollarSign });
      }
    }

    return nav;
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 flex items-center">
                    <FiBookOpen className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                      Communiversity Library
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

                {/* Right Side */}
                <div className="flex items-center space-x-4">
                  {isSignedIn ? (
                    <ProfileDropdown />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link
                        to="/sign-up"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                      >
                        <FiUserPlus className="h-4 w-4 mr-1" />
                        Sign Up
                      </Link>
                      <Link
                        to="/sign-in"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                      >
                        <FiUser className="h-4 w-4 mr-1" />
                        Sign In
                      </Link>
                    </div>
                  )}

                  {/* Mobile Menu Button */}
                  <div className="sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
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

                {!isSignedIn && (
                  <>
                    <Disclosure.Button
                      as={Link}
                      to="/sign-in?redirect=/admin/dashboard"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <FiBarChart2 className="h-5 w-5 mr-3" />
                      Admin Login
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/sign-up"
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

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">About Us</h4>
            <p className="text-sm leading-relaxed">
              Communityersity Library is a digital-first initiative to make knowledge accessible globally.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="hover:text-white flex items-center">
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
                  <Link to={`/archives/${year}`} className="hover:text-white flex items-center">
                    <FiArchive className="h-4 w-4 mr-2" />
                    {year}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-800 transition">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-700 transition">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Communityersity Digital Library. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;