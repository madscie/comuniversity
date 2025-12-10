// Request logger middleware (Enhanced for MongoDB)
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Attach request ID for tracking
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  console.log(`\n📥 [${timestamp}] ${req.method} ${req.path} | ID: ${requestId}`);
  console.log(`🔗 Source: ${req.ip} | User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);

  // Log query parameters (except sensitive ones)
  if (Object.keys(req.query).length > 0) {
    const safeQuery = { ...req.query };
    // Remove sensitive query parameters
    ['password', 'token', 'secret', 'key', 'auth'].forEach(sensitive => {
      if (safeQuery[sensitive]) {
        safeQuery[sensitive] = '***REDACTED***';
      }
    });
    console.log("🔍 Query Params:", JSON.stringify(safeQuery, null, 2));
  }

  // Log request body (except sensitive data)
  if (Object.keys(req.body).length > 0 && req.path !== "/auth/login") {
    const safeBody = { ...req.body };
    
    // Redact sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization', 'creditCard', 'cvv', 'ssn'];
    sensitiveFields.forEach(field => {
      if (safeBody[field]) {
        safeBody[field] = '***REDACTED***';
      }
    });
    
    // Also check nested objects
    const redactSensitive = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          redactSensitive(obj[key]);
        } else if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = '***REDACTED***';
        }
      }
    };
    
    redactSensitive(safeBody);
    
    console.log("📦 Request Body:", JSON.stringify(safeBody, null, 2).substring(0, 500) + (JSON.stringify(safeBody).length > 500 ? '...' : ''));
  }

  // Log uploaded files
  if (req.files) {
    console.log("📁 Uploaded Files:", Object.keys(req.files).map(key => ({
      field: key,
      count: Array.isArray(req.files[key]) ? req.files[key].length : 1,
      types: Array.isArray(req.files[key]) 
        ? [...new Set(req.files[key].map(f => f.mimetype))]
        : [req.files[key].mimetype]
    })));
  }

  if (req.file) {
    console.log("📄 Single File:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      encoding: req.file.encoding
    });
  }

  // Log user if authenticated
  if (req.user) {
    console.log(`👤 Authenticated User: ${req.user.email} (${req.user.role}) | ID: ${req.user._id}`);
  }

  // Log MongoDB operation time
  const originalSend = res.send;
  const startTime = Date.now();
  
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    res.responseTime = responseTime;
    
    console.log(`📤 Response Time: ${responseTime}ms | Status: ${res.statusCode}`);
    
    // Log response size
    if (body && typeof body === 'string') {
      console.log(`📊 Response Size: ${(body.length / 1024).toFixed(2)} KB`);
    } else if (body && typeof body === 'object') {
      const bodyStr = JSON.stringify(body);
      console.log(`📊 Response Size: ${(bodyStr.length / 1024).toFixed(2)} KB`);
    }
    
    return originalSend.call(this, body);
  };

  next();
};

// Error logger middleware (Enhanced for MongoDB)
export const errorLogger = (error, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.requestId || 'unknown';
  
  console.error(`\n❌ [${timestamp}] ERROR | Request ID: ${requestId}`);
  console.error(`🔗 URL: ${req.method} ${req.url}`);
  console.error(`👤 User: ${req.user?.email || 'Unauthenticated'}`);
  console.error(`💾 MongoDB Error: ${error.name === 'MongoError' ? 'Yes' : 'No'}`);
  console.error(`📛 Error Name: ${error.name}`);
  console.error(`📝 Error Message: ${error.message}`);
  
  // MongoDB-specific error details
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    console.error(`🔢 Error Code: ${error.code}`);
    console.error(`🔤 Error Code Name: ${error.codeName}`);
    
    if (error.keyPattern) {
      console.error(`🔑 Duplicate Key Pattern:`, error.keyPattern);
    }
    
    if (error.keyValue) {
      const safeKeyValue = { ...error.keyValue };
      // Redact sensitive values
      Object.keys(safeKeyValue).forEach(key => {
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
          safeKeyValue[key] = '***REDACTED***';
        }
      });
      console.error(`🔑 Duplicate Key Value:`, safeKeyValue);
    }
  }
  
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    console.error(`📋 Validation Errors:`);
    Object.keys(error.errors).forEach(key => {
      console.error(`  - ${key}: ${error.errors[key].message}`);
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    console.error(`🔐 JWT Error Type: ${error.name}`);
  }
  
  // Stack trace (development only)
  if (process.env.NODE_ENV === 'development') {
    console.error(`🔍 Stack Trace:`, error.stack);
  } else {
    console.error(`🔍 Stack Trace (limited):`, error.stack?.split('\n').slice(0, 5).join('\n'));
  }
  
  // Additional error context
  if (error.response) {
    console.error(`🌐 API Response Error:`, error.response.data);
  }
  
  if (error.request) {
    console.error(`🌐 Failed Request Details:`, {
      method: error.request.method,
      url: error.request.url,
      headers: error.request.headers
    });
  }

  // Log to MongoDB error collection (optional)
  logErrorToMongoDB(req, error).catch(console.error);

  next(error);
};

// Optional: Log errors to MongoDB collection
const logErrorToMongoDB = async (req, error) => {
  try {
    // Only log in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.LOG_ERRORS_TO_DB) {
      return;
    }
    
    const { getCollection } = await import('../config/database.js');
    const errorsCollection = await getCollection('error_logs');
    
    const errorLog = {
      timestamp: new Date(),
      requestId: req.requestId || null,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?._id || null,
      userEmail: req.user?.email || null,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code || null,
      errorCodeName: error.codeName || null,
      stackTrace: process.env.NODE_ENV === 'production' ? error.stack?.substring(0, 1000) : error.stack,
      environment: process.env.NODE_ENV,
      requestBody: req.body && Object.keys(req.body).length > 0 
        ? JSON.stringify(redactSensitiveData(req.body)).substring(0, 1000)
        : null,
      queryParams: req.query && Object.keys(req.query).length > 0
        ? JSON.stringify(redactSensitiveData(req.query)).substring(0, 500)
        : null
    };
    
    await errorsCollection.insertOne(errorLog);
    
    console.log(`📝 Error logged to MongoDB with ID: ${errorLog._id}`);
  } catch (logError) {
    console.error('❌ Failed to log error to MongoDB:', logError.message);
  }
};

// Helper function to redact sensitive data
const redactSensitiveData = (data) => {
  const sensitiveFields = [
    'password', 'token', 'secret', 'apikey', 'authorization',
    'creditcard', 'cvv', 'ssn', 'socialsecurity', 'passport',
    'privatekey', 'secretkey', 'accesstoken', 'refreshtoken'
  ];
  
  const redacted = JSON.parse(JSON.stringify(data));
  
  const redactRecursive = (obj) => {
    for (const key in obj) {
      const keyLower = key.toLowerCase();
      
      if (sensitiveFields.some(field => keyLower.includes(field))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactRecursive(obj[key]);
      }
    }
  };
  
  redactRecursive(redacted);
  return redacted;
};

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  if (!process.env.ENABLE_PERFORMANCE_MONITORING) {
    return next();
  }
  
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;
  
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = endMemory - startMemory;
    
    // Log performance metrics
    console.log(`🚀 Performance Metrics for ${req.method} ${req.path}:`);
    console.log(`   ⏱️ Response Time: ${responseTime}ms`);
    console.log(`   💾 Memory Usage: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📊 Heap Total: ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    // Log to MongoDB if enabled
    if (process.env.LOG_PERFORMANCE_TO_DB) {
      logPerformanceToMongoDB(req, responseTime, memoryUsed).catch(console.error);
    }
    
    return originalSend.call(this, body);
  };
  
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = endMemory - startMemory;
    
    console.log(`🚀 Performance Metrics for ${req.method} ${req.path}:`);
    console.log(`   ⏱️ Response Time: ${responseTime}ms`);
    console.log(`   💾 Memory Usage: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);
    
    if (process.env.LOG_PERFORMANCE_TO_DB) {
      logPerformanceToMongoDB(req, responseTime, memoryUsed).catch(console.error);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Log performance metrics to MongoDB
const logPerformanceToMongoDB = async (req, responseTime, memoryUsed) => {
  try {
    const { getCollection } = await import('../config/database.js');
    const performanceCollection = await getCollection('performance_logs');
    
    const performanceLog = {
      timestamp: new Date(),
      method: req.method,
      endpoint: req.path,
      responseTime: responseTime,
      memoryUsed: memoryUsed,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      rss: process.memoryUsage().rss,
      userId: req.user?._id || null,
      userAgent: req.headers['user-agent']?.substring(0, 200),
      ip: req.ip
    };
    
    await performanceCollection.insertOne(performanceLog);
  } catch (error) {
    console.error('❌ Failed to log performance metrics:', error.message);
  }
};

// MongoDB query logger (optional - for debugging)
export const mongoQueryLogger = () => {
  if (process.env.NODE_ENV !== 'development' || !process.env.LOG_MONGO_QUERIES) {
    return (req, res, next) => next();
  }
  
  return async (req, res, next) => {
    const { MongoClient } = await import('mongodb');
    const originalDbPrototype = MongoClient.prototype.db;
    
    // Override the db method to intercept queries
    MongoClient.prototype.db = function(dbName, options) {
      const db = originalDbPrototype.call(this, dbName, options);
      const originalCollection = db.collection;
      
      db.collection = function(collectionName) {
        const collection = originalCollection.call(this, collectionName);
        
        // Intercept find operations
        const originalFind = collection.find;
        collection.find = function(query, options) {
          console.log(`🔍 MongoDB Query - Collection: ${collectionName}`);
          console.log(`   Query:`, JSON.stringify(query, null, 2));
          console.log(`   Options:`, options);
          console.log(`   Stack:`, new Error().stack.split('\n').slice(2, 6).join('\n'));
          
          return originalFind.call(this, query, options);
        };
        
        // Intercept aggregate operations
        const originalAggregate = collection.aggregate;
        collection.aggregate = function(pipeline, options) {
          console.log(`🔍 MongoDB Aggregate - Collection: ${collectionName}`);
          console.log(`   Pipeline:`, JSON.stringify(pipeline, null, 2));
          console.log(`   Options:`, options);
          console.log(`   Stack:`, new Error().stack.split('\n').slice(2, 6).join('\n'));
          
          return originalAggregate.call(this, pipeline, options);
        };
        
        // Intercept update operations
        const originalUpdateOne = collection.updateOne;
        collection.updateOne = function(filter, update, options) {
          console.log(`🔍 MongoDB UpdateOne - Collection: ${collectionName}`);
          console.log(`   Filter:`, JSON.stringify(filter, null, 2));
          console.log(`   Update:`, JSON.stringify(update, null, 2));
          console.log(`   Options:`, options);
          console.log(`   Stack:`, new Error().stack.split('\n').slice(2, 6).join('\n'));
          
          return originalUpdateOne.call(this, filter, update, options);
        };
        
        return collection;
      };
      
      return db;
    };
    
    // Restore original prototype after response
    const originalSend = res.send;
    res.send = function(body) {
      MongoClient.prototype.db = originalDbPrototype;
      return originalSend.call(this, body);
    };
    
    next();
  };
};

// Request validation logger
export const validationLogger = (schema) => {
  return (req, res, next) => {
    try {
      // Store original validation for logging
      const originalValidate = schema.validate;
      
      schema.validate = async function(value, options) {
        const startTime = Date.now();
        const result = await originalValidate.call(this, value, options);
        const validationTime = Date.now() - startTime;
        
        console.log(`✅ Schema Validation: ${schema._type || 'unknown'}`);
        console.log(`   ⏱️ Validation Time: ${validationTime}ms`);
        console.log(`   📋 Fields Validated: ${Object.keys(value || {}).length}`);
        
        if (result.error) {
          console.log(`   ❌ Validation Errors:`, result.error.details);
        } else {
          console.log(`   ✅ Validation Passed`);
        }
        
        return result;
      };
      
      next();
    } catch (error) {
      console.error('❌ Validation logger error:', error);
      next();
    }
  };
};