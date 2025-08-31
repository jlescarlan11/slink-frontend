// utils/tokenStorage.ts
export class SecureTokenStorage {
  private static instance: SecureTokenStorage;
  private token: string | null = null;
  private readonly storageKey = "auth_session";

  static getInstance(): SecureTokenStorage {
    if (!SecureTokenStorage.instance) {
      SecureTokenStorage.instance = new SecureTokenStorage();
    }
    return SecureTokenStorage.instance;
  }

  setTokens(accessToken: string): void {
    this.token = accessToken;

    try {
      const tokenData = { token: accessToken };
      sessionStorage.setItem(this.storageKey, JSON.stringify(tokenData));
    } catch {
      // Silent fail for storage errors
    }
  }

  getToken(): string | null {
    if (this.token) {
      return this.token;
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored);
      this.token = data.token;
      return this.token;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  clearTokens(): void {
    this.token = null;

    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // Silent fail for storage errors
    }
  }
}
