/**
 * @function asyncHandler
 * @description Wraps an asynchronous route handler function to catch any errors and pass them to Express error handling middleware
 * - Converts async route handlers to Promise-based middleware
 * - Automatically catches and forwards errors to Express error handler
 * - Eliminates need for try/catch blocks in route handlers
 * 
 * @param {Function} fn - The async route handler function to wrap
 * @returns {Function} A middleware function that executes the wrapped handler and catches errors
 * @example
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users); 
 * }));
 */
export const asyncHandler = (fn) => {
	return (req, res, next) => {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};
};
