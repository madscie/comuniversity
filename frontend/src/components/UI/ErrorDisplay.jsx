// components/UI/ErrorDisplay.jsx
const ErrorDisplay = ({ error, type = "field" }) => {
  if (!error) return null;

  const getErrorStyle = () => {
    switch (type) {
      case "field":
        return "text-red-500 text-sm mt-2 flex items-start bg-red-50 p-3 rounded-lg border border-red-200";
      case "form":
        return "text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200 mb-4";
      case "warning":
        return "text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200";
      default:
        return "text-red-500 text-sm mt-2";
    }
  };

  return (
    <div className={getErrorStyle()}>
      <div className="flex items-start">
        <span className="mr-2 mt-0.5 flex-shrink-0">❌</span>
        <span className="flex-1">{error}</span>
      </div>
    </div>
  );
};

export default ErrorDisplay;
