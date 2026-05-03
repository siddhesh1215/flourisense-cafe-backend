/**
 * Reusable HTTP response helpers.
 * Use these in every controller to maintain a consistent API response shape.
 */

const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ status: true, message, data });
};

const created = (res, message, data = null) => {
  return res.status(201).json({ status: true, message, data });
};

const badRequest = (res, message, data = null) => {
  return res.status(400).json({ status: false, message, data });
};

const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({ status: false, message, data: null });
};

const forbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({ status: false, message, data: null });
};

const notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({ status: false, message, data: null });
};

const serverError = (res, error, message = 'Something went wrong. Please try again.') => {
  console.error('[Server Error]:', error);
  return res.status(500).json({ status: false, message, data: null });
};

module.exports = { success, created, badRequest, unauthorized, forbidden, notFound, serverError };
