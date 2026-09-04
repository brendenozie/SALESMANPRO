"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPrismaAdapter = void 0;
const client_1 = require("@prisma/client");
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
function CustomPrismaAdapter() {
    return {
        async createUser(user) {
            const existingAdmin = await prismadb_1.default.user.findUnique({ where: { email: user.email } });
            if (existingAdmin) {
                return {
                    id: existingAdmin.id,
                    name: existingAdmin.name,
                    email: existingAdmin.email,
                    emailVerified: existingAdmin.emailVerified ? new Date() : null,
                    image: existingAdmin.image,
                };
            }
            let role = client_1.ROLES.USER;
            if (user.email?.endsWith("@merchant.com")) {
                role = client_1.ROLES.AGENT;
            }
            else if (user.email?.endsWith("@admin.com")) {
                role = client_1.ROLES.ADMIN;
            }
            const createdUser = await prismadb_1.default.user.create({
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
            };
        },
        async getUser(id) {
            const user = await prismadb_1.default.user.findUnique({ where: { id } });
            if (!user)
                return null;
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified ? new Date() : null,
                image: user.image,
            };
        },
        async getUserByEmail(email) {
            const user = await prismadb_1.default.user.findUnique({ where: { email } });
            if (!user)
                return null;
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified ? new Date() : null,
                image: user.image,
            };
        },
        async getUserByAccount({ provider, providerAccountId }) {
            const account = await prismadb_1.default.account.findUnique({
                where: {
                    provider_providerAccountId: {
                        provider,
                        providerAccountId,
                    },
                },
                include: { user: true },
            });
            if (!account || !account.user)
                return null;
            return {
                id: account.user.id,
                name: account.user.name,
                email: account.user.email,
                emailVerified: account.user.emailVerified ? new Date() : null,
                image: account.user.image,
            };
        },
        async updateUser(user) {
            const { emailVerified, ...restUser } = user;
            const updatedUser = await prismadb_1.default.user.update({
                where: { id: user.id },
                data: {
                    ...restUser,
                    role: user.role || client_1.ROLES.USER,
                    emailVerified: typeof emailVerified === "boolean" ? emailVerified : !!emailVerified,
                },
            });
            return {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                emailVerified: updatedUser.emailVerified ? new Date() : null,
                image: updatedUser.image,
            };
        },
        async deleteUser(id) {
            await prismadb_1.default.user.deleteMany({ where: { id } });
        },
        async createVerificationToken({ identifier, token, expires }) {
            return prismadb_1.default.verificationToken.create({
                data: { identifier, token, expires },
            });
        },
        async useVerificationToken({ identifier, token }) {
            try {
                return await prismadb_1.default.verificationToken.delete({
                    where: { identifier_token: { identifier, token } },
                });
            }
            catch {
                return null;
            }
        },
        async linkAccount(account) {
            const { ...accountData } = account;
            await prismadb_1.default.account.create({
                data: {
                    ...accountData,
                    user: { connect: { id: account.userId } },
                },
            });
            return account;
        },
        async unlinkAccount({ provider, providerAccountId }) {
            await prismadb_1.default.account.delete({
                where: {
                    provider_providerAccountId: {
                        provider,
                        providerAccountId,
                    },
                },
            });
        },
        async getSessionAndUser(sessionToken) {
            const userAndSession = await prismadb_1.default.session.findUnique({
                where: { sessionToken },
                include: { user: true },
            });
            if (!userAndSession || !userAndSession.user)
                return null;
            const { user, ...session } = userAndSession;
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    emailVerified: user.emailVerified ? new Date() : null,
                    image: user.image,
                },
                session: {
                    id: session.id,
                    userId: session.userId,
                    expires: session.expires,
                    sessionToken: session.sessionToken,
                },
            };
        },
        async createSession({ sessionToken, userId, expires }) {
            return prismadb_1.default.session.create({
                data: { sessionToken, userId, expires },
            });
        },
        async updateSession({ sessionToken, expires }) {
            return prismadb_1.default.session.update({
                where: { sessionToken },
                data: { expires },
            });
        },
        async deleteSession(sessionToken) {
            await prismadb_1.default.session.delete({ where: { sessionToken } });
        },
    };
}
exports.CustomPrismaAdapter = CustomPrismaAdapter;
