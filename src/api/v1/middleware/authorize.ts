import { Request, Response, NextFunction } from "express";
import { AuthorizationOptions } from "../models/authorizationOptions"; // Import the interface

/**
 * Middleware to check if a user is authorized based on their role or UID.
 *
 * @param {AuthorizationOptions} opts - The authorization options specifying allowed roles and user access rules.
 * @returns {Function} Express middleware function to handle authorization.
 */
function isAuthorized(opts: AuthorizationOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { role, uid } = res.locals; // User role and UID from previous authentication middleware
        const { id } = req.params; // User ID from the route parameters

        /**
         * Allow the user to access their own data if `allowSameUser` is enabled
         * and the request is for the same user ID.
         */
        if (opts.allowSameUser && id && uid === id) {
            return next(); // Proceed if the user is accessing their own data
        }

        // If no role exists on the user, throw an error
        if (!role) {
            return res.status(403).json({ error: "Forbidden: No role found" });
        }

        // Grant access if the user has one of the allowed roles
        if (opts.hasRole.includes(role)) {
            return next(); // Proceed if the user has the required role
        }

        // Deny access if the user's role does not match the allowed roles
        return res.status(403).json({ error: "Forbidden: Insufficient role" });
    };
}

export default isAuthorized;