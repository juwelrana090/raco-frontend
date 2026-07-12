export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface IUsersFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}
