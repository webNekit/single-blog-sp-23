export const NEWS_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 50,
  SORT_BY: 'createdAt' as const,
  SORT_ORDER: 'desc' as const,
  SLUG_SEPARATOR: '-',
} as const;

export const NEWS_ERRORS = {
  NOT_FOUND: 'Новость не найдена или не существует',
  SLUG_CONFLICT: 'Новость с таким slug уже существует',
  CATEGORY_NOT_FOUND: 'Категория не найдена или не существует',
  UNAUTHORIZED: 'Авторизуйтесь с правами администратора',
  IMAGE_REQUIRED_ON_CREATE: 'Изображение не было загружено',
} as const;

export const NEWS_VALIDATORS = {
  TITLE_MIN: 5,
  TITLE_MAX: 200,
  CONTENT_MIN: 20,
} as const;
