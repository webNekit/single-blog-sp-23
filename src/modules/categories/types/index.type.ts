export class NewsCategoryItemResponse {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
}

export class CategoryNewsResponse {
  id: string;
  title: string;
  createdAt: Date;
}

export class NewsCategoriesResponse {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  news: CategoryNewsResponse[];
}
