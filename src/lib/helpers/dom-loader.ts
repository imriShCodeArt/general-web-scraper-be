// DOM acquisition strategy helpers per Phase 4

import { JSDOM } from 'jsdom';
import { PuppeteerHttpClient } from '../infrastructure/http/puppeteer-http-client';
import { HttpClient } from '../infrastructure/http/http-client';

export interface DomLoaderOptions {
  httpClient: HttpClient;
  puppeteerClient?: PuppeteerHttpClient;
  useHeadless?: boolean;
  timeout?: number;
}

export interface DomLoaderStrategy {
  httpClient: HttpClient;
  puppeteerClient?: PuppeteerHttpClient;
  useHeadless: boolean;
}

export async function getDomWithStrategy(
  url: string,
  options: DomLoaderOptions,
  strategy: DomLoaderStrategy,
): Promise<JSDOM> {
  const { httpClient, puppeteerClient, useHeadless } = strategy;

  try {
    if (useHeadless && puppeteerClient) {
      // Use Puppeteer for JavaScript-heavy sites
      return await puppeteerClient.getDom(url, { waitForSelectors: [] });
    } else {
      // Use HTTP client for static content
      return await httpClient.getDom(url);
    }
  } catch (error) {
    // Fallback to HTTP client if Puppeteer fails
    if (useHeadless && puppeteerClient) {
      try {
        return await httpClient.getDom(url);
      } catch (fallbackError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load DOM for ${url}: ${errorMessage}`);
      }
    }
    throw error;
  }
}

export function createDomLoaderStrategy(
  httpClient: HttpClient,
  puppeteerClient?: PuppeteerHttpClient,
  useHeadless = false,
): DomLoaderStrategy {
  return {
    httpClient,
    puppeteerClient,
    useHeadless,
  };
}
