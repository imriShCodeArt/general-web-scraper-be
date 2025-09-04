// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import puppeteer, { Browser, Page } from 'puppeteer';
import { JSDOM } from 'jsdom';
export class PuppeteerHttpClient {
  private browser: Browser | null = null;
  private isInitialized = stryMutAct_9fa48("4425") ? true : (stryCov_9fa48("4425"), false);

  /**
   * Initialize the Puppeteer browser
   */
  private async initialize(): Promise<void> {
    if (stryMutAct_9fa48("4426")) {
      {}
    } else {
      stryCov_9fa48("4426");
      if (stryMutAct_9fa48("4428") ? false : stryMutAct_9fa48("4427") ? true : (stryCov_9fa48("4427", "4428"), this.isInitialized)) return;
      try {
        if (stryMutAct_9fa48("4429")) {
          {}
        } else {
          stryCov_9fa48("4429");
          this.browser = await puppeteer.launch(stryMutAct_9fa48("4430") ? {} : (stryCov_9fa48("4430"), {
            headless: stryMutAct_9fa48("4431") ? false : (stryCov_9fa48("4431"), true),
            args: stryMutAct_9fa48("4432") ? [] : (stryCov_9fa48("4432"), [stryMutAct_9fa48("4433") ? "" : (stryCov_9fa48("4433"), '--no-sandbox'), stryMutAct_9fa48("4434") ? "" : (stryCov_9fa48("4434"), '--disable-setuid-sandbox'), stryMutAct_9fa48("4435") ? "" : (stryCov_9fa48("4435"), '--disable-dev-shm-usage'), stryMutAct_9fa48("4436") ? "" : (stryCov_9fa48("4436"), '--disable-accelerated-2d-canvas'), stryMutAct_9fa48("4437") ? "" : (stryCov_9fa48("4437"), '--no-first-run'), stryMutAct_9fa48("4438") ? "" : (stryCov_9fa48("4438"), '--no-zygote'), stryMutAct_9fa48("4439") ? "" : (stryCov_9fa48("4439"), '--disable-gpu'), // Performance optimizations
            stryMutAct_9fa48("4440") ? "" : (stryCov_9fa48("4440"), '--disable-background-timer-throttling'), stryMutAct_9fa48("4441") ? "" : (stryCov_9fa48("4441"), '--disable-backgrounding-occluded-windows'), stryMutAct_9fa48("4442") ? "" : (stryCov_9fa48("4442"), '--disable-renderer-backgrounding'), stryMutAct_9fa48("4443") ? "" : (stryCov_9fa48("4443"), '--disable-features=TranslateUI'), stryMutAct_9fa48("4444") ? "" : (stryCov_9fa48("4444"), '--disable-ipc-flooding-protection'), stryMutAct_9fa48("4445") ? "" : (stryCov_9fa48("4445"), '--disable-default-apps'), stryMutAct_9fa48("4446") ? "" : (stryCov_9fa48("4446"), '--disable-extensions'), stryMutAct_9fa48("4447") ? "" : (stryCov_9fa48("4447"), '--disable-plugins'), stryMutAct_9fa48("4448") ? "" : (stryCov_9fa48("4448"), '--disable-sync'), stryMutAct_9fa48("4449") ? "" : (stryCov_9fa48("4449"), '--disable-translate'), stryMutAct_9fa48("4450") ? "" : (stryCov_9fa48("4450"), '--hide-scrollbars'), stryMutAct_9fa48("4451") ? "" : (stryCov_9fa48("4451"), '--mute-audio'), stryMutAct_9fa48("4452") ? "" : (stryCov_9fa48("4452"), '--no-default-browser-check'), stryMutAct_9fa48("4453") ? "" : (stryCov_9fa48("4453"), '--safebrowsing-disable-auto-update'), stryMutAct_9fa48("4454") ? "" : (stryCov_9fa48("4454"), '--disable-web-security'), stryMutAct_9fa48("4455") ? "" : (stryCov_9fa48("4455"), '--disable-features=VizDisplayCompositor')])
          }));
          this.isInitialized = stryMutAct_9fa48("4456") ? false : (stryCov_9fa48("4456"), true);
        }
      } catch (error) {
        if (stryMutAct_9fa48("4457")) {
          {}
        } else {
          stryCov_9fa48("4457");
          if (stryMutAct_9fa48("4460") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("4459") ? false : stryMutAct_9fa48("4458") ? true : (stryCov_9fa48("4458", "4459", "4460"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("4461") ? "" : (stryCov_9fa48("4461"), '1')))) console.error(stryMutAct_9fa48("4462") ? "" : (stryCov_9fa48("4462"), 'Failed to initialize Puppeteer browser:'), error);
          throw error;
        }
      }
    }
  }

