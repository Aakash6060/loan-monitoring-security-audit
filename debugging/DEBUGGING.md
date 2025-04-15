# Debugging Analysis

## Scenario 1: Firebase Authentication Debugging

- **Breakpoint Location:** `authenticate` middleware in `src/api/v1/middlewares/authenticate.ts`
- **Objective:** Investigating how Firebase Authentication verifies ID tokens and attaches user details to requests.

### Debugger Observations

- **Variable States:**
  - `decodedToken`: `{ role: "manager", iss: "https://securetoken.google.com/high-risk-loan-application", aud: "high-risk-loan-application", auth_time: 1741318381, user_id: "JePx84kHfSV320@s191422" }`
  - `token`: `Bearer eyJhbGciOi...` (JWT token)
  - `req`: The incoming HTTP request object.
  - `res`: The outgoing HTTP response object.

- **Call Stack:**
  - `authenticate()` (at `src/api/v1/middlewares/authenticate.ts`)
  - `next()` (calls the next middleware or route handler)
  - `handle()` (express router internal function)
  - `dispatch()` (routes the request to the correct handler)
  - `processParams()` (handles processing of route parameters)

- **Behavior:**
  - The Firebase authentication token is extracted from the `Authorization` header.
  - The token is successfully verified by Firebase’s `verifyIdToken` method.
  - After verification, user details are attached to the request via `res.locals` (e.g., `uid`, `role`).
  - If the token is invalid or missing, the system responds with a 401 Unauthorized status.

### Analysis

- **What did you learn from this scenario?**
  - The `authenticate` middleware successfully decodes the Firebase ID token and attaches the user’s `uid` and `role` to the request, enabling role-based access control later in the flow.
  
- **Did you observe any unexpected behavior?**
  - No unexpected behavior observed. However, I noticed a small discrepancy where the token was undefined at one point, indicating that the request didn’t include the `Authorization` header as expected.

- **Are there areas for improvement or refactoring in this part of the code?**
  - Consider adding a more comprehensive error handler for missing or invalid tokens to provide more informative error messages (e.g., "Token missing" vs. "Token invalid").

- **How does this enhance your understanding of the overall project?**
  - Understanding how the authentication middleware works helps to ensure secure access to APIs by attaching user details to each request, ensuring that only authorized users can perform certain actions based on their roles.

## Scenario 2: Role-Based Access Control Debugging

- **Breakpoint Location:** `isAuthorized` middleware in `src/api/v1/middlewares/authorize.ts`
- **Objective:** Investigating how the authorization middleware enforces role restrictions on specific API endpoints.

### Debugger Observations

- **Variable States:**
  - `role`: `"manager"`
  - `uid`: `"JePx0E4kHfSV3hYzQX0YVs19sqZ2"`
  - `req.params.id`: `undefined` (User ID from the route parameter)
  - `opts`: The authorization options passed to the `isAuthorized` function.
  - `res.locals.role`: The role of the user, which is set after authentication (`"manager"` in this case).

- **Call Stack:**
  - `isAuthorized()` (at `src/api/v1/middlewares/authorize.ts`)
  - `next()` (calls the next middleware or route handler)
  - `handle()` (express router internal function)
  - `dispatch()` (routes the request to the correct handler)
  - `processParams()` (handles processing of route parameters)

- **Behavior:**
  - The `role` is successfully extracted from the authenticated user’s details and stored in `res.locals.role`.
  - The middleware checks if the user’s `role` matches the required role for access.
  - If the user has the correct role (e.g., `"manager"`), they are granted access to the route.
  - If the user’s role does not match the required role, a `403 Forbidden` error is thrown, blocking access.
  - Additionally, if the `opts.allowSameUser` option is enabled and the request is for the same user’s data (i.e., `req.params.id` matches `res.locals.uid`), access is granted even if roles differ.

### Analysis

- **What did you learn from this scenario?**
  - The `isAuthorized` middleware works as expected by checking roles and enforcing restrictions on who can access specific resources. The role-based logic is correct, and the system is blocking unauthorized access.

- **Did you observe any unexpected behavior?**
  - Yes, the `req.params.id` was `undefined`, which may indicate that the user’s ID wasn’t passed correctly in the request URL. This could be a potential issue if routes are not properly formatted.

- **Are there areas for improvement or refactoring in this part of the code?**
  - I suggest adding a more comprehensive check for `req.params.id` to ensure that the user ID is always passed correctly in the request. If it's not, an informative error message should be returned.

- **How does this enhance your understanding of the overall project?**
  - This scenario helps clarify the role-based access control mechanism, ensuring that only users with the correct roles (or specific users) can access sensitive data or actions in the API. It solidifies the importance of properly passing route parameters and handling authorization efficiently.

## Scenario 3: Loan Application Endpoint Debugging

- **Breakpoint Location:** `createLoan` function in `src/api/v1/controllers/loanController.ts`
- **Objective:** Debugging the behavior of the loan application creation route and ensuring proper handling of request data.

### Debugger Observations

- **Variable States:**
  - `req.body`: `{ amount: 5000, applicantName: "John Doe" }`
  - `req`: The incoming HTTP request object, containing the loan application data.
  - `res`: The outgoing HTTP response object, used to return a success or error message.
  - `statusCode`: `201` when loan creation is successful, or `500` for internal server errors.

- **Call Stack:**
  - `createLoan()` (at `src/api/v1/controllers/loanController.ts`)
  - `handle()` (express router internal function)
  - `next()` (calls the next middleware or route handler)
  - `dispatch()` (routes the request to the correct handler)
  - `processParams()` (handles processing of route parameters)

- **Behavior:**
  - The `createLoan` function is triggered when a `POST` request is made to `/api/v1/loans`.
  - The request body is parsed, and a new loan application is created.
  - If the loan creation is successful, a `201` status code and a success message (`"Loan application created"`) are returned.
  - If an error occurs during the loan creation process, a `500` status code and an error message (`"Internal Server Error"`) are returned.
  - The loan application data includes the amount and applicant's name, which is validated and used to create the loan entry in the database.

### Analysis

- **What did you learn from this scenario?**
  - The `createLoan` function works as expected and successfully processes loan applications, returning appropriate success or error messages. The request body is correctly parsed, and the loan data is passed to the backend logic.
  
- **Did you observe any unexpected behavior?**
  - No unexpected behavior was observed. The function is correctly handling successful and failed loan application submissions.
  
- **Are there areas for improvement or refactoring in this part of the code?**
  - One possible improvement could be to add more comprehensive validation on the incoming loan data (e.g., ensuring the `amount` is a valid number, the applicant's name is a non-empty string, etc.) before proceeding with the creation process.

- **How does this enhance your understanding of the overall project?**
  - This scenario reinforces the importance of correctly handling request data and ensuring proper success/error response handling. It also emphasizes the need for input validation in API routes, which is crucial for data integrity and preventing errors in the backend.