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
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { JSDOM } from 'jsdom';
import { JsonData } from '../types';
export class HttpClient {
  private userAgents = stryMutAct_9fa48("3729") ? [] : (stryCov_9fa48("3729"), [stryMutAct_9fa48("3730") ? "" : (stryCov_9fa48("3730"), 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'), stryMutAct_9fa48("3731") ? "" : (stryCov_9fa48("3731"), 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'), stryMutAct_9fa48("3732") ? "" : (stryCov_9fa48("3732"), 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')]);
  constructor() {
    if (stryMutAct_9fa48("3733")) {
      {}
    } else {
      stryCov_9fa48("3733");
      // Set default axios configuration
      axios.defaults.timeout = 30000;
      axios.defaults.maxRedirects = 5;
      axios.defaults.validateStatus = stryMutAct_9fa48("3734") ? () => undefined : (stryCov_9fa48("3734"), status => stryMutAct_9fa48("3738") ? status >= 400 : stryMutAct_9fa48("3737") ? status <= 400 : stryMutAct_9fa48("3736") ? false : stryMutAct_9fa48("3735") ? true : (stryCov_9fa48("3735", "3736", "3737", "3738"), status < 400));
    }
  }

  /**
   * Get a random user agent
   */
  private getRandomUserAgent(): string {
    if (stryMutAct_9fa48("3739")) {
      {}
    } else {
      stryCov_9fa48("3739");
      return this.userAgents[Math.floor(stryMutAct_9fa48("3740") ? Math.random() / this.userAgents.length : (stryCov_9fa48("3740"), Math.random() * this.userAgents.length))];
    }
  }

  /**
   * Make a GET request with proper generic typing
   */
  async get<T = string>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (stryMutAct_9fa48("3741")) {
      {}
    } else {
      stryCov_9fa48("3741");
      try {
        if (stryMutAct_9fa48("3742")) {
          {}
        } else {
          stryCov_9fa48("3742");
          const response: AxiosResponse<T> = await axios.get(url, stryMutAct_9fa48("3743") ? {} : (stryCov_9fa48("3743"), {
            ...config,
            headers: stryMutAct_9fa48("3744") ? {} : (stryCov_9fa48("3744"), {
              'User-Agent': this.getRandomUserAgent(),
              'Accept': stryMutAct_9fa48("3745") ? "" : (stryCov_9fa48("3745"), 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'),
              'Accept-Language': stryMutAct_9fa48("3746") ? "" : (stryCov_9fa48("3746"), 'en-US,en;q=0.5'),
              'Accept-Encoding': stryMutAct_9fa48("3747") ? "" : (stryCov_9fa48("3747"), 'gzip, deflate'),
              'Connection': stryMutAct_9fa48("3748") ? "" : (stryCov_9fa48("3748"), 'keep-alive'),
              'Upgrade-Insecure-Requests': stryMutAct_9fa48("3749") ? "" : (stryCov_9fa48("3749"), '1'),
              ...(stryMutAct_9fa48("3750") ? config.headers : (stryCov_9fa48("3750"), config?.headers))
            })
          }));
          return response.data;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3751")) {
          {}
        } else {
          stryCov_9fa48("3751");
          if (stryMutAct_9fa48("3753") ? false : stryMutAct_9fa48("3752") ? true : (stryCov_9fa48("3752", "3753"), axios.isAxiosError(error))) {
            if (stryMutAct_9fa48("3754")) {
              {}
            } else {
              stryCov_9fa48("3754");
              throw new Error(stryMutAct_9fa48("3755") ? `` : (stryCov_9fa48("3755"), `HTTP GET request failed: ${error.message} (${stryMutAct_9fa48("3756") ? error.response.status : (stryCov_9fa48("3756"), error.response?.status)})`));
            }
          }
          throw new Error(stryMutAct_9fa48("3757") ? `` : (stryCov_9fa48("3757"), `HTTP GET request failed: ${error}`));
        }
      }
    }
  }

  /**
   * Make a POST request with proper generic typing
   */
  async post<T = JsonData<unknown>>(url: string, data?: JsonData<unknown>, config?: AxiosRequestConfig): Promise<T> {
    if (stryMutAct_9fa48("3758")) {
      {}
    } else {
      stryCov_9fa48("3758");
      try {
        if (stryMutAct_9fa48("3759")) {
          {}
        } else {
          stryCov_9fa48("3759");
          const response: AxiosResponse<T> = await axios.post(url, data, stryMutAct_9fa48("3760") ? {} : (stryCov_9fa48("3760"), {
            ...config,
            headers: stryMutAct_9fa48("3761") ? {} : (stryCov_9fa48("3761"), {
              'User-Agent': this.getRandomUserAgent(),
              'Content-Type': stryMutAct_9fa48("3762") ? "" : (stryCov_9fa48("3762"), 'application/json'),
              'Accept': stryMutAct_9fa48("3763") ? "" : (stryCov_9fa48("3763"), 'application/json, text/plain, */*'),
              ...(stryMutAct_9fa48("3764") ? config.headers : (stryCov_9fa48("3764"), config?.headers))
            })
          }));
          return response.data;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3765")) {
          {}
        } else {
          stryCov_9fa48("3765");
          if (stryMutAct_9fa48("3767") ? false : stryMutAct_9fa48("3766") ? true : (stryCov_9fa48("3766", "3767"), axios.isAxiosError(error))) {
            if (stryMutAct_9fa48("3768")) {
              {}
            } else {
              stryCov_9fa48("3768");
              throw new Error(stryMutAct_9fa48("3769") ? `` : (stryCov_9fa48("3769"), `HTTP POST request failed: ${error.message} (${stryMutAct_9fa48("3770") ? error.response.status : (stryCov_9fa48("3770"), error.response?.status)})`));
            }
          }
          throw new Error(stryMutAct_9fa48("3771") ? `` : (stryCov_9fa48("3771"), `HTTP POST request failed: ${error}`));
        }
      }
    }
  }

  /**
   * Get DOM from URL with proper error handling
   */
  async getDom(url: string): Promise<JSDOM> {
    if (stryMutAct_9fa48("3772")) {
      {}
    } else {
      stryCov_9fa48("3772");
      try {
        if (stryMutAct_9fa48("3773")) {
          {}
        } else {
          stryCov_9fa48("3773");
          const html = await this.get<string>(url);
          return new JSDOM(html, stryMutAct_9fa48("3774") ? {} : (stryCov_9fa48("3774"), {
            url
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("3775")) {
          {}
        } else {
          stryCov_9fa48("3775");
          throw new Error(stryMutAct_9fa48("3776") ? `` : (stryCov_9fa48("3776"), `Failed to get DOM from ${url}: ${error}`));
        }
      }
    }
  }

  /**
   * Extract embedded JSON data with proper generic typing
   */
  async extractEmbeddedJson(url: string, selectors: string[]): Promise<JsonData<unknown>[]> {
    if (stryMutAct_9fa48("3777")) {
      {}
    } else {
      stryCov_9fa48("3777");
      try {
        if (stryMutAct_9fa48("3778")) {
          {}
        } else {
          stryCov_9fa48("3778");
          const dom = await this.getDom(url);
          const results: JsonData<unknown>[] = stryMutAct_9fa48("3779") ? ["Stryker was here"] : (stryCov_9fa48("3779"), []);
          for (const selector of selectors) {
            if (stryMutAct_9fa48("3780")) {
              {}
            } else {
              stryCov_9fa48("3780");
              try {
                if (stryMutAct_9fa48("3781")) {
                  {}
                } else {
                  stryCov_9fa48("3781");
                  const elements = dom.window.document.querySelectorAll(selector);
                  for (const element of elements) {
                    if (stryMutAct_9fa48("3782")) {
                      {}
                    } else {
                      stryCov_9fa48("3782");
                      const textContent = stryMutAct_9fa48("3784") ? element.textContent.trim() : stryMutAct_9fa48("3783") ? element.textContent : (stryCov_9fa48("3783", "3784"), element.textContent?.trim());
                      if (stryMutAct_9fa48("3786") ? false : stryMutAct_9fa48("3785") ? true : (stryCov_9fa48("3785", "3786"), textContent)) {
                        if (stryMutAct_9fa48("3787")) {
                          {}
                        } else {
                          stryCov_9fa48("3787");
                          try {
                            if (stryMutAct_9fa48("3788")) {
                              {}
                            } else {
                              stryCov_9fa48("3788");
                              const json = JSON.parse(textContent);
                              results.push(json);
                            }
                          } catch (parseError) {
                            if (stryMutAct_9fa48("3789")) {
                              {}
                            } else {
                              stryCov_9fa48("3789");
                              // Skip invalid JSON
                              console.warn(stryMutAct_9fa48("3790") ? `` : (stryCov_9fa48("3790"), `Failed to parse JSON from selector '${selector}':`), parseError);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } catch (selectorError) {
                if (stryMutAct_9fa48("3791")) {
                  {}
                } else {
                  stryCov_9fa48("3791");
                  console.warn(stryMutAct_9fa48("3792") ? `` : (stryCov_9fa48("3792"), `Failed to process selector '${selector}':`), selectorError);
                }
              }
            }
          }
          return results;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3793")) {
          {}
        } else {
          stryCov_9fa48("3793");
          throw new Error(stryMutAct_9fa48("3794") ? `` : (stryCov_9fa48("3794"), `Failed to extract embedded JSON from ${url}: ${error}`));
        }
      }
    }
  }

  /**
   * Extract structured data (JSON-LD) with proper generic typing
   */
  async extractStructuredData(url: string): Promise<JsonData<unknown>[]> {
    if (stryMutAct_9fa48("3795")) {
      {}
    } else {
      stryCov_9fa48("3795");
      try {
        if (stryMutAct_9fa48("3796")) {
          {}
        } else {
          stryCov_9fa48("3796");
          const dom = await this.getDom(url);
          const results: JsonData<unknown>[] = stryMutAct_9fa48("3797") ? ["Stryker was here"] : (stryCov_9fa48("3797"), []);
          const scripts = dom.window.document.querySelectorAll(stryMutAct_9fa48("3798") ? "" : (stryCov_9fa48("3798"), 'script[type="application/ld+json"]'));
          for (const script of scripts) {
            if (stryMutAct_9fa48("3799")) {
              {}
            } else {
              stryCov_9fa48("3799");
              const textContent = stryMutAct_9fa48("3801") ? script.textContent.trim() : stryMutAct_9fa48("3800") ? script.textContent : (stryCov_9fa48("3800", "3801"), script.textContent?.trim());
              if (stryMutAct_9fa48("3803") ? false : stryMutAct_9fa48("3802") ? true : (stryCov_9fa48("3802", "3803"), textContent)) {
                if (stryMutAct_9fa48("3804")) {
                  {}
                } else {
                  stryCov_9fa48("3804");
                  try {
                    if (stryMutAct_9fa48("3805")) {
                      {}
                    } else {
                      stryCov_9fa48("3805");
                      const json = JSON.parse(textContent);
                      if (stryMutAct_9fa48("3807") ? false : stryMutAct_9fa48("3806") ? true : (stryCov_9fa48("3806", "3807"), Array.isArray(json))) {
                        if (stryMutAct_9fa48("3808")) {
                          {}
                        } else {
                          stryCov_9fa48("3808");
                          results.push(...json);
                        }
                      } else {
                        if (stryMutAct_9fa48("3809")) {
                          {}
                        } else {
                          stryCov_9fa48("3809");
                          results.push(json);
                        }
                      }
                    }
                  } catch (parseError) {
                    if (stryMutAct_9fa48("3810")) {
                      {}
                    } else {
                      stryCov_9fa48("3810");
                      console.warn(stryMutAct_9fa48("3811") ? "" : (stryCov_9fa48("3811"), 'Failed to parse JSON-LD:'), parseError);
                    }
                  }
                }
              }
            }
          }
          return results;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3812")) {
          {}
        } else {
          stryCov_9fa48("3812");
          throw new Error(stryMutAct_9fa48("3813") ? `` : (stryCov_9fa48("3813"), `Failed to extract structured data from ${url}: ${error}`));
        }
      }
    }
  }

  /**
   * Extract meta tags with proper typing
   */
  async extractMetaTags(url: string): Promise<Record<string, string>> {
    if (stryMutAct_9fa48("3814")) {
      {}
    } else {
      stryCov_9fa48("3814");
      try {
        if (stryMutAct_9fa48("3815")) {
          {}
        } else {
          stryCov_9fa48("3815");
          const dom = await this.getDom(url);
          const metaTags: Record<string, string> = {};
          const metaElements = dom.window.document.querySelectorAll(stryMutAct_9fa48("3816") ? "" : (stryCov_9fa48("3816"), 'meta'));
          for (const meta of metaElements) {
            if (stryMutAct_9fa48("3817")) {
              {}
            } else {
              stryCov_9fa48("3817");
              const name = stryMutAct_9fa48("3820") ? meta.getAttribute('name') && meta.getAttribute('property') : stryMutAct_9fa48("3819") ? false : stryMutAct_9fa48("3818") ? true : (stryCov_9fa48("3818", "3819", "3820"), meta.getAttribute(stryMutAct_9fa48("3821") ? "" : (stryCov_9fa48("3821"), 'name')) || meta.getAttribute(stryMutAct_9fa48("3822") ? "" : (stryCov_9fa48("3822"), 'property')));
              const content = meta.getAttribute(stryMutAct_9fa48("3823") ? "" : (stryCov_9fa48("3823"), 'content'));
              if (stryMutAct_9fa48("3826") ? name || content : stryMutAct_9fa48("3825") ? false : stryMutAct_9fa48("3824") ? true : (stryCov_9fa48("3824", "3825", "3826"), name && content)) {
                if (stryMutAct_9fa48("3827")) {
                  {}
                } else {
                  stryCov_9fa48("3827");
                  metaTags[name] = content;
                }
              }
            }
          }
          return metaTags;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3828")) {
          {}
        } else {
          stryCov_9fa48("3828");
          throw new Error(stryMutAct_9fa48("3829") ? `` : (stryCov_9fa48("3829"), `Failed to extract meta tags from ${url}: ${error}`));
        }
      }
    }
  }

  /**
   * Check if a URL is accessible
   */
  async isAccessible(url: string): Promise<boolean> {
    if (stryMutAct_9fa48("3830")) {
      {}
    } else {
      stryCov_9fa48("3830");
      try {
        if (stryMutAct_9fa48("3831")) {
          {}
        } else {
          stryCov_9fa48("3831");
          await this.get(url, stryMutAct_9fa48("3832") ? {} : (stryCov_9fa48("3832"), {
            timeout: 10000
          }));
          return stryMutAct_9fa48("3833") ? false : (stryCov_9fa48("3833"), true);
        }
      } catch (error) {
        if (stryMutAct_9fa48("3834")) {
          {}
        } else {
          stryCov_9fa48("3834");
          return stryMutAct_9fa48("3835") ? true : (stryCov_9fa48("3835"), false);
        }
      }
    }
  }

  /**
   * Get response headers for a URL
   */
  async getHeaders(url: string): Promise<Record<string, string>> {
    if (stryMutAct_9fa48("3836")) {
      {}
    } else {
      stryCov_9fa48("3836");
      try {
        if (stryMutAct_9fa48("3837")) {
          {}
        } else {
          stryCov_9fa48("3837");
          const response = await axios.head(url, stryMutAct_9fa48("3838") ? {} : (stryCov_9fa48("3838"), {
            headers: stryMutAct_9fa48("3839") ? {} : (stryCov_9fa48("3839"), {
              'User-Agent': this.getRandomUserAgent()
            }),
            timeout: 10000
          }));
          return response.headers as Record<string, string>;
        }
      } catch (error) {
        if (stryMutAct_9fa48("3840")) {
          {}
        } else {
          stryCov_9fa48("3840");
          throw new Error(stryMutAct_9fa48("3841") ? `` : (stryCov_9fa48("3841"), `Failed to get headers from ${url}: ${error}`));
        }
      }
    }
  }

  /**
   * Follow redirects and get final URL
   */
  async getFinalUrl(url: string): Promise<string> {
    if (stryMutAct_9fa48("3842")) {
      {}
    } else {
      stryCov_9fa48("3842");
      try {
        if (stryMutAct_9fa48("3843")) {
          {}
        } else {
          stryCov_9fa48("3843");
          const response = await axios.get(url, stryMutAct_9fa48("3844") ? {} : (stryCov_9fa48("3844"), {
            maxRedirects: 0,
            validateStatus: stryMutAct_9fa48("3845") ? () => undefined : (stryCov_9fa48("3845"), status => stryMutAct_9fa48("3848") ? status >= 200 || status < 400 : stryMutAct_9fa48("3847") ? false : stryMutAct_9fa48("3846") ? true : (stryCov_9fa48("3846", "3847", "3848"), (stryMutAct_9fa48("3851") ? status < 200 : stryMutAct_9fa48("3850") ? status > 200 : stryMutAct_9fa48("3849") ? true : (stryCov_9fa48("3849", "3850", "3851"), status >= 200)) && (stryMutAct_9fa48("3854") ? status >= 400 : stryMutAct_9fa48("3853") ? status <= 400 : stryMutAct_9fa48("3852") ? true : (stryCov_9fa48("3852", "3853", "3854"), status < 400)))),
            headers: stryMutAct_9fa48("3855") ? {} : (stryCov_9fa48("3855"), {
              'User-Agent': this.getRandomUserAgent()
            })
          }));
          return stryMutAct_9fa48("3858") ? response.request.res.responseUrl && url : stryMutAct_9fa48("3857") ? false : stryMutAct_9fa48("3856") ? true : (stryCov_9fa48("3856", "3857", "3858"), response.request.res.responseUrl || url);
        }
      } catch (error) {
        if (stryMutAct_9fa48("3859")) {
          {}
        } else {
          stryCov_9fa48("3859");
          if (stryMutAct_9fa48("3862") ? axios.isAxiosError(error) || error.response?.status === 301 || error.response?.status === 302 : stryMutAct_9fa48("3861") ? false : stryMutAct_9fa48("3860") ? true : (stryCov_9fa48("3860", "3861", "3862"), axios.isAxiosError(error) && (stryMutAct_9fa48("3864") ? error.response?.status === 301 && error.response?.status === 302 : stryMutAct_9fa48("3863") ? true : (stryCov_9fa48("3863", "3864"), (stryMutAct_9fa48("3866") ? error.response?.status !== 301 : stryMutAct_9fa48("3865") ? false : (stryCov_9fa48("3865", "3866"), (stryMutAct_9fa48("3867") ? error.response.status : (stryCov_9fa48("3867"), error.response?.status)) === 301)) || (stryMutAct_9fa48("3869") ? error.response?.status !== 302 : stryMutAct_9fa48("3868") ? false : (stryCov_9fa48("3868", "3869"), (stryMutAct_9fa48("3870") ? error.response.status : (stryCov_9fa48("3870"), error.response?.status)) === 302)))))) {
            if (stryMutAct_9fa48("3871")) {
              {}
            } else {
              stryCov_9fa48("3871");
              const location = stryMutAct_9fa48("3873") ? error.response.headers?.location : stryMutAct_9fa48("3872") ? error.response?.headers.location : (stryCov_9fa48("3872", "3873"), error.response?.headers?.location);
              if (stryMutAct_9fa48("3875") ? false : stryMutAct_9fa48("3874") ? true : (stryCov_9fa48("3874", "3875"), location)) {
                if (stryMutAct_9fa48("3876")) {
                  {}
                } else {
                  stryCov_9fa48("3876");
                  return this.resolveUrl(location, url);
                }
              }
            }
          }
          return url;
        }
      }
    }
  }

  /**
   * Resolve relative URL to absolute URL
   */
  private resolveUrl(relativeUrl: string, baseUrl: string): string {
    if (stryMutAct_9fa48("3877")) {
      {}
    } else {
      stryCov_9fa48("3877");
      try {
        if (stryMutAct_9fa48("3878")) {
          {}
        } else {
          stryCov_9fa48("3878");
          if (stryMutAct_9fa48("3881") ? relativeUrl.endsWith('http') : stryMutAct_9fa48("3880") ? false : stryMutAct_9fa48("3879") ? true : (stryCov_9fa48("3879", "3880", "3881"), relativeUrl.startsWith(stryMutAct_9fa48("3882") ? "" : (stryCov_9fa48("3882"), 'http')))) {
            if (stryMutAct_9fa48("3883")) {
              {}
            } else {
              stryCov_9fa48("3883");
              return relativeUrl;
            }
          }
          if (stryMutAct_9fa48("3886") ? relativeUrl.endsWith('//') : stryMutAct_9fa48("3885") ? false : stryMutAct_9fa48("3884") ? true : (stryCov_9fa48("3884", "3885", "3886"), relativeUrl.startsWith(stryMutAct_9fa48("3887") ? "" : (stryCov_9fa48("3887"), '//')))) {
            if (stryMutAct_9fa48("3888")) {
              {}
            } else {
              stryCov_9fa48("3888");
              const base = new URL(baseUrl);
              return stryMutAct_9fa48("3889") ? `` : (stryCov_9fa48("3889"), `${base.protocol}${relativeUrl}`);
            }
          }
          if (stryMutAct_9fa48("3892") ? relativeUrl.endsWith('/') : stryMutAct_9fa48("3891") ? false : stryMutAct_9fa48("3890") ? true : (stryCov_9fa48("3890", "3891", "3892"), relativeUrl.startsWith(stryMutAct_9fa48("3893") ? "" : (stryCov_9fa48("3893"), '/')))) {
            if (stryMutAct_9fa48("3894")) {
              {}
            } else {
              stryCov_9fa48("3894");
              const base = new URL(baseUrl);
              return stryMutAct_9fa48("3895") ? `` : (stryCov_9fa48("3895"), `${base.protocol}//${base.host}${relativeUrl}`);
            }
          }
          const base = new URL(baseUrl);
          return stryMutAct_9fa48("3896") ? `` : (stryCov_9fa48("3896"), `${base.protocol}//${base.host}${base.pathname.replace(stryMutAct_9fa48("3899") ? /\/[/]*$/ : stryMutAct_9fa48("3898") ? /\/[^/]$/ : stryMutAct_9fa48("3897") ? /\/[^/]*/ : (stryCov_9fa48("3897", "3898", "3899"), /\/[^/]*$/), stryMutAct_9fa48("3900") ? "Stryker was here!" : (stryCov_9fa48("3900"), ''))}/${relativeUrl}`);
        }
      } catch (error) {
        if (stryMutAct_9fa48("3901")) {
          {}
        } else {
          stryCov_9fa48("3901");
          console.warn(stryMutAct_9fa48("3902") ? `` : (stryCov_9fa48("3902"), `Failed to resolve URL '${relativeUrl}' with base '${baseUrl}':`), error);
          return relativeUrl;
        }
      }
    }
  }

  /**
   * Set custom user agents
   */
  setUserAgents(userAgents: string[]): void {
    if (stryMutAct_9fa48("3903")) {
      {}
    } else {
      stryCov_9fa48("3903");
      if (stryMutAct_9fa48("3907") ? userAgents.length <= 0 : stryMutAct_9fa48("3906") ? userAgents.length >= 0 : stryMutAct_9fa48("3905") ? false : stryMutAct_9fa48("3904") ? true : (stryCov_9fa48("3904", "3905", "3906", "3907"), userAgents.length > 0)) {
        if (stryMutAct_9fa48("3908")) {
          {}
        } else {
          stryCov_9fa48("3908");
          this.userAgents = stryMutAct_9fa48("3909") ? [] : (stryCov_9fa48("3909"), [...userAgents]);
        }
      }
    }
  }

  /**
   * Add custom user agent
   */
  addUserAgent(userAgent: string): void {
    if (stryMutAct_9fa48("3910")) {
      {}
    } else {
      stryCov_9fa48("3910");
      this.userAgents.push(userAgent);
    }
  }

  /**
   * Get current user agents
   */
  getUserAgents(): string[] {
    if (stryMutAct_9fa48("3911")) {
      {}
    } else {
      stryCov_9fa48("3911");
      return stryMutAct_9fa48("3912") ? [] : (stryCov_9fa48("3912"), [...this.userAgents]);
    }
  }
}