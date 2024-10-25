export interface User {
  id: string| null;
  email: string| null;
  emailVerified?: Date | null;
  name: string| null;
  image?: string| null;
  password: string| null;
  role: string | null;
}
