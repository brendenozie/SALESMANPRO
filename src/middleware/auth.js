export function authenticate(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}