  /**
   * Get DOM using Puppeteer (with JavaScript execution)
   */
  async getDom(url: string, options?: {
    waitForSelectors?: string[];
  }): Promise<JSDOM> {
    if (stryMutAct_9fa48("4463")) {
      {}
    } else {
      stryCov_9fa48("4463");
      await this.initialize();
      if (stryMutAct_9fa48("4466") ? false : stryMutAct_9fa48("4465") ? true : stryMutAct_9fa48("4464") ? this.browser : (stryCov_9fa48("4464", "4465", "4466"), !this.browser)) {
        if (stryMutAct_9fa48("4467")) {
          {}
        } else {
          stryCov_9fa48("4467");
          throw new Error(stryMutAct_9fa48("4468") ? "" : (stryCov_9fa48("4468"), 'Browser not initialized'));
        }
      }
      const page = await this.browser.newPage();
      try {
        if (stryMutAct_9fa48("4469")) {
          {}
        } else {
          stryCov_9fa48("4469");
          // Set user agent to avoid detection
          await page.setUserAgent(stryMutAct_9fa48("4470") ? "" : (stryCov_9fa48("4470"), 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'));

          // Enhanced performance optimizations - block more unnecessary resources
          await page.setRequestInterception(stryMutAct_9fa48("4471") ? false : (stryCov_9fa48("4471"), true));
          page.on(stryMutAct_9fa48("4472") ? "" : (stryCov_9fa48("4472"), 'request'), req => {
            if (stryMutAct_9fa48("4473")) {
              {}
            } else {
              stryCov_9fa48("4473");
              const type = req.resourceType();
              const url = req.url();

              // Block more resource types for faster loading
              if (stryMutAct_9fa48("4475") ? false : stryMutAct_9fa48("4474") ? true : (stryCov_9fa48("4474", "4475"), (stryMutAct_9fa48("4476") ? [] : (stryCov_9fa48("4476"), [stryMutAct_9fa48("4477") ? "" : (stryCov_9fa48("4477"), 'font'), stryMutAct_9fa48("4478") ? "" : (stryCov_9fa48("4478"), 'media'), stryMutAct_9fa48("4479") ? "" : (stryCov_9fa48("4479"), 'stylesheet'), stryMutAct_9fa48("4480") ? "" : (stryCov_9fa48("4480"), 'image')])).includes(type))) {
                if (stryMutAct_9fa48("4481")) {
                  {}
                } else {
                  stryCov_9fa48("4481");
                  return req.abort();
                }
              }

              // Block analytics and tracking scripts
              if (stryMutAct_9fa48("4484") ? (url.includes('google-analytics') || url.includes('facebook') || url.includes('doubleclick') || url.includes('googletagmanager') || url.includes('hotjar')) && url.includes('mixpanel') : stryMutAct_9fa48("4483") ? false : stryMutAct_9fa48("4482") ? true : (stryCov_9fa48("4482", "4483", "4484"), (stryMutAct_9fa48("4486") ? (url.includes('google-analytics') || url.includes('facebook') || url.includes('doubleclick') || url.includes('googletagmanager')) && url.includes('hotjar') : stryMutAct_9fa48("4485") ? false : (stryCov_9fa48("4485", "4486"), (stryMutAct_9fa48("4488") ? (url.includes('google-analytics') || url.includes('facebook') || url.includes('doubleclick')) && url.includes('googletagmanager') : stryMutAct_9fa48("4487") ? false : (stryCov_9fa48("4487", "4488"), (stryMutAct_9fa48("4490") ? (url.includes('google-analytics') || url.includes('facebook')) && url.includes('doubleclick') : stryMutAct_9fa48("4489") ? false : (stryCov_9fa48("4489", "4490"), (stryMutAct_9fa48("4492") ? url.includes('google-analytics') && url.includes('facebook') : stryMutAct_9fa48("4491") ? false : (stryCov_9fa48("4491", "4492"), url.includes(stryMutAct_9fa48("4493") ? "" : (stryCov_9fa48("4493"), 'google-analytics')) || url.includes(stryMutAct_9fa48("4494") ? "" : (stryCov_9fa48("4494"), 'facebook')))) || url.includes(stryMutAct_9fa48("4495") ? "" : (stryCov_9fa48("4495"), 'doubleclick')))) || url.includes(stryMutAct_9fa48("4496") ? "" : (stryCov_9fa48("4496"), 'googletagmanager')))) || url.includes(stryMutAct_9fa48("4497") ? "" : (stryCov_9fa48("4497"), 'hotjar')))) || url.includes(stryMutAct_9fa48("4498") ? "" : (stryCov_9fa48("4498"), 'mixpanel')))) {
                if (stryMutAct_9fa48("4499")) {
                  {}
                } else {
                  stryCov_9fa48("4499");
                  return req.abort();
                }
              }
              return req.continue();
            }
          });

          // Navigate to the page with optimized wait strategy
          await page.goto(url, stryMutAct_9fa48("4500") ? {} : (stryCov_9fa48("4500"), {
            waitUntil: stryMutAct_9fa48("4501") ? "" : (stryCov_9fa48("4501"), 'domcontentloaded'),
            // Changed from 'networkidle2' to 'domcontentloaded' for faster loading
            timeout: 20000 // Reduced from 30000ms to 20000ms
          }));

          // Smart selector waiting with reduced timeout
          if (stryMutAct_9fa48("4504") ? options?.waitForSelectors || options.waitForSelectors.length > 0 : stryMutAct_9fa48("4503") ? false : stryMutAct_9fa48("4502") ? true : (stryCov_9fa48("4502", "4503", "4504"), (stryMutAct_9fa48("4505") ? options.waitForSelectors : (stryCov_9fa48("4505"), options?.waitForSelectors)) && (stryMutAct_9fa48("4508") ? options.waitForSelectors.length <= 0 : stryMutAct_9fa48("4507") ? options.waitForSelectors.length >= 0 : stryMutAct_9fa48("4506") ? true : (stryCov_9fa48("4506", "4507", "4508"), options.waitForSelectors.length > 0)))) {
            if (stryMutAct_9fa48("4509")) {
              {}
            } else {
              stryCov_9fa48("4509");
              for (const selector of options.waitForSelectors) {
                if (stryMutAct_9fa48("4510")) {
                  {}
                } else {
                  stryCov_9fa48("4510");
                  try {
                    if (stryMutAct_9fa48("4511")) {
                      {}
                    } else {
                      stryCov_9fa48("4511");
                      await page.waitForSelector(selector, stryMutAct_9fa48("4512") ? {} : (stryCov_9fa48("4512"), {
                        timeout: 5000
                      })); // Reduced from 10000ms to 5000ms
                    }
                  } catch (error) {
                    if (stryMutAct_9fa48("4513")) {
                      {}
                    } else {
                      stryCov_9fa48("4513");
                      console.warn(stryMutAct_9fa48("4514") ? `` : (stryCov_9fa48("4514"), `Selector ${selector} not found within timeout`));
                    }
                  }
                }
              }
            }
          }

          // Faster image loading strategy - only wait for critical selectors
          try {
            if (stryMutAct_9fa48("4515")) {
              {}
            } else {
              stryCov_9fa48("4515");
              await page.waitForSelector(stryMutAct_9fa48("4516") ? "" : (stryCov_9fa48("4516"), '.product-gallery, .product__media-list, .product__media-item img, picture source'), stryMutAct_9fa48("4517") ? {} : (stryCov_9fa48("4517"), {
                timeout: 5000
              })); // Reduced timeout
            }
          } catch {
            // Ignore timeout errors and continue
          }

          // Optimized scrolling - single scroll instead of multiple
          await page.evaluate(() => {
            if (stryMutAct_9fa48("4518")) {
              {}
            } else {
              stryCov_9fa48("4518");
              window.scrollTo(0, document.body.scrollHeight);
            }
          });

          // Reduced wait time for images
          await new Promise(stryMutAct_9fa48("4519") ? () => undefined : (stryCov_9fa48("4519"), resolve => setTimeout(resolve, 500))); // Reduced from 1000ms to 500ms

          // Extra: dump selector counts when debugging
          if (stryMutAct_9fa48("4522") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("4521") ? false : stryMutAct_9fa48("4520") ? true : (stryCov_9fa48("4520", "4521", "4522"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("4523") ? "" : (stryCov_9fa48("4523"), '1')))) {
            if (stryMutAct_9fa48("4524")) {
              {}
            } else {
              stryCov_9fa48("4524");
              const counts = await page.evaluate(stryMutAct_9fa48("4525") ? () => undefined : (stryCov_9fa48("4525"), () => stryMutAct_9fa48("4526") ? {} : (stryCov_9fa48("4526"), {
                gallery: document.querySelectorAll(stryMutAct_9fa48("4527") ? "" : (stryCov_9fa48("4527"), '.product-gallery')).length,
                mediaList: document.querySelectorAll(stryMutAct_9fa48("4528") ? "" : (stryCov_9fa48("4528"), '.product__media-list')).length,
                mediaItemImg: document.querySelectorAll(stryMutAct_9fa48("4529") ? "" : (stryCov_9fa48("4529"), '.product__media-item img')).length,
                pictureSrc: document.querySelectorAll(stryMutAct_9fa48("4530") ? "" : (stryCov_9fa48("4530"), 'picture source')).length,
                imgTotal: document.querySelectorAll(stryMutAct_9fa48("4531") ? "" : (stryCov_9fa48("4531"), 'img')).length
              })));
              // eslint-disable-next-line no-console
              console.log(stryMutAct_9fa48("4532") ? "" : (stryCov_9fa48("4532"), '[puppeteer] selector counts'), counts);
            }
          }

          // Wait for variations to load (WooCommerce specific) - optimized for speed
          await this.waitForWooCommerceVariations(page);

          // Get the final HTML after JavaScript execution
          const html = await page.content();

          // Create JSDOM from the rendered HTML
          const dom = new JSDOM(html, stryMutAct_9fa48("4533") ? {} : (stryCov_9fa48("4533"), {
            url
          }));

          // Optional HTML snapshot when debugging
          if (stryMutAct_9fa48("4536") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("4535") ? false : stryMutAct_9fa48("4534") ? true : (stryCov_9fa48("4534", "4535", "4536"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("4537") ? "" : (stryCov_9fa48("4537"), '1')))) {
            if (stryMutAct_9fa48("4538")) {
              {}
            } else {
              stryCov_9fa48("4538");
              try {
                if (stryMutAct_9fa48("4539")) {
                  {}
                } else {
                  stryCov_9fa48("4539");
                  const {
                    writeFileSync,
                    mkdirSync,
                    existsSync
                  } = await import(stryMutAct_9fa48("4540") ? "" : (stryCov_9fa48("4540"), 'fs'));
                  if (stryMutAct_9fa48("4543") ? false : stryMutAct_9fa48("4542") ? true : stryMutAct_9fa48("4541") ? existsSync('./debug') : (stryCov_9fa48("4541", "4542", "4543"), !existsSync(stryMutAct_9fa48("4544") ? "" : (stryCov_9fa48("4544"), './debug')))) mkdirSync(stryMutAct_9fa48("4545") ? "" : (stryCov_9fa48("4545"), './debug'));
                  const ts = Date.now();
                  writeFileSync(stryMutAct_9fa48("4546") ? `` : (stryCov_9fa48("4546"), `./debug/page-${ts}.html`), html);
                  if (stryMutAct_9fa48("4549") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("4548") ? false : stryMutAct_9fa48("4547") ? true : (stryCov_9fa48("4547", "4548", "4549"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("4550") ? "" : (stryCov_9fa48("4550"), '1')))) console.log(stryMutAct_9fa48("4551") ? `` : (stryCov_9fa48("4551"), `[puppeteer] HTML snapshot saved: debug/page-${ts}.html`));
                }
              } catch (e) {
                if (stryMutAct_9fa48("4552")) {
                  {}
                } else {
                  stryCov_9fa48("4552");
                  if (stryMutAct_9fa48("4555") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("4554") ? false : stryMutAct_9fa48("4553") ? true : (stryCov_9fa48("4553", "4554", "4555"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("4556") ? "" : (stryCov_9fa48("4556"), '1')))) console.warn(stryMutAct_9fa48("4557") ? "" : (stryCov_9fa48("4557"), 'Failed to write HTML snapshot'), e);
                }
              }
            }
          }
          return dom;
        }
      } finally {
        if (stryMutAct_9fa48("4558")) {
          {}
        } else {
          stryCov_9fa48("4558");
          await page.close();
        }
      }
    }
  }

  /**
   * Wait for WooCommerce variations to load - optimized for speed
   */
  private async waitForWooCommerceVariations(page: Page): Promise<void> {
    if (stryMutAct_9fa48("4559")) {
      {}
    } else {
      stryCov_9fa48("4559");
      try {
        if (stryMutAct_9fa48("4560")) {
          {}
        } else {
          stryCov_9fa48("4560");
          // Quick check for variation forms (most common case)
          const hasVariations = await page.evaluate(() => {
            if (stryMutAct_9fa48("4561")) {
              {}
            } else {
              stryCov_9fa48("4561");
              const variationForms = document.querySelectorAll(stryMutAct_9fa48("4562") ? "" : (stryCov_9fa48("4562"), '.variations_form, .woocommerce-variations, form[class*="variations"]'));
              return stryMutAct_9fa48("4566") ? variationForms.length <= 0 : stryMutAct_9fa48("4565") ? variationForms.length >= 0 : stryMutAct_9fa48("4564") ? false : stryMutAct_9fa48("4563") ? true : (stryCov_9fa48("4563", "4564", "4565", "4566"), variationForms.length > 0);
            }
          });
          if (stryMutAct_9fa48("4568") ? false : stryMutAct_9fa48("4567") ? true : (stryCov_9fa48("4567", "4568"), hasVariations)) {
            if (stryMutAct_9fa48("4569")) {
              {}
            } else {
              stryCov_9fa48("4569");
              // Only wait for essential elements if variations exist
              await page.waitForFunction(() => {
                if (stryMutAct_9fa48("4570")) {
                  {}
                } else {
                  stryCov_9fa48("4570");
                  const forms = document.querySelectorAll(stryMutAct_9fa48("4571") ? "" : (stryCov_9fa48("4571"), '.variations_form, .woocommerce-variations'));
                  return stryMutAct_9fa48("4575") ? forms.length <= 0 : stryMutAct_9fa48("4574") ? forms.length >= 0 : stryMutAct_9fa48("4573") ? false : stryMutAct_9fa48("4572") ? true : (stryCov_9fa48("4572", "4573", "4574", "4575"), forms.length > 0);
                }
              }, stryMutAct_9fa48("4576") ? {} : (stryCov_9fa48("4576"), {
                timeout: 2000
              })); // Reduced from 3000

              // Minimal wait for dynamic content
              await new Promise(stryMutAct_9fa48("4577") ? () => undefined : (stryCov_9fa48("4577"), resolve => setTimeout(resolve, 200))); // Reduced from 500
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("4578")) {
          {}
        } else {
          stryCov_9fa48("4578");
          if (stryMutAct_9fa48("4581") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("4580") ? false : stryMutAct_9fa48("4579") ? true : (stryCov_9fa48("4579", "4580", "4581"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("4582") ? "" : (stryCov_9fa48("4582"), '1')))) console.warn(stryMutAct_9fa48("4583") ? "" : (stryCov_9fa48("4583"), 'WooCommerce variations not detected, continuing without waiting'));
        }
      }
    }
  }

  /**
   * Get DOM using traditional JSDOM (fallback)
   */
  async getDomFallback(url: string): Promise<JSDOM> {
    if (stryMutAct_9fa48("4584")) {
      {}
    } else {
      stryCov_9fa48("4584");
      const response = await fetch(url);
      const html = await response.text();
      return new JSDOM(html, stryMutAct_9fa48("4585") ? {} : (stryCov_9fa48("4585"), {
        url
      }));
    }
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (stryMutAct_9fa48("4586")) {
      {}
    } else {
      stryCov_9fa48("4586");
      if (stryMutAct_9fa48("4588") ? false : stryMutAct_9fa48("4587") ? true : (stryCov_9fa48("4587", "4588"), this.browser)) {
        if (stryMutAct_9fa48("4589")) {
          {}
        } else {
          stryCov_9fa48("4589");
          await this.browser.close();
          this.browser = null;
          this.isInitialized = stryMutAct_9fa48("4590") ? true : (stryCov_9fa48("4590"), false);
        }
      }
    }
  }

  /**
   * Check if Puppeteer is available
   */
  isAvailable(): boolean {
    if (stryMutAct_9fa48("4591")) {
      {}
    } else {
      stryCov_9fa48("4591");
      return stryMutAct_9fa48("4594") ? this.isInitialized || this.browser !== null : stryMutAct_9fa48("4593") ? false : stryMutAct_9fa48("4592") ? true : (stryCov_9fa48("4592", "4593", "4594"), this.isInitialized && (stryMutAct_9fa48("4596") ? this.browser === null : stryMutAct_9fa48("4595") ? true : (stryCov_9fa48("4595", "4596"), this.browser !== null)));
    }
  }
}