import { PrismaClient, ROLES } from "@prisma/client";
import { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";

const prisma = new PrismaClient();

export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(user: AdapterUser) {
      const existingAdmin = await prisma.user.findUnique({ where: { email: user.email } });

      if (existingAdmin) {
        return {
          id: existingAdmin.id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          emailVerified: existingAdmin.emailVerified ? new Date() : null,
          image: existingAdmin.image,
        } as AdapterUser;
      }

      let role: ROLES = ROLES.USER;
      if (user.email?.endsWith("@merchant.com")) {
        role = ROLES.AGENT;
      } else if (user.email?.endsWith("@admin.com")) {
        role = ROLES.ADMIN;
      }

      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          role,
          emailVerified: !!user.emailVerified,
        },
      });

      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        emailVerified: createdUser.emailVerified ? new Date() : null,
        image: createdUser.image,
      } as AdapterUser;
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date() : null,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date() : null,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });

      if (!account || !account.user) return null;

      return {
        id: account.user.id,
        name: account.user.name,
        email: account.user.email,
        emailVerified: account.user.emailVerified ? new Date() : null,
        image: account.user.image,
      } as AdapterUser;
    },

    async updateUser(user) {
      const { emailVerified, ...restUser } = user;
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...restUser,
          role: ((user as any).role as ROLES) || ROLES.USER,
          emailVerified: typeof emailVerified === "boolean" ? emailVerified : !!emailVerified,
        },
      });
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified ? new Date() : null,
        image: updatedUser.image,
      } as AdapterUser;
    },

    async deleteUser(id) {
      await prisma.user.deleteMany({ where: { id } });
    },

    async createVerificationToken({ identifier, token, expires }) {
      return prisma.verificationToken.create({
        data: { identifier, token, expires },
      });
    },

    async useVerificationToken({ identifier, token }) {
      try {
        return await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
      } catch {
        return null;
      }
    },

    async linkAccount(account) {
      const { ...accountData } = account;
      await prisma.account.create({
        data: {
          ...accountData,
          user: { connect: { id: account.userId } },
        },
      });
      return account as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },

    async getSessionAndUser(sessionToken) {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!userAndSession || !userAndSession.user) return null;

      const { user, ...session } = userAndSession;
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date() : null,
          image: user.image,
        } as AdapterUser,
        session: {
          id: session.id,
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        } as AdapterSession,
      };
    },

    async createSession({ sessionToken, userId, expires }) {
      return prisma.session.create({
        data: { sessionToken, userId, expires },
      });
    },

    async updateSession({ sessionToken, expires }) {
      return prisma.session.update({
        where: { sessionToken },
        data: { expires },
      });
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },
  };
}
