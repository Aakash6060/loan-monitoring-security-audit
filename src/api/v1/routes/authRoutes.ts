import { Router } from "express";
import { getUserDetails, setUserRole } from "../controller/authController";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";

const router = Router();

/**
 * @openapi
 * /auth/user/{uid}:
 *   get:
 *     summary: Retrieve user details by UID
 *     tags:
 *       - Authentication
 *     description: Fetches user details including UID, email, and display name. Accessible by managers, officers, and users.
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier (UID) of the user whose details are being requested.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   example: "user123"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 displayName:
 *                   type: string
 *                   example: "John Doe"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token.
 *       403:
 *         description: Forbidden - User does not have sufficient permissions.
 *       404:
 *         description: Not Found - The user with the provided UID does not exist.
 *       500:
 *         description: Internal Server Error - Failed to retrieve user details.
 */
router.get("/user/:uid", authenticate, authorize({ hasRole: ["manager", "officer", "user"] }), getUserDetails);

/**
 * @openapi
 * /auth/admin/set-role:
 *   post:
 *     summary: Assign a role to a user (Admin Only)
 *     tags:
 *       - Authentication
 *     description: Allows a manager to assign a role (user, officer, or manager) to a specific user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - role
 *             properties:
 *               uid:
 *                 type: string
 *                 example: "officer123"
 *                 description: The UID of the user to assign a new role.
 *               role:
 *                 type: string
 *                 enum: [user, officer, manager]
 *                 example: "officer"
 *                 description: The new role to assign to the user.
 *     responses:
 *       200:
 *         description: Successfully assigned a new role to the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Role assigned successfully"
 *       400:
 *         description: Bad Request - Invalid role or missing parameters.
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token.
 *       403:
 *         description: Forbidden - User does not have the required permissions.
 *       500:
 *         description: Internal Server Error - Failed to update user role.
 */
router.post("/admin/set-role", authenticate, authorize({ hasRole: ["manager"] }), setUserRole);

export default router;