// import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
// import { Link } from "react-router-dom";

// const SignInPage = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-900">Sign in to Comversity</h2>
//           <p className="mt-2 text-gray-600">
//             Welcome back! Please sign in to continue
//           </p>
//         </div>

//         <ClerkSignIn
//           routing="path"
//           path="/sign-in"
//           signUpUrl="/sign-up"
//           fallbackRedirectUrl="/dashboard"   // ✅ new Clerk prop
//           appearance={{
//             elements: {
//               rootBox: "w-full",
//               card: "shadow-lg rounded-xl border-0 bg-transparent",
//               header: "hidden",
//               headerTitle: "hidden",
//               headerSubtitle: "hidden",
//               socialButtonsBlock: "hidden",
//               socialButtons: "hidden",
//               divider: "hidden",
//               form: "space-y-4",
//               formHeader: "hidden",
//               formFieldInput:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formFieldInput__identifier:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formFieldInput__password:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formButtonPrimary:
//                 "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl w-full transition-colors duration-200",
//               footer: "hidden",
//               formFieldLabel: "text-sm font-medium text-gray-700 mb-2 block",
//             },
//             variables: {
//               colorPrimary: "#2563eb",
//               colorText: "#374151",
//               colorTextSecondary: "#6b7280",
//               colorBackground: "#ffffff",
//               colorInputBackground: "#ffffff",
//               colorInputText: "#374151",
//             },
//             layout: {
//               socialButtonsPlacement: "none",
//             },
//           }}
//         />

//         <p className="text-center text-gray-600 mt-4">
//           Don’t have an account?{" "}
//           <Link
//             to="/sign-up"
//             className="font-semibold text-blue-600 hover:text-blue-500"
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignInPage;



import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to Comversity</h2>
          <p className="mt-2 text-gray-600">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/auth-redirect"  // ✅ CHANGED: Redirect to our custom component
          fallbackRedirectUrl="/auth-redirect" // ✅ CHANGED
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg rounded-xl border-0 bg-transparent",
              header: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlock: "hidden",
              socialButtons: "hidden",
              divider: "hidden",
              form: "space-y-4",
              formHeader: "hidden",
              formFieldInput:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formFieldInput__identifier:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formFieldInput__password:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl w-full transition-colors duration-200",
              footer: "hidden",
              formFieldLabel: "text-sm font-medium text-gray-700 mb-2 block",
            },
            variables: {
              colorPrimary: "#2563eb",
              colorText: "#374151",
              colorTextSecondary: "#6b7280",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#374151",
            },
            layout: {
              socialButtonsPlacement: "none",
            },
          }}
        />

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
