import { join } from 'path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  cacheDirectory: join(process.cwd(), '.cache', 'puppeteer'),
};