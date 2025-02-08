/**
 * Wraps an asynchronous route handler function to catch any errors and pass them to Express error handling middleware
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
