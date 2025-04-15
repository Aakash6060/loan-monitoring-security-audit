import { Request, Response } from "express";
import { auth } from "../../../config/firebaseConfig";

/**
 * Retrieves user details from Firebase Authentication.
 * @param {Request} req - Express request object containing `uid` in params.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response with user details or error message.
 */
export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { uid } = req.params;
        const userRecord = await auth.getUser(uid);

        res.status(200).json({ user: userRecord });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve user details" });
    }
};

/**
 * Assigns a custom role to a user. Only accessible by Admin users.
 * @param {Request} req - Express request object containing `uid` and `role` in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} JSON response confirming role assignment or an error message.
 */
export const setUserRole = async (req: Request, res: Response) => {
    try {
        const { uid, role } = req.body;

        // Validate role before proceeding
        if (!["user", "officer", "manager"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Assign custom role to user in Firebase
        await auth.setCustomUserClaims(uid, { role });

        return res.status(200).json({ message: `Role ${role} assigned to user ${uid}` });
    } catch (error) {
        return res.status(500).json({ error: "Failed to set user role" });
    }
};
