export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle JSON parse errors (body-parser issues)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body. Make sure Content-Type is application/json and body is valid JSON.',
      hint: 'Check if you are sending raw text instead of JSON object'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
