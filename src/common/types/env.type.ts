export interface IEnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  BASE_URL: string;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  COOKIE_DOMAIN: string;
  COOKIE_SECURE: boolean;
  COOKIE_SAMESITE: 'strict' | 'lax' | 'none';
  UPLOAD_DIR: string;
  UPLOAD_MAX_SIZE: number;
  UPLOAD_ALLOWED_MIME_TYPES: string;
}