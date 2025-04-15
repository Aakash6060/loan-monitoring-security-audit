import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "../../../config/firebaseConfig"

/**
 * Middleware to authenticate users using Firebase ID tokens.
 * 
 * This middleware extracts and verifies the Firebase ID token from the request's Authorization header.
 * If valid, it attaches the user's ID (`uid`) and role to `res.locals` for further processing.
 * 
 * @param {Request} req - The incoming HTTP request object.
 * @param {Response} res - The outgoing HTTP response object.
 * @param {NextFunction} next - The next middleware function in the request pipeline.
 * @returns {Promise<void>} - Calls `next()` if authentication succeeds, otherwise responds with an error.
 */
const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    // Extract the token from the Authorization header (format: "Bearer <token>")
    const token: string | undefined =
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

    try {
        // Verify and decode the Firebase ID token
        const decodedToken: DecodedIdToken = await auth.verifyIdToken(token);
        
        // Attach user details to response locals for downstream processing
        res.locals.uid = decodedToken.uid;
        res.locals.role = decodedToken.role;
        
        next();  // Proceed to next middleware or route handler
    } catch (error: unknown) {
        // Handle token verification failures
        return res.status(401).json({
            error: error instanceof Error ? `Unauthorized: ${error.message}` : "Unauthorized: Invalid token"
        });
    }
};

export default authenticate;