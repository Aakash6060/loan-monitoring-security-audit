import express, { Request, Response } from 'express';
import morgan from "morgan";
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import loanRoutes from "./api/v1/routes/loanRoutes";
import authRoutes from "./api/v1/routes/authRoutes";
import { errorHandler } from './api/v1/middleware/errorMiddleware';

const app = express();

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Logger middleware to log HTTP requests in development mode.
 * Uses 'morgan' for logging.
 */
app.use(morgan("dev"));

/**
 * Routes for the API
 * - /api/v1/loans: Handles loan-related routes.
 * - /api/v1/auth: Handles authentication-related routes.
 */
app.use("/api/v1/loans", loanRoutes);
app.use("/api/v1/auth", authRoutes);

/**
 * Swagger Setup for API documentation
 * - Provides an interface for API users to explore and understand the API.
 */
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'High-Risk Loan Application Monitoring System API',
        version: '1.0.0',
        description: 'API documentation for the High-Risk Loan Application Monitoring System',
      },
      servers: [
        {
          url: 'http://localhost:3000/api/v1',
        },
      ],
    },
    // Paths to the API route files that define the API operations
    apis: ['./src/api/v1/routes/loanRoutes.ts', './src/api/v1/routes/authRoutes.ts'], 
  };

/**
 * Generate Swagger documentation based on the options defined above.
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Setup the Swagger UI on the '/api-docs' route
 * It will display the interactive API documentation using the swaggerSpec.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
/**
 * Root route for testing and getting an overview of the API.
 * When accessed, it will return a basic string message indicating the API is running.
 */
app.get('/', (req: Request, res: Response) => {
    res.send('High-Risk Loan Application Monitoring System API');
  });

/**
 * Error handling middleware to catch errors and send proper responses.
 * This will catch any unhandled errors throughout the application.
 */
app.use(errorHandler);

let server: any;

/**
 * Check if this file is being run directly (i.e., not imported by other files).
 * This will help start the server only when this file is executed directly.
 */
if (require.main === module) {
  // Set the server port either from environment variables or default to 3000
  const PORT = process.env.PORT || 3000;

  /**
   * Start the server and listen on the specified port.
   * Logs a message when the server has started successfully.
   */
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app };
