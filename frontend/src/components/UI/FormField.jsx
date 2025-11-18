const FormField = ({
  label,
  error,
  children,
  icon: Icon,
  required = false,
  className = "",
  helpText = "",
  fieldName = "", // Add fieldName for better error handling
}) => {
  const getErrorMessage = (error) => {
    if (!error) return null;

    // Extract emoji and message for better formatting
    const emojiMatch = error.match(/^([^\s]+\s)/);
    const emoji = emojiMatch ? emojiMatch[1] : "❌";
    const message = error.replace(/^([^\s]+\s)/, "");

    return (
      <p className="text-red-500 text-sm mt-2 flex items-start">
        <span className="mr-2 mt-0.5 flex-shrink-0">{emoji}</span>
        <span className="flex-1">{message}</span>
      </p>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className} ${
        error ? "border-red-300 bg-red-50/30" : ""
      }`}
    >
      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
        {Icon && <Icon className="mr-2 h-4 w-4 text-green-500" />}
        {label}
        {required && (
          <span
            className="text-xs text-red-500 ml-2 font-normal"
            title="This field is required"
          >
            (required)
          </span>
        )}
        {!required && (
          <span className="text-xs text-gray-500 ml-2 font-normal">
            (optional)
          </span>
        )}
      </label>

      <div className={error ? "ring-1 ring-red-300 rounded-lg" : ""}>
        {children}
      </div>

      {helpText && !error && (
        <p className="text-xs text-gray-600 mt-2">{helpText}</p>
      )}

      {getErrorMessage(error)}
    </div>
  );
};

export default FormField;
