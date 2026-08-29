import { PATCH as patchConversation } from "../route";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteParams) {
  return patchConversation(req, ctx);
}
