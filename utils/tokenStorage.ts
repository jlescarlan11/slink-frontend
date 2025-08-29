// utils/tokenStorage.ts
export class SecureTokenStorage {
  private static instance: SecureTokenStorage;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;
  private readonly storageKey = "auth_session";

  static getInstance(): SecureTokenStorage {
    if (!SecureTokenStorage.instance) {
      SecureTokenStorage.instance = new SecureTokenStorage();
    }
    return SecureTokenStorage.instance;
  }

  private generateFingerprint(): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Browser fingerprint", 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}`,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join("|");

    return btoa(fingerprint).slice(0, 32);
  }

  setTokens(
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    this.token = accessToken;
    this.refreshToken = refreshToken || null;
    this.expiresAt =
      Date.now() + (expiresIn ? expiresIn * 1000 : 15 * 60 * 1000);

    try {
      const tokenData = {
        token: accessToken,
        refreshToken: this.refreshToken,
        expiresAt: this.expiresAt,
        fingerprint: this.generateFingerprint(),
      };
      sessionStorage.setItem(this.storageKey, JSON.stringify(tokenData));
    } catch (error) {
      console.warn("Failed to store token:", error);
    }
  }

  getToken(): string | null {
    if (this.token && this.expiresAt && Date.now() < this.expiresAt) {
      return this.token;
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored);

      if (
        Date.now() > data.expiresAt ||
        data.fingerprint !== this.generateFingerprint()
      ) {
        this.clearTokens();
        return null;
      }

      this.token = data.token;
      this.refreshToken = data.refreshToken;
      this.expiresAt = data.expiresAt;

      return this.token;
    } catch (error) {
      console.warn("Failed to retrieve token:", error);
      this.clearTokens();
      return null;
    }
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isTokenExpired(): boolean {
    return !this.expiresAt || Date.now() >= this.expiresAt;
  }

  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;

    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn("Failed to clear sessionStorage:", error);
    }
  }
}
