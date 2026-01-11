// frontend/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 윈도우 환경에서 핫 리로딩(Hot Reloading)이 잘 되도록 설정
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Spline 라이브러리를 빌드에 포함시키기 위한 설정 (이 부분 추가!)
  transpilePackages: ['@splinetool/react-spline'], 
};

export default nextConfig;
