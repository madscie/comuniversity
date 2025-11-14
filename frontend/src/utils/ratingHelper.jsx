import { FiStar } from "react-icons/fi";

export const renderStars = (rating, size = "h-4 w-4") => {
  const normalizedRating = rating || 0;
  return Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      className={`${size} ${
        i < Math.floor(normalizedRating)
          ? "text-yellow-400 fill-current"
          : "text-gray-300 dark:text-gray-600"
      }`}
    />
  ));
};

export const calculateAverageRating = (ratings = []) => {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
};
