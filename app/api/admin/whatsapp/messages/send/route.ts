import { POST as sendMessage } from "../route";

export async function POST(req: Request) {
  return sendMessage(req);
}
