// Request logger middleware
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.path}`);

  if (Object.keys(req.body).length > 0 && req.path !== "/auth/login") {
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  }

  if (req.files) {
    console.log("📁 Uploaded Files:", Object.keys(req.files));
  }

  if (req.file) {
    console.log("📄 Single File:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  }

  next();
};

// Error logger middleware
export const errorLogger = (error, req, res, next) => {
  console.error("❌ Error occurred:");
  console.error("URL:", req.method, req.url);
  console.error("Error Name:", error.name);
  console.error("Error Message:", error.message);
  console.error("Stack:", error.stack);

  if (error.response) {
    console.error("API Response Error:", error.response.data);
  }

  next(error);
};
