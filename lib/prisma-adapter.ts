import { PrismaClient, ROLE } from "@prisma/client";
import { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";

const prisma = new PrismaClient();

export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(user: AdapterUser) {
      
      // const { email, name, image, signupPath } = user;

      // // Determine role based on signup path
      // let role = "USER";
      // if (signupPath?.includes("/admin") || signupPath?.includes("/dashboard")) {
      //   role = "ADMIN";
      // } else if (signupPath?.includes("/client")) {
      //   role = "CLIENT";
      // } else if (signupPath?.includes("/agent")) {
      //   role = "AGENT";
      // }

      // Check if user already exists in any table
      // const existingConsumer = await prisma.consumer.findUnique({ where: { email: user.email } });
      // const existinAgent = await prisma.salesAgent.findUnique({ where: { email: user.email } });
      // const existinClient = await prisma.client.findUnique({ where: { email: user.email } });
      const existingAdmin = await prisma.user.findUnique({ where: { email: user.email } });

      // if (existingConsumer) return {
      //   id: existingConsumer.id,
      //   name: existingConsumer.name,
      //   email: existingConsumer.email,
      //   emailVerified: existingConsumer.emailVerified,
      //   image: existingConsumer.image,
      // } as AdapterUser;
      // if (existinAgent) return {
      //   id: existinAgent.id,
      //   name: existinAgent.name,
      //   email: existinAgent.email,
      //   emailVerified: existinAgent.emailVerified,
      //   image: existinAgent.image,
      // } as AdapterUser;
      // if (existinClient) return {
      //   id: existinClient.id,
      //   name: existinClient.name,
      //   email: existinClient.email,
      //   emailVerified: existinClient.emailVerified,
      //   image: existinClient.image,
      // } as AdapterUser;
      if (existingAdmin) 
        return {
        id: existingAdmin.id,
        name: existingAdmin.name,
        email: existingAdmin.email,
        emailVerified: existingAdmin.emailVerified,
        image: existingAdmin.image,
      } as AdapterUser;

      // Determine the user's role (e.g., based on email domain or external provider)
      let role: ROLE = ROLE.USER; // Default role
      
      if (user.email?.endsWith("@merchant.com")) {
          role = ROLE.AGENT;
        } else if (user.email?.endsWith("@admin.com")) {
          role = ROLE.CLIENT;
        }else if (user.email?.endsWith("@admin.com")) {
          role = ROLE.ADMIN;
        }else{
          role = ROLE.USER;
        }

      // Insert into the correct table
      // if (role === "AGENT") {
      //   const createdUser = await prisma.salesAgent.create({ data: { ...user, role } });
      //   return {
      //     id: createdUser.id,
      //     name: createdUser.name,
      //     email: createdUser.email,
      //     emailVerified: createdUser.emailVerified,
      //     image: createdUser.image,
      //   } as AdapterUser;
      // } else if (role === "ADMIN") {
      //   const createdUser = await prisma.user.create({ data: { ...user, role } });
      //   return {
      //     id: createdUser.id,
      //     name: createdUser.name,
      //     email: createdUser.email,
      //     emailVerified: createdUser.emailVerified,
      //     image: createdUser.image,
      //   } as AdapterUser;
      // } else if (role === "CLIENT") {
      //   const createdUser = await prisma.client.create({ data: { ...user, role } });
      //   return {
      //     id: createdUser.id,
      //     name: createdUser.name,
      //     email: createdUser.email,
      //     emailVerified: createdUser.emailVerified,
      //     image: createdUser.image,
      //   } as AdapterUser;
      // } else {
      //   const createdUser = await prisma.consumer.create({ data: { ...user, role } });
      //   return {
      //     id: createdUser.id,
      //     name: createdUser.name,
      //     email: createdUser.email,
      //     emailVerified: createdUser.emailVerified,
      //     image: createdUser.image,
      //   } as AdapterUser;
      // }
    },

    async getUser(id) {
      const user = 
        // (await prisma.consumer.findUnique({ where: { id } })) ||
        // (await prisma.client.findUnique({ where: { id } })) ||
        // (await prisma.salesAgent.findUnique({ where: { id } })) ||
        (await prisma.user.findUnique({ where: { id } }));

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const user =
        // (await prisma.consumer.findUnique({ where: { email } })) ||
        // (await prisma.client.findUnique({ where: { email } })) ||
        // (await prisma.salesAgent.findUnique({ where: { email } })) ||
        (await prisma.user.findUnique({ where: { email } }));

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async updateUser(user) {
      // const consumer = await prisma.consumer.findUnique({ where: { id: user.id } });
      // if (consumer) {
      //   const updatedConsumer = await prisma.consumer.update({ where: { id: user.id }, data: { ...user, role: user.role as unknown as ROLE } });
      //   return {
      //     id: updatedConsumer.id,
      //     name: updatedConsumer.name,
      //     email: updatedConsumer.email,
      //     emailVerified: updatedConsumer.emailVerified,
      //     image: updatedConsumer.image,
      //   } as AdapterUser;
      // }

      // const agent = await prisma.salesAgent.findUnique({ where: { id: user.id } });
      // if (agent) {
      //   const updatedAgent = await prisma.salesAgent.update({ where: { id: user.id }, data: { ...user, role: user.role as unknown as ROLE } });
      //   return {
      //     id: updatedAgent.id,
      //     name: updatedAgent.name,
      //     email: updatedAgent.email,
      //     emailVerified: updatedAgent.emailVerified,
      //     image: updatedAgent.image,
      //   } as AdapterUser;
      // }

      // const client = await prisma.client.findUnique({ where: { id: user.id } });
      // if (client) {
      //   const updatedClient = await prisma.client.update({ where: { id: user.id }, data: { ...user, role: user.role as unknown as ROLE } });
      //   return {
      //     id: updatedClient.id,
      //     name: updatedClient.name,
      //     email: updatedClient.email,
      //     emailVerified: updatedClient.emailVerified,
      //     image: updatedClient.image,
      //   } as AdapterUser;
      // }

      const { emailVerified, ...restUser } = user;
      const updatedUser = await prisma.user.update({ 
        where: { id: user.id }, 
        data: { 
          ...restUser, 
          role: user.role as unknown as ROLE,
          emailVerified: typeof emailVerified === "boolean" ? emailVerified : !!emailVerified
        } 
      });
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        image: updatedUser.image,
      } as AdapterUser;
    },

    async deleteUser(id) {
      await prisma.consumer.deleteMany({ where: { id } });
      await prisma.salesAgent.deleteMany({ where: { id } });
      await prisma.user.deleteMany({ where: { id } });
      await prisma.client.deleteMany({ where: { id } });
    },

    async createVerificationToken({ identifier, token, expires }) {
      return prisma.verificationToken.create({
        data: { identifier, token, expires },
      });
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const verificationToken = await prisma.verificationToken.findUnique({
          where: { identifier_token: { identifier, token } },
        });

        if (!verificationToken) return null;

        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });

        return verificationToken;
      } catch (error) {
        return null;
      }
    },

    async linkAccount(account: AdapterAccount) {
      const createdAccount = await prisma.account.create({ data: account });
      return createdAccount as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
      return undefined;
    },

    // async getSessionAndUser(sessionToken): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
    //   const session = await prisma.session.findUnique({
    //     where: { sessionToken },
    //     include: { user: true },
    //   });

    //   if (!session) return null;
    //   // session.user.role as unknown as ROLE || undefined
    //   let role = session.user.role as unknown as ROLE || undefined; // Default role
        
    //   return {
    //     session,
    //     user: {
    //       ...session.user,
    //       role : session.user.role as unknown as ROLE || undefined,
    //     },
    //   };
    // },

    async createSession(session) {
      return prisma.session.create({ data: session });
    },

    async updateSession(session) {
      return prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: session,
      });
    },

    async deleteSession(sessionToken) {
      return prisma.session.delete({ where: { sessionToken } });
    },
  };

}

// export function CustomPrismaAdapter(): Adapter {
//   return {
//     ...require("@next-auth/prisma-adapter").PrismaAdapter(prisma),
    
//     async getUser(id) {
//       return prisma.consumer.findUnique({ where: { id } });
//     },

//     async getUserByEmail(email) {
//       return prisma.consumer.findUnique({ where: { email } });
//     },

//     async createUser(user) {
//       return prisma.consumer.create({ data: user });
//     },

//     async updateUser(user) {
//       return prisma.consumer.update({ where: { id: user.id }, data: user });
//     },

//     async deleteUser(id) {
//       return prisma.consumer.delete({ where: { id } });
//     },
//   };
// }
