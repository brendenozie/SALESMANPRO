

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  return Response.json(getProgress(id!));
}