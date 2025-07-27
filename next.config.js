/* eslint-disable */
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: 
    typedRoutes: true,
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com'
    ]
  }
};

module.exports = nextConfig;
