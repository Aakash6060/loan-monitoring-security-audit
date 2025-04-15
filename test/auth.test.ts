import request from 'supertest';
import { app } from '../src/app';

/**
 * Mocking Firebase Admin SDK methods for user authentication and management.
 * This mock simulates the behavior of Firebase Admin SDK's `auth()` method 
 * to return different user details based on the provided UID.
 */
jest.mock('firebase-admin', () => {
  return {
    auth: {
      /**
       * Mock method to get user details by UID.
       * Returns a promise that resolves with user data for valid UID values.
       */
      getUser: jest.fn((uid) => {
        switch (uid) {
          case 'BWdKOlsqczVr5dVkNflqqTJEI5j2': 
            return Promise.resolve({
              uid: 'BWdKOlsqczVr5dVkNflqqTJEI5j2',
              email: 'manager@gmail.com',
              displayName: 'Manager',
              customClaims: { role: 'manager' },
            });
          case 'JePx0E4kHfSV3hYzQX0YVs19sqZ2': 
            return Promise.resolve({
              uid: 'JePx0E4kHfSV3hYzQX0YVs19sqZ2',
              email: 'officer@gmail.com',
              displayName: 'Officer',
              customClaims: { role: 'officer' },
            });
          case 'wVyFCoAzkpZNW327TULPmKbqWLt2': 
            return Promise.resolve({
              uid: 'wVyFCoAzkpZNW327TULPmKbqWLt2',
              email: 'user1@gmail.com',
              displayName: 'User 1',
              customClaims: { role: 'user' },
            });
          case 'ZmK4fpyhrDdTKzK1TCHwLJLQ8Ju1': 
            return Promise.resolve({
              uid: 'ZmK4fpyhrDdTKzK1TCHwLJLQ8Ju1',
              email: 'user2@gmail.com',
              displayName: 'User 2',
              customClaims: { role: 'user' },
            });
          default:
            return Promise.reject(new Error('auth/user-not-found'));
        }
      }),
      /**
       * Mock method to set custom user claims (such as roles).
       */
      setCustomUserClaims: jest.fn((uid, claims) => {
        return Promise.resolve({ uid, ...claims });
      }),
    },
  };
});

// Define mock tokens used for authorization in the tests
const validToken = 'mock-valid-token';
const invalidToken = 'mock-invalid-token';
const validOfficerToken = 'mock-officer-token';

/**
 * Mocking authentication middleware to simulate different roles based on token.
 * This middleware will check the token and assign a role to the request.
 */
jest.mock('../src/api/v1/middleware/authenticate', () => {
    return (req: any, res: any, next: any) => {
      const token = req.headers.authorization?.split(' ')[1];
  
    // Handle valid tokens (manager and officer roles)
    if (token === 'mock-valid-token') {
        res.locals.uid = 'BWdKOlsqczVr5dVkNflqqTJEI5j2'; 
        res.locals.role = 'manager';
        return next();
      }
  
      // Handle officer token
      if (token === 'mock-officer-token') {
        res.locals.uid = 'JePx0E4kHfSV3hYzQX0YVs19sqZ2';
        res.locals.role = 'officer';
        return next();
      }
  
      // Invalid token handling
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    };
  });

describe('Auth Routes', () => {
  /**
   * Test case for retrieving user information with a valid token.
   * This should return status 200 if the token is valid.
   */
  test('GET /api/v1/auth/user/:uid - Valid Token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/user/BWdKOlsqczVr5dVkNflqqTJEI5j2') 
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
  });

  /**
   * Test case for retrieving user information with an invalid token.
   * This should return status 401 with an Unauthorized error.
   */
  test('GET /api/v1/auth/user/:uid - Invalid Token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/user/BWdKOlsqczVr5dVkNflqqTJEI5j2')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
  });

  /**
   * Test case for a manager to assign a role to a user.
   * This should return status 200 if the manager token is used correctly.
   */
  test('POST /api/v1/auth/admin/set-role - Manager Role', async () => {
    const response = await request(app)
      .post('/api/v1/auth/admin/set-role')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ uid: 'wVyFCoAzkpZNW327TULPmKbqWLt2', role: 'officer' }); 

    expect(response.status).toBe(200);
  });
});

  /**
   * **Authentication Middleware Tests**
   * Test case for when no token is provided.
   * This should return status 401 with an Unauthorized error.
   */
  test('GET /api/v1/auth/user/:uid - Missing Token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/user/BWdKOlsqczVr5dVkNflqqTJEI5j2') // Manager's UID
      .set('Authorization', ''); // No token provided

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized: Invalid token');
  });
  
  /**
   * Test case where a user without a manager role tries to assign a role.
   * This should return status 403 with a Forbidden error.
   */
  test('POST /api/v1/auth/admin/set-role - User without manager role cannot assign role', async () => {
    const response = await request(app)
      .post('/api/v1/auth/admin/set-role')
      .set('Authorization', `Bearer ${validOfficerToken}`) // Non-manager token
      .send({ uid: 'JePx0E4kHfSV3hYzQX0YVs19sqZ2', role: 'manager' });

      expect(response.status).toBe(403);  
    expect(response.body.error).toBe('Forbidden: Insufficient role'); 
});