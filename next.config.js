/** @type {import('next').NextConfig} */
module.exports = {
  /* YOU MUST ADD ENV HERE*/
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
  },
  reactStrictMode: true,
  env: {
    stripe_public_key: process.env.STRIPE_PUBLIC_KEY,
  },
  images: {
    loader: "custom",
    domains: [
      "t1.gstatic.com",
      "t2.gstatic.com",
      "res.cloudinary.com",
      "t3.gstatic.com",
      "upload.wikimedia.org",
      "links.papareact.com",
      "images.trvl-media.com",
      "hobbyhorsetours.com",
      "/"
    ],
  },
  async headers() {
    return [
        {
            // matching all API routes
            source: "/api/:path*",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
            ]
        }
    ]
}
  // async headers() {
  //   return [
  //     {
  //       source: '/login',
  //       headers: [
  //         {
  //           key: 'Content-Type',
  //           value: 'application/json',
  //         },
  //       ],
  //     },
  //   ]
  // },
};

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true'
//   });
// module.exports = withBundleAnalyzer({});