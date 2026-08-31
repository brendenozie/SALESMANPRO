import { DefaultSession, DefaultUser } from "next-auth";

// Define a role enum
export enum Role {
  user = "user",
  admin = "admin",
  agent = "agent",
  client = "client",
  student = "student"
}

// Extend User interface to include Consumer model fields
interface IUser extends DefaultUser {
  id: string;
  role?: Role | string;
  phone?: string;
  username?: string;
  bio?: string;
  address?: string;
  profilePicture?: string;
  emailVerified?: boolean | null;
  isActive?: boolean | null;
  companyId?: string | null;
  hasTenantAccess?: boolean;
  cardNumber?: string;
  cardExpiry?: string;
  cvv?: string;
  promoCode?: string;
  paymentMethod?: string;
  shippingMethod?: string;
}

// Extend NextAuth module with new User and Session types
declare module "next-auth" {
  interface User extends IUser {}

  interface Session extends DefaultSession {
    user?: User;
  }
}

// Extend JWT to include additional user fields
declare module "next-auth/jwt" {
  interface JWT extends IUser {}
}
