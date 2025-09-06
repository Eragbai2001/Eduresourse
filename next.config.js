/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google profile images
      "avatars.githubusercontent.com", // GitHub profile images
      "github.githubassets.com", // More GitHub assets
      "avatar.vercel.sh", // Vercel avatars
      "images.unsplash.com", // In case you use Unsplash for demo images
    ],
  },
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
