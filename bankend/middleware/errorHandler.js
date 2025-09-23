// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);

  // Default error
  let error = { 
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry found';
  } else if (err.code === 'ER_NO_REFERENCED_ROW') {
    error.message = 'Referenced row does not exist';
  }

  res.status(err.status || 500).json(error);
};