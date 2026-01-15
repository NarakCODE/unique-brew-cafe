export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentId: string | null;
  storeId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface GetCategoriesResponse {
  statusCode: number;
  data: Category[];
  message: string;
  success: boolean;
}
