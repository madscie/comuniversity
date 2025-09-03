const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    gradient:
      "bg-gradient-to-r from-sky-400 to-emerald-600 text-white hover:from-sky-500 hover:to-emerald-700 focus:ring-emerald-500",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
