import * as Joi from 'joi';

export const envConfig = {
  validationSchema: Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(9000),
    BASE_URL: Joi.string().default('http://localhost:9000/api'),
    CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
    DATABASE_URL: Joi.string().required(),
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    COOKIE_DOMAIN: Joi.string().default('localhost'),
    COOKIE_SECURE: Joi.boolean().default(false),
    COOKIE_SAMESITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),
    UPLOAD_DIR: Joi.string().default('uploads'),
    UPLOAD_MAX_SIZE: Joi.number().default(10485670),
    UPLOAD_ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,image/jpg'),
  }),
};