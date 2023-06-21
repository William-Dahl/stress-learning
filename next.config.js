require("dotenv").config();

module.exports = {
  publicRuntimeConfig: {
    SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  },
  reactStrictMode: false,
  // webpack: (config) => {
  //   config.module.rules.push({ test: /\.ts$/, loader: "ts-loader" });
  //   config.module.rules.push({ test: /\.node$/, use: "node-loader" });

  // config.resolve.fallback = { fs: false };

  //   return config;
  // },
};
