/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 서버 컴포넌트 외부 패키지 지정 (pdf-parse 번들링 최적화)
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    // 브라우저 클라이언트 번들링 시 node canvas 및 fs 누락 오류 방지
    if (!isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
