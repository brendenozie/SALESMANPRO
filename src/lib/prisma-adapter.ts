import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      // Check if user already exists in any table
      const existingConsumer = await prisma.consumer.findUnique({ where: { email: user.email } });
      const existinAgent = await prisma.salesAgent.findUnique({ where: { email: user.email } });
      const existinClient = await prisma.client.findUnique({ where: { email: user.email } });
      const existingAdmin = await prisma.user.findUnique({ where: { email: user.email } });

      if (existingConsumer) return existingConsumer;
      if (existinAgent) return existinAgent;
      if (existinClient) return existinClient;
      if (existingAdmin) return existingAdmin;

      // Determine the user's role (e.g., based on email domain or external provider)
      let role = "CONSUMER"; // Default role

      if (user.email?.endsWith("@merchant.com")) {
        role = "MERCHANT";
      } else if (user.email?.endsWith("@admin.com")) {
        role = "ADMIN";
      }

      // Insert into the correct table
      if (role === "AGENT") {
        return prisma.salesAgent.create({ data: { ...user, role } });
      } else if (role === "ADMIN") {
        return prisma.user.create({ data: { ...user, role } });
      } else if (role === "CLIENT") {
        return prisma.client.create({ data: { ...user, role } });
      } else {
        return prisma.consumer.create({ data: { ...user, role } });
      }
    },

    async getUser(id) {
      return (
        (await prisma.consumer.findUnique({ where: { id } })) ||
        (await prisma.client.findUnique({ where: { id } })) ||
        (await prisma.salesAgent.findUnique({ where: { id } })) ||
        (await prisma.user.findUnique({ where: { id } }))
      );
    },

    async getUserByEmail(email) {
      return (
        (await prisma.consumer.findUnique({ where: { email } })) ||
        (await prisma.client.findUnique({ where: { email } })) ||
        (await prisma.salesAgent.findUnique({ where: { email } })) ||
        (await prisma.user.findUnique({ where: { email } }))
      );
    },

    async updateUser(user) {
      const consumer = await prisma.consumer.findUnique({ where: { id: user.id } });
      if (consumer) return prisma.consumer.update({ where: { id: user.id }, data: user });

      const agent = await prisma.salesAgent.findUnique({ where: { id: user.id } });
      if (agent) return prisma.salesAgent.update({ where: { id: user.id }, data: user });

      const client = await prisma.client.findUnique({ where: { id: user.id } });
      if (client) return prisma.client.update({ where: { id: user.id }, data: user });

      return prisma.user.update({ where: { id: user.id }, data: user });
    },

    async deleteUser(id) {
      await prisma.consumer.deleteMany({ where: { id } });
      await prisma.salesAgent.deleteMany({ where: { id } });
      await prisma.user.deleteMany({ where: { id } });
      await prisma.client.deleteMany({ where: { id } });
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
