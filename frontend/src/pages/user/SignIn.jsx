import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { componentClasses } from "../../components/UI/TailwindColors";

// Enhanced Loading Spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="relative">
      <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
    </div>
  </div>
);

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-green-600 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to Communiversity
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/auth-redirect"
          fallbackRedirectUrl="/auth-redirect"
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
                "w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              formFieldInput__identifier:
                "w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              formFieldInput__password:
                "w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              formButtonPrimary: `${componentClasses.btn.primary} font-bold py-3 px-4 rounded-xl w-full transition-all duration-200 hover:scale-105`,
              footer: "hidden",
              formFieldLabel:
                "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block",
              formFieldAction:
                "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
              formFieldSuccessText: "text-green-600 dark:text-green-400",
              formFieldErrorText: "text-red-600 dark:text-red-400",
              footerActionLink:
                "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
            },
            variables: {
              colorPrimary: "#059669",
              colorText: "#374151",
              colorTextOnPrimaryBackground: "#ffffff",
              colorTextSecondary: "#6b7280",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#374151",
              colorDanger: "#dc2626",
            },
            layout: {
              socialButtonsPlacement: "none",
            },
          }}
        />

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
