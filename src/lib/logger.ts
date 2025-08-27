export const isDebugEnabled = () => process.env.SCRAPER_DEBUG === '1' || process.env.DEBUG === '1';

export const debug = (...args: any[]) => {
  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export const info = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.info(...args);
};

export const warn = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.warn(...args);
};

export const error = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.error(...args);
};



