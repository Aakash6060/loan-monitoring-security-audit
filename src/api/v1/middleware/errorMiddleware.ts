import { Request, Response, NextFunction } from 'express';


/**
 * Error-handling middleware for Express applications.
 *
 * This middleware catches errors thrown in the application and sends a structured 
 * response to the client. It logs the error stack for debugging purposes and 
 * ensures that an appropriate HTTP status code is returned.
 *
 * @param {any} err - The error object, which may contain a `statusCode` and `message`.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function (not used but required for Express middleware).
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); 

  // Determine the appropriate status code (default to 500 if not provided)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // Send a JSON response with the error details
  res.status(statusCode).json({ error: message });
};