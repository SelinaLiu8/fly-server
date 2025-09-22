function errorHandler(err, req, res, next) {
    console.error(err); // log for server-side debugging
  
    // Default to 500 if statusCode not set
    const statusCode = err.status || 500;
  
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      // Only include stack in development mode
      ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
  }
  
  module.exports = { errorHandler };