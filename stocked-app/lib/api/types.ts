export type StockQuote = {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
};

export type ChartRange = "1M" | "3M" | "6M" | "1Y";

export type StockChartPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockChart = {
  symbol: string;
  range: ChartRange;
  points: StockChartPoint[];
};

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

export type Alert = {
  id: string;
  stockSymbol: string;
  minPrice: number | null;
  maxPrice: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt: string | null;
};

export type CreateAlertBody = {
  stockSymbol: string;
  minPrice: number | null;
  maxPrice: number | null;
};

export type UpdateAlertBody = {
  minPrice?: number | null;
  maxPrice?: number | null;
  isActive?: boolean;
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
