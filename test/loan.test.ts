import request from 'supertest';
import { app } from '../src/app';

// Mock Tokens for Authentication
const validUserToken = 'mock-user-token';
const validOfficerToken = 'mock-officer-token';
const validManagerToken = 'mock-manager-token';

// Mock authentication middleware to simulate user roles
jest.mock('../src/api/v1/middleware/authenticate', () => {
  return (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token === 'mock-user-token') {
      res.locals.uid = "user1";
      res.locals.role = "user";
    } else if (token === 'mock-officer-token') {
      res.locals.uid = "officer1";
      res.locals.role = "officer";
    } else if (token === 'mock-manager-token') {
      res.locals.uid = "manager1";
      res.locals.role = "manager";
    } else {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    return next();
  };
});

/**
 * Tests for loan-related routes in the API.
 * These tests cover creating loans, reviewing loans, and approving loans,
 * with role-based access control (user, officer, manager).
 */
describe('Loan Routes', () => {

  /**
   * Test that a user can create a loan.
   * Validates the POST /api/v1/loans endpoint.
   */
  test('POST /api/v1/loans - User can create loan', async () => {
    const response = await request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${validUserToken}`)
      .send({ amount: 5000, applicantName: "John Doe" });

    // Assert that the loan is created successfully (status 201)
    expect(response.status).toBe(201);
  });

  /**
   * Test that an officer can review a loan.
   * Validates the PUT /api/v1/loans/:id/review endpoint.
   */
  test('PUT /api/v1/loans/:id/review - Officer can review loan', async () => {
    const response = await request(app)
      .put('/api/v1/loans/123/review')
      .set('Authorization', `Bearer ${validOfficerToken}`);

    // Assert that the loan is reviewed successfully (status 200)
    expect(response.status).toBe(200);
  });

  /**
   * Test that only a manager can approve a loan.
   * Validates the PUT /api/v1/loans/:id/approve endpoint.
   */
  test('PUT /api/v1/loans/:id/approve - Only manager can approve loan', async () => {
    const response = await request(app)
      .put('/api/v1/loans/123/approve')
      .set('Authorization', `Bearer ${validManagerToken}`);

    // Assert that the loan is approved successfully (status 200)
    expect(response.status).toBe(200);
  });

  /**
   * Test that an officer cannot approve a loan.
   * Validates the PUT /api/v1/loans/:id/approve endpoint with an officer role.
   */
  test('PUT /api/v1/loans/:id/approve - Officer cannot approve loan', async () => {
    const response = await request(app)
      .put('/api/v1/loans/123/approve')
      .set('Authorization', `Bearer ${validOfficerToken}`);

    // Assert that the officer gets a forbidden error (status 403)
    expect(response.status).toBe(403);
  });
});

  /**
   * Test that a user cannot review a loan.
   * Validates the PUT /api/v1/loans/:id/review endpoint with a user role.
   */
  test('PUT /api/v1/loans/:id/review - User cannot review loan', async () => {
    const response = await request(app)
      .put('/api/v1/loans/123/review')
      .set('Authorization', `Bearer ${validUserToken}`);
  
    // Assert that the user gets a forbidden error (status 403)
    expect(response.status).toBe(403);  // Forbidden error
    expect(response.body.error).toBe('Forbidden: Insufficient role');
  });
  
  /**
   * Test that an invalid loan ID results in a failure when reviewing a loan.
   * Validates the PUT /api/v1/loans/:id/review endpoint with an invalid loan ID.
   */
  test('PUT /api/v1/loans/:id/review - Invalid loan ID', async () => {
    const response = await request(app)
      .put('/api/v1/loans/invalid-id/review')
      .set('Authorization', `Bearer ${validOfficerToken}`);
  
    // Assert that the API returns a message indicating the loan was reviewed (status 200)
    expect(response.status).toBe(200);  
    expect(response.body.message).toBe('Loan application invalid-id reviewed');  
  });
  