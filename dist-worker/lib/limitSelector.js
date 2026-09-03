// import {
//   apiLimiter,
//   authLimiter,
//   generalLimiter,
//   burstLimiter,
// } from "./rate-limit";
// export function selectLimiters(pathname: string) {
//   if (pathname.startsWith("/api/auth")) {
//     return [authLimiter, burstLimiter];
//   }
//   if (pathname.startsWith("/api")) {
//     return [apiLimiter, burstLimiter];
//   }
//   return [generalLimiter, burstLimiter];
// }
