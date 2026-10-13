"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownsPDFProject = exports.getPDFSessionIdentity = void 0;
const next_auth_1 = require("next-auth");
const auth_1 = require("@/lib/auth");
async function getPDFSessionIdentity() {
    const session = await (0, next_auth_1.getServerSession)(auth_1.authOptions);
    const user = session?.user;
    if (!user?.id || !user.companyId)
        return null;
    return { userId: user.id, companyId: user.companyId };
}
exports.getPDFSessionIdentity = getPDFSessionIdentity;
function ownsPDFProject(project, identity) {
    return project.userId === identity.userId && project.companyId === identity.companyId;
}
exports.ownsPDFProject = ownsPDFProject;
