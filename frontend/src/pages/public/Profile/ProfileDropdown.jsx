// import { Fragment } from "react";
// import { Menu, Transition } from "@headlessui/react";
// import { Link } from "react-router-dom";
// import { FiUser, FiSettings, FiLogOut, FiBook } from "react-icons/fi";
// import { useAuthStore } from "../../../store/authStore";

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// const ProfileDropdown = () => {
//   const { user, logout } = useAuthStore();

//   const handleLogout = () => {
//     logout();
//   };

//   return (
//     <Menu as="div" className="relative ml-3">
//       <div>
//         <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
//           <span className="sr-only">Open user menu</span>
//           <div className="flex items-center space-x-2">
//             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
//               <FiUser className="h-4 w-4 text-blue-600" />
//             </div>
//             <span className="hidden md:block text-sm text-gray-700">
//               Hi, {user?.name}
//             </span>
//           </div>
//         </Menu.Button>
//       </div>
//       <Transition
//         as={Fragment}
//         enter="transition ease-out duration-100"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//           {/* User Info */}
//           <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
//             <p className="font-medium text-gray-900 truncate">{user?.name}</p>
//             <p className="truncate">{user?.email}</p>
//           </div>

//           {/* Profile Link */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/profile"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiUser className="h-4 w-4 mr-2" />
//                 Your Profile
//               </Link>
//             )}
//           </Menu.Item>

//           {/* My Books/Reading List */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/my-books"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiBook className="h-4 w-4 mr-2" />
//                 My Books
//               </Link>
//             )}
//           </Menu.Item>

//           {/* Settings */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/settings"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiSettings className="h-4 w-4 mr-2" />
//                 Settings
//               </Link>
//             )}
//           </Menu.Item>

//           {/* Divider */}
//           <div className="border-t border-gray-100 my-1"></div>

//           {/* Logout */}
//           <Menu.Item>
//             {({ active }) => (
//               <button
//                 onClick={handleLogout}
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center w-full px-4 py-2 text-sm text-red-600"
//                 )}
//               >
//                 <FiLogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </button>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );
// };

// export default ProfileDropdown;



// import { Fragment } from "react";
// import { Menu, Transition } from "@headlessui/react";
// import { Link } from "react-router-dom";
// import { FiUser, FiSettings, FiLogOut, FiBook, FiBookOpen } from "react-icons/fi";
// import { useAuthStore } from "../../../store/clerkAuthStore";

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// const ProfileDropdown = () => {
//   const { user, logout } = useAuthStore();

//   const handleLogout = () => {
//     logout();
//   };

//   return (
//     <Menu as="div" className="relative ml-3">
//       <div>
//         <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
//           <span className="sr-only">Open user menu</span>
//           <div className="flex items-center space-x-2">
//             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
//               <FiUser className="h-4 w-4 text-blue-600" />
//             </div>
//             <span className="hidden md:block text-sm text-gray-700">
//               Hi, {user?.name}
//             </span>
//           </div>
//         </Menu.Button>
//       </div>
//       <Transition
//         as={Fragment}
//         enter="transition ease-out duration-100"
//         enterFrom="transform opacity-0 scale-95"
//         enterTo="transform opacity-100 scale-100"
//         leave="transition ease-in duration-75"
//         leaveFrom="transform opacity-100 scale-100"
//         leaveTo="transform opacity-0 scale-95"
//       >
//         <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//           {/* User Info */}
//           <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
//             <p className="font-medium text-gray-900 truncate">{user?.name}</p>
//             <p className="truncate">{user?.email}</p>
//           </div>

//           {/* Profile Link */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/profile"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiUser className="h-4 w-4 mr-2" />
//                 Your Profile
//               </Link>
//             )}
//           </Menu.Item>

//           {/* My Library - NEW */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/my-library"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiBookOpen className="h-4 w-4 mr-2" />
//                 My Library
//               </Link>
//             )}
//           </Menu.Item>

//           {/* My Books/Reading List */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/my-books"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiBook className="h-4 w-4 mr-2" />
//                 My Books
//               </Link>
//             )}
//           </Menu.Item>

//           {/* Settings */}
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 to="/settings"
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center px-4 py-2 text-sm text-gray-700"
//                 )}
//               >
//                 <FiSettings className="h-4 w-4 mr-2" />
//                 Settings
//               </Link>
//             )}
//           </Menu.Item>

//           {/* Divider */}
//           <div className="border-t border-gray-100 my-1"></div>

//           {/* Logout */}
//           <Menu.Item>
//             {({ active }) => (
//               <button
//                 onClick={handleLogout}
//                 className={classNames(
//                   active ? "bg-gray-100" : "",
//                   "flex items-center w-full px-4 py-2 text-sm text-red-600"
//                 )}
//               >
//                 <FiLogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </button>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );
// };

// export default ProfileDropdown;




import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";
import { FiUser, FiSettings, FiLogOut, FiBook, FiBookOpen } from "react-icons/fi";
import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { componentClasses,colorMap,} from "../../../components/UI/TailwindColors";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ProfileDropdown = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.username || "User";
  };

  // Get user email
  const getUserEmail = () => {
    return user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
          <span className="sr-only">Open user menu</span>
          <div className="flex items-center space-x-2">
            {user?.imageUrl ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user.imageUrl}
                alt={`${getUserDisplayName()}'s profile`}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                <FiUser className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
              {/* Hi, {user?.name || user?.email?.split("@")[0]} */}
              Hi, {getUserDisplayName()}
            </span>
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user?.name || "User"}
              {getUserDisplayName()}</p>
            <p className="truncate">{getUserEmail()}</p>
          </div>

          {/* Profile Link */}
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={classNames(
                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                )}
              >
                <FiUser className="h-4 w-4 mr-2" />
                Your Profile
              </Link>
            )}
          </Menu.Item>

          {/* My Library */}
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/my-library"
                className={classNames(
                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                )}
              >
                <FiBookOpen className="h-4 w-4 mr-2" />
                My Library
              </Link>
            )}
          </Menu.Item>

          {/* My Books/Reading List */}
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/my-books"
                className={classNames(
                 active ? "bg-gray-100 dark:bg-gray-700" : "",
                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                )}
              >
                <FiBook className="h-4 w-4 mr-2" />
                My Books
              </Link>
            )}
          </Menu.Item>

          {/* Settings */}
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/settings"
                className={classNames(
                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                  "flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200"
                )}
              >
                <FiSettings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            )}
          </Menu.Item>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

          {/* Logout */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={classNames(
                  active ? "bg-gray-100 dark:bg-gray-700" : "",
                  "flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200"
                )}
              >
                <FiLogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ProfileDropdown;