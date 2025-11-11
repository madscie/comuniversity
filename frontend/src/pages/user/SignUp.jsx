// import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
// import { Link } from "react-router-dom";

// const SignUpPage = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
//           <p className="mt-2 text-gray-600">
//             Join Comversity and start your learning journey
//           </p>
//         </div>

//         <ClerkSignUp
//           routing="path"
//           path="/sign-up"
//           signInUrl="/sign-in"
//           // ✅ Updated Clerk redirect props
//           forceRedirectUrl="/verify"          // replaces afterSignUpUrl
//           fallbackRedirectUrl="/dashboard"    // replaces afterSignInUrl
//           appearance={{
//             elements: {
//               rootBox: "w-full",
//               card: "shadow-lg rounded-xl border-0 bg-transparent",
//               header: "hidden",
//               headerTitle: "hidden",
//               headerSubtitle: "hidden",
//               headerTitleText: "hidden",
//               headerTitleTextContainer: "hidden",
//               socialButtonsBlock: "hidden",
//               socialButtons: "hidden",
//               socialButtonsBlockButton: "hidden",
//               divider: "hidden",
//               dividerLine: "hidden",
//               dividerText: "hidden",
//               form: "space-y-4",
//               formHeader: "hidden",
//               formFieldInput:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formFieldInput__firstName:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formFieldInput__lastName:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formFieldInput__emailAddress:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formFieldInput__password:
//                 "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
//               formButtonPrimary:
//                 "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl w-full transition-colors duration-200",
//               footer: "hidden",
//               footerAction: "hidden",
//               footerActionLink: "hidden",
//               alternativeMethods: "hidden",
//               identityPreview: "hidden",
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
//               socialButtonsVariant: "iconButton",
//             },
//           }}
//         />

//         <p className="text-center text-gray-600 mt-4">
//           Already have an account?{" "}
//           <Link
//             to="/sign-in"
//             className="font-semibold text-blue-600 hover:text-blue-500"
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;



import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Join Comversity and start your learning journey
          </p>
        </div>

        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/auth-redirect"      // ✅ CHANGED
          fallbackRedirectUrl="/auth-redirect" // ✅ CHANGED
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-lg rounded-xl border-0 bg-transparent",
              header: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              headerTitleText: "hidden",
              headerTitleTextContainer: "hidden",
              socialButtonsBlock: "hidden",
              socialButtons: "hidden",
              socialButtonsBlockButton: "hidden",
              divider: "hidden",
              dividerLine: "hidden",
              dividerText: "hidden",
              form: "space-y-4",
              formHeader: "hidden",
              formFieldInput:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formFieldInput__firstName:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formFieldInput__lastName:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formFieldInput__emailAddress:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formFieldInput__password:
                "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl w-full transition-colors duration-200",
              footer: "hidden",
              footerAction: "hidden",
              footerActionLink: "hidden",
              alternativeMethods: "hidden",
              identityPreview: "hidden",
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
              socialButtonsVariant: "iconButton",
            },
          }}
        />

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
