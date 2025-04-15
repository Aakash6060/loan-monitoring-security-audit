import { Router } from "express";
import * as loanController from '../controller/loanController';
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";

const router = Router();

/**
 * @openapi
 * /loans:
 *   post:
 *     tags:
 *       - Loan
 *     summary: Create a new loan
 *     description: This endpoint allows users to create a new loan application.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of the loan.
 *               applicantName:
 *                 type: string
 *                 description: The name of the loan applicant.
 *     responses:
 *       201:
 *         description: Loan created successfully.
 *       400:
 *         description: Invalid input. The request body is missing required fields or has invalid data.
 *       500:
 *         description: Failed to create loan. There was an internal server error.
 */
router.post('/', authenticate, authorize({ hasRole: ["user"] }),loanController.createLoan);

/**
 * @openapi
 * /loans/{id}/review:
 *   put:
 *     tags:
 *       - Loan
 *     summary: Review a loan by ID
 *     description: This endpoint allows officers to review a loan application.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the loan to review.
 *     responses:
 *       200:
 *         description: Loan reviewed successfully.
 *       404:
 *         description: Loan not found. The loan ID provided does not exist.
 *       500:
 *         description: Failed to review loan. There was an internal server error.
 */
router.put('/:id/review', authenticate, authorize({ hasRole: ["officer"] }), loanController.reviewLoan);

/**
 * @openapi
 * /loans:
 *   get:
 *     tags:
 *       - Loan
 *     summary: Get all loans
 *     description: This endpoint returns a list of all loans. It is accessible by officers and managers.
 *     responses:
 *       200:
 *         description: A list of loans. A successful response returns an array of loan objects.
 *       500:
 *         description: Failed to fetch loans. There was an internal server error.
 */
router.get('/', authenticate,authorize({ hasRole: [ "officer" , "manager"] }), loanController.getLoans);

/**
 * @openapi
 * /loans/{id}/approve:
 *   put:
 *     tags:
 *       - Loan
 *     summary: Approve a loan by ID
 *     description: This endpoint allows managers to approve a loan application by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the loan to approve.
 *     responses:
 *       200:
 *         description: Loan approved successfully.
 *       404:
 *         description: Loan not found. The loan ID provided does not exist.
 *       500:
 *         description: Failed to approve loan. There was an internal server error.
 */
router.put('/:id/approve', authenticate, authorize({ hasRole: ["manager"] }), loanController.approveLoan);

export default router;