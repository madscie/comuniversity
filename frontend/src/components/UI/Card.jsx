const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
