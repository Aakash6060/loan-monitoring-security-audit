/**
 * Defines the authorization options for securing API routes.
 */
export interface AuthorizationOptions {
    /**
     * Specifies the roles that are permitted to access a particular route.
     * - `"manager"`: Can approve loans and manage roles.
     * - `"officer"`: Can review loan applications.
     * - `"user"`: Can apply for loans.
     */
    hasRole: Array<"manager" | "officer" | "user">;

    /**
     * If `true`, allows users to access their own resources
     * (e.g., a user can retrieve their own loan details).
     * Defaults to `false`.
     */
    allowSameUser?: boolean;
}
