// src/components/UI/Button.jsx
import { componentClasses } from "./TailwindColors";

const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  const getVariantClasses = () => {
      switch (variant) {
        case "primary":
          return componentClasses.btn.primary;
        case "secondary":
          return componentClasses.btn.secondary;
        case "success":
          return componentClasses.btn.success;
        case "outline":
          return componentClasses.btn.outline;
        case "ghost":
          return componentClasses.btn.ghost;
        default:
          return componentClasses.btn.primary;
      }
    };
  
  const disabledClasses = disabled 
      ? "opacity-50 cursor-not-allowed" 
      : "cursor-pointer active:scale-95";

  return (
    <button
      type={type}
      // className={`${baseClasses} ${variants[variant]} ${className}`}
      // onClick={onClick}
      className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getVariantClasses()} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
