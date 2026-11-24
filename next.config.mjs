/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse 라이브러리를 서버 외부 패키지로 지정 (Netlify 서버리스 함수 번들링 최적화)
  serverExternalPackages: ['pdf-parse'],
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
