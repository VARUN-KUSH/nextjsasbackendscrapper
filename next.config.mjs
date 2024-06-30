/** @type {import('next').NextConfig} */


const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    // add externals
    config.externals = config.externals || [];
    config.externals.push(
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
      "puppeteer-extra-plugin-adblocker",
      "puppeteer-extra-plugin-block-resources",
      "turndown",
      'puppeteer-extra-plugin-stealth/evasions/chrome.app',
      'puppeteer-extra-plugin-stealth/evasions/chrome.csi',
      'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes',
      'puppeteer-extra-plugin-stealth/evasions/chrome.runtime',
      'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow',
      'puppeteer-extra-plugin-stealth/evasions/media.codecs',
      'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency',
      'puppeteer-extra-plugin-stealth/evasions/navigator.languages',
      'puppeteer-extra-plugin-stealth/evasions/navigator.permissions',
      'puppeteer-extra-plugin-stealth/evasions/navigator.plugins',
      'puppeteer-extra-plugin-stealth/evasions/navigator.vendor',
      'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver',
      'puppeteer-extra-plugin-stealth/evasions/sourceurl',
      'puppeteer-extra-plugin-stealth/evasions/user-agent-override',
      'puppeteer-extra-plugin-stealth/evasions/webgl.vendor',
      'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions',
      'puppeteer-extra-plugin-stealth/evasions/defaultArgs',
     
    );

    return config;
  }
  
};

export default nextConfig;
