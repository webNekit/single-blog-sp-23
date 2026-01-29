export enum NewsSortField {
  title = 'title',
  createdAt = 'createdAt',
  isActive = 'isActive',
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export interface NewsQueryParams {
  categoryId?: string;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: NewsSortField;
  order: SortDirection;
}

export interface NewsItemResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;

  category: {
    id: string;
    title: string;
    slug: string;
  } | null;

  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export interface NewsListResponse {
  items: NewsItemResponse[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}