export interface OADR3Config {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

export interface OAuth2Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  expires_at: number;
}

export interface APIResponse<T = unknown> {
  status: number;
  response?: T;
  problem?: any;
}