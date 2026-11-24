/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse와 같은 Node.js 전용 바이너리/라이브러리를 서버 컴포넌트 외부 패키지로 지정
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  webpack: (config) => {
    // pdf-parse의 node-canvas 의존성 및 fs 모듈 브라우저 번들링 오류 방지
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
