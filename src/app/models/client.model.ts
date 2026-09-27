export interface Client {
  id: number;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  role: string;
}
