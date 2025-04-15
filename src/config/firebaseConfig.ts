import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import serviceAccount from "../../high-risk-loan-application-firebase-adminsdk-fbsvc-d87348da8f.json"; 

/**
 * Initializes Firebase Admin SDK with the provided service account credentials.
 * This will set up Firebase Authentication and Firestore services for use in the application.
 *
 * @remarks
 * This function is automatically called when this module is imported, setting up the Firebase Admin SDK.
 *
 * The serviceAccount JSON file contains credentials that allow the application to authenticate
 * with Firebase services.
 *
 * @see https://firebase.google.com/docs/admin/setup for more details on Firebase Admin SDK setup.
 */
initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
});

// Initialize Firebase Auth and Firestore
const auth: Auth = getAuth();
const db: Firestore = getFirestore();

/**
 * Firebase Authentication instance for user management tasks.
 * Can be used to perform operations like user creation, deletion, and authentication.
 *
 * @example
 * const userRecord = await auth.createUser({ email: "user@example.com", password: "password123" });
 */
export { auth };

/**
 * Firebase Firestore instance for database interaction.
 * Allows the application to read and write data to Firestore.
 *
 * @example
 * const docRef = db.collection('loans').doc('123');
 * const doc = await docRef.get();
 * console.log(doc.data());
 */
export { db };
