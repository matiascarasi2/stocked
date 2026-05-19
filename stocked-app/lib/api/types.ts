export type AuthUser = {
  id: string;
  email: string;
};

export type AuthDevice = {
  id: string;
  platform: string;
};

export type AuthTokensResponse = {
  user: AuthUser;
  device: AuthDevice;
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokensResponse = {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
};

export type RegisterSignInBody = {
  email: string;
  password: string;
  platform: string;
  deviceId?: string;
  pushToken?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
