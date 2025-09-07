// Shared API response handlers for authentication

// Response interfaces
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

// API response interfaces for better type safety
interface LoginApiResponse {
  data: {
    token: string;
  };
}

interface RegisterApiResponse {
  data: {
    message?: string;
  };
}

// JWT payload interface
interface JWTPayload {
  sub?: string;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

// Handle login response and create user data structure
export const handleLoginResponse = (
  response: LoginApiResponse
): AuthResponse => {
  const { token } = response.data;

  // Extract username from JWT token payload
  const decodedToken = decodeJWT(token);
  const username = decodedToken?.sub || "user";

  const user = {
    id: decodedToken?.sub || "temp-id", // Using sub (subject) as ID
    username: username,
  };

  return { token, user };
};

// Helper function to decode JWT token (base64 decode the payload part)
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = atob(
      paddedPayload.replace(/-/g, "+").replace(/_/g, "/")
    );

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

// Handle register response
export const handleRegisterResponse = (
  response: RegisterApiResponse
): RegisterResponse => {
  return {
    success: true,
    message: response.data.message || "Registration successful",
  };
};

// Create tokens object with expected structure for auth context
export const createTokensObject = (accessToken: string) => {
  return {
    accessToken,
    refreshToken: accessToken, // Keeping for interface compatibility
    expiresIn: 3600, // Keeping for interface compatibility
  };
};
