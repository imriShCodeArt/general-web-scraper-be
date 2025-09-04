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
import path from 'path';
//  - types may be missing in some environments
import swaggerJSDoc, { Options } from 'swagger-jsdoc';
const version = stryMutAct_9fa48("143") ? process.env.npm_package_version && '0.0.0' : stryMutAct_9fa48("142") ? false : stryMutAct_9fa48("141") ? true : (stryCov_9fa48("141", "142", "143"), process.env.npm_package_version || (stryMutAct_9fa48("144") ? "" : (stryCov_9fa48("144"), '0.0.0')));
const options: Options = stryMutAct_9fa48("145") ? {} : (stryCov_9fa48("145"), {
  definition: stryMutAct_9fa48("146") ? {} : (stryCov_9fa48("146"), {
    openapi: stryMutAct_9fa48("147") ? "" : (stryCov_9fa48("147"), '3.0.3'),
    info: stryMutAct_9fa48("148") ? {} : (stryCov_9fa48("148"), {
      title: stryMutAct_9fa48("149") ? "" : (stryCov_9fa48("149"), 'Web Scraper v2 API'),
      version,
      description: stryMutAct_9fa48("150") ? "" : (stryCov_9fa48("150"), 'API for initiating and monitoring scraping jobs, managing recipes, and downloading CSV outputs.')
    }),
    servers: stryMutAct_9fa48("151") ? [] : (stryCov_9fa48("151"), [stryMutAct_9fa48("152") ? {} : (stryCov_9fa48("152"), {
      url: stryMutAct_9fa48("153") ? "" : (stryCov_9fa48("153"), '/'),
      description: stryMutAct_9fa48("154") ? "" : (stryCov_9fa48("154"), 'Current server')
    }), stryMutAct_9fa48("155") ? {} : (stryCov_9fa48("155"), {
      url: stryMutAct_9fa48("156") ? "" : (stryCov_9fa48("156"), 'http://localhost:3000'),
      description: stryMutAct_9fa48("157") ? "" : (stryCov_9fa48("157"), 'Local development')
    })]),
    components: stryMutAct_9fa48("158") ? {} : (stryCov_9fa48("158"), {
      schemas: stryMutAct_9fa48("159") ? {} : (stryCov_9fa48("159"), {
        StartScrapeRequest: stryMutAct_9fa48("160") ? {} : (stryCov_9fa48("160"), {
          type: stryMutAct_9fa48("161") ? "" : (stryCov_9fa48("161"), 'object'),
          required: stryMutAct_9fa48("162") ? [] : (stryCov_9fa48("162"), [stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), 'siteUrl'), stryMutAct_9fa48("164") ? "" : (stryCov_9fa48("164"), 'recipe')]),
          properties: stryMutAct_9fa48("165") ? {} : (stryCov_9fa48("165"), {
            siteUrl: stryMutAct_9fa48("166") ? {} : (stryCov_9fa48("166"), {
              type: stryMutAct_9fa48("167") ? "" : (stryCov_9fa48("167"), 'string'),
              example: stryMutAct_9fa48("168") ? "" : (stryCov_9fa48("168"), 'https://example.com')
            }),
            recipe: stryMutAct_9fa48("169") ? {} : (stryCov_9fa48("169"), {
              type: stryMutAct_9fa48("170") ? "" : (stryCov_9fa48("170"), 'string'),
              example: stryMutAct_9fa48("171") ? "" : (stryCov_9fa48("171"), 'generic-ecommerce')
            }),
            options: stryMutAct_9fa48("172") ? {} : (stryCov_9fa48("172"), {
              type: stryMutAct_9fa48("173") ? "" : (stryCov_9fa48("173"), 'object')
            })
          })
        }),
        ScrapeJobResponse: stryMutAct_9fa48("174") ? {} : (stryCov_9fa48("174"), {
          type: stryMutAct_9fa48("175") ? "" : (stryCov_9fa48("175"), 'object'),
          properties: stryMutAct_9fa48("176") ? {} : (stryCov_9fa48("176"), {
            success: stryMutAct_9fa48("177") ? {} : (stryCov_9fa48("177"), {
              type: stryMutAct_9fa48("178") ? "" : (stryCov_9fa48("178"), 'boolean')
            }),
            jobId: stryMutAct_9fa48("179") ? {} : (stryCov_9fa48("179"), {
              type: stryMutAct_9fa48("180") ? "" : (stryCov_9fa48("180"), 'string')
            }),
            status: stryMutAct_9fa48("181") ? {} : (stryCov_9fa48("181"), {
              type: stryMutAct_9fa48("182") ? "" : (stryCov_9fa48("182"), 'string')
            }),
            data: stryMutAct_9fa48("183") ? {} : (stryCov_9fa48("183"), {
              type: stryMutAct_9fa48("184") ? "" : (stryCov_9fa48("184"), 'object')
            }),
            error: stryMutAct_9fa48("185") ? {} : (stryCov_9fa48("185"), {
              type: stryMutAct_9fa48("186") ? "" : (stryCov_9fa48("186"), 'string')
            })
          })
        })
      })
    }),
    paths: stryMutAct_9fa48("187") ? {} : (stryCov_9fa48("187"), {
      '/health': stryMutAct_9fa48("188") ? {} : (stryCov_9fa48("188"), {
        get: stryMutAct_9fa48("189") ? {} : (stryCov_9fa48("189"), {
          summary: stryMutAct_9fa48("190") ? "" : (stryCov_9fa48("190"), 'Health check'),
          responses: stryMutAct_9fa48("191") ? {} : (stryCov_9fa48("191"), {
            '200': stryMutAct_9fa48("192") ? {} : (stryCov_9fa48("192"), {
              description: stryMutAct_9fa48("193") ? "" : (stryCov_9fa48("193"), 'OK')
            })
          })
        })
      }),
      '/api/scrape/init': stryMutAct_9fa48("194") ? {} : (stryCov_9fa48("194"), {
        post: stryMutAct_9fa48("195") ? {} : (stryCov_9fa48("195"), {
          summary: stryMutAct_9fa48("196") ? "" : (stryCov_9fa48("196"), 'Start scraping job'),
          requestBody: stryMutAct_9fa48("197") ? {} : (stryCov_9fa48("197"), {
            required: stryMutAct_9fa48("198") ? false : (stryCov_9fa48("198"), true),
            content: stryMutAct_9fa48("199") ? {} : (stryCov_9fa48("199"), {
              'application/json': stryMutAct_9fa48("200") ? {} : (stryCov_9fa48("200"), {
                schema: stryMutAct_9fa48("201") ? {} : (stryCov_9fa48("201"), {
                  $ref: stryMutAct_9fa48("202") ? "" : (stryCov_9fa48("202"), '#/components/schemas/StartScrapeRequest')
                })
              })
            })
          }),
          responses: stryMutAct_9fa48("203") ? {} : (stryCov_9fa48("203"), {
            '201': stryMutAct_9fa48("204") ? {} : (stryCov_9fa48("204"), {
              description: stryMutAct_9fa48("205") ? "" : (stryCov_9fa48("205"), 'Job created')
            }),
            '400': stryMutAct_9fa48("206") ? {} : (stryCov_9fa48("206"), {
              description: stryMutAct_9fa48("207") ? "" : (stryCov_9fa48("207"), 'Bad request')
            })
          })
        })
      }),
      '/api/scrape/status/{jobId}': stryMutAct_9fa48("208") ? {} : (stryCov_9fa48("208"), {
        get: stryMutAct_9fa48("209") ? {} : (stryCov_9fa48("209"), {
          summary: stryMutAct_9fa48("210") ? "" : (stryCov_9fa48("210"), 'Get scraping job status'),
          parameters: stryMutAct_9fa48("211") ? [] : (stryCov_9fa48("211"), [stryMutAct_9fa48("212") ? {} : (stryCov_9fa48("212"), {
            name: stryMutAct_9fa48("213") ? "" : (stryCov_9fa48("213"), 'jobId'),
            in: stryMutAct_9fa48("214") ? "" : (stryCov_9fa48("214"), 'path'),
            required: stryMutAct_9fa48("215") ? false : (stryCov_9fa48("215"), true),
            schema: stryMutAct_9fa48("216") ? {} : (stryCov_9fa48("216"), {
              type: stryMutAct_9fa48("217") ? "" : (stryCov_9fa48("217"), 'string')
            })
          })]),
          responses: stryMutAct_9fa48("218") ? {} : (stryCov_9fa48("218"), {
            '200': stryMutAct_9fa48("219") ? {} : (stryCov_9fa48("219"), {
              description: stryMutAct_9fa48("220") ? "" : (stryCov_9fa48("220"), 'Status')
            }),
            '404': stryMutAct_9fa48("221") ? {} : (stryCov_9fa48("221"), {
              description: stryMutAct_9fa48("222") ? "" : (stryCov_9fa48("222"), 'Not found')
            })
          })
        })
      }),
      '/api/scrape/jobs': stryMutAct_9fa48("223") ? {} : (stryCov_9fa48("223"), {
        get: stryMutAct_9fa48("224") ? {} : (stryCov_9fa48("224"), {
          summary: stryMutAct_9fa48("225") ? "" : (stryCov_9fa48("225"), 'List all jobs'),
          responses: stryMutAct_9fa48("226") ? {} : (stryCov_9fa48("226"), {
            '200': stryMutAct_9fa48("227") ? {} : (stryCov_9fa48("227"), {
              description: stryMutAct_9fa48("228") ? "" : (stryCov_9fa48("228"), 'OK')
            })
          })
        })
      }),
      '/api/scrape/performance': stryMutAct_9fa48("229") ? {} : (stryCov_9fa48("229"), {
        get: stryMutAct_9fa48("230") ? {} : (stryCov_9fa48("230"), {
          summary: stryMutAct_9fa48("231") ? "" : (stryCov_9fa48("231"), 'Performance metrics'),
          responses: stryMutAct_9fa48("232") ? {} : (stryCov_9fa48("232"), {
            '200': stryMutAct_9fa48("233") ? {} : (stryCov_9fa48("233"), {
              description: stryMutAct_9fa48("234") ? "" : (stryCov_9fa48("234"), 'OK')
            })
          })
        })
      }),
      '/api/scrape/performance/live': stryMutAct_9fa48("235") ? {} : (stryCov_9fa48("235"), {
        get: stryMutAct_9fa48("236") ? {} : (stryCov_9fa48("236"), {
          summary: stryMutAct_9fa48("237") ? "" : (stryCov_9fa48("237"), 'Live performance metrics'),
          responses: stryMutAct_9fa48("238") ? {} : (stryCov_9fa48("238"), {
            '200': stryMutAct_9fa48("239") ? {} : (stryCov_9fa48("239"), {
              description: stryMutAct_9fa48("240") ? "" : (stryCov_9fa48("240"), 'OK')
            })
          })
        })
      }),
      '/api/scrape/performance/recommendations': stryMutAct_9fa48("241") ? {} : (stryCov_9fa48("241"), {
        get: stryMutAct_9fa48("242") ? {} : (stryCov_9fa48("242"), {
          summary: stryMutAct_9fa48("243") ? "" : (stryCov_9fa48("243"), 'Performance recommendations'),
          responses: stryMutAct_9fa48("244") ? {} : (stryCov_9fa48("244"), {
            '200': stryMutAct_9fa48("245") ? {} : (stryCov_9fa48("245"), {
              description: stryMutAct_9fa48("246") ? "" : (stryCov_9fa48("246"), 'OK')
            })
          })
        })
      }),
      '/api/scrape/cancel/{jobId}': stryMutAct_9fa48("247") ? {} : (stryCov_9fa48("247"), {
        post: stryMutAct_9fa48("248") ? {} : (stryCov_9fa48("248"), {
          summary: stryMutAct_9fa48("249") ? "" : (stryCov_9fa48("249"), 'Cancel a job'),
          parameters: stryMutAct_9fa48("250") ? [] : (stryCov_9fa48("250"), [stryMutAct_9fa48("251") ? {} : (stryCov_9fa48("251"), {
            name: stryMutAct_9fa48("252") ? "" : (stryCov_9fa48("252"), 'jobId'),
            in: stryMutAct_9fa48("253") ? "" : (stryCov_9fa48("253"), 'path'),
            required: stryMutAct_9fa48("254") ? false : (stryCov_9fa48("254"), true),
            schema: stryMutAct_9fa48("255") ? {} : (stryCov_9fa48("255"), {
              type: stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), 'string')
            })
          })]),
          responses: stryMutAct_9fa48("257") ? {} : (stryCov_9fa48("257"), {
            '200': stryMutAct_9fa48("258") ? {} : (stryCov_9fa48("258"), {
              description: stryMutAct_9fa48("259") ? "" : (stryCov_9fa48("259"), 'Cancelled')
            }),
            '400': stryMutAct_9fa48("260") ? {} : (stryCov_9fa48("260"), {
              description: stryMutAct_9fa48("261") ? "" : (stryCov_9fa48("261"), 'Bad request')
            })
          })
        })
      }),
      '/api/scrape/download/{jobId}/{type}': stryMutAct_9fa48("262") ? {} : (stryCov_9fa48("262"), {
        get: stryMutAct_9fa48("263") ? {} : (stryCov_9fa48("263"), {
          summary: stryMutAct_9fa48("264") ? "" : (stryCov_9fa48("264"), 'Download CSV'),
          parameters: stryMutAct_9fa48("265") ? [] : (stryCov_9fa48("265"), [stryMutAct_9fa48("266") ? {} : (stryCov_9fa48("266"), {
            name: stryMutAct_9fa48("267") ? "" : (stryCov_9fa48("267"), 'jobId'),
            in: stryMutAct_9fa48("268") ? "" : (stryCov_9fa48("268"), 'path'),
            required: stryMutAct_9fa48("269") ? false : (stryCov_9fa48("269"), true),
            schema: stryMutAct_9fa48("270") ? {} : (stryCov_9fa48("270"), {
              type: stryMutAct_9fa48("271") ? "" : (stryCov_9fa48("271"), 'string')
            })
          }), stryMutAct_9fa48("272") ? {} : (stryCov_9fa48("272"), {
            name: stryMutAct_9fa48("273") ? "" : (stryCov_9fa48("273"), 'type'),
            in: stryMutAct_9fa48("274") ? "" : (stryCov_9fa48("274"), 'path'),
            required: stryMutAct_9fa48("275") ? false : (stryCov_9fa48("275"), true),
            schema: stryMutAct_9fa48("276") ? {} : (stryCov_9fa48("276"), {
              type: stryMutAct_9fa48("277") ? "" : (stryCov_9fa48("277"), 'string'),
              enum: stryMutAct_9fa48("278") ? [] : (stryCov_9fa48("278"), [stryMutAct_9fa48("279") ? "" : (stryCov_9fa48("279"), 'parent'), stryMutAct_9fa48("280") ? "" : (stryCov_9fa48("280"), 'variation')])
            })
          })]),
          responses: stryMutAct_9fa48("281") ? {} : (stryCov_9fa48("281"), {
            '200': stryMutAct_9fa48("282") ? {} : (stryCov_9fa48("282"), {
              description: stryMutAct_9fa48("283") ? "" : (stryCov_9fa48("283"), 'CSV file')
            }),
            '404': stryMutAct_9fa48("284") ? {} : (stryCov_9fa48("284"), {
              description: stryMutAct_9fa48("285") ? "" : (stryCov_9fa48("285"), 'Not found')
            })
          })
        })
      }),
      '/api/storage/stats': stryMutAct_9fa48("286") ? {} : (stryCov_9fa48("286"), {
        get: stryMutAct_9fa48("287") ? {} : (stryCov_9fa48("287"), {
          summary: stryMutAct_9fa48("288") ? "" : (stryCov_9fa48("288"), 'Storage stats'),
          responses: stryMutAct_9fa48("289") ? {} : (stryCov_9fa48("289"), {
            '200': stryMutAct_9fa48("290") ? {} : (stryCov_9fa48("290"), {
              description: stryMutAct_9fa48("291") ? "" : (stryCov_9fa48("291"), 'OK')
            })
          })
        })
      }),
      '/api/storage/job/{jobId}': stryMutAct_9fa48("292") ? {} : (stryCov_9fa48("292"), {
        get: stryMutAct_9fa48("293") ? {} : (stryCov_9fa48("293"), {
          summary: stryMutAct_9fa48("294") ? "" : (stryCov_9fa48("294"), 'Get job result from storage'),
          parameters: stryMutAct_9fa48("295") ? [] : (stryCov_9fa48("295"), [stryMutAct_9fa48("296") ? {} : (stryCov_9fa48("296"), {
            name: stryMutAct_9fa48("297") ? "" : (stryCov_9fa48("297"), 'jobId'),
            in: stryMutAct_9fa48("298") ? "" : (stryCov_9fa48("298"), 'path'),
            required: stryMutAct_9fa48("299") ? false : (stryCov_9fa48("299"), true),
            schema: stryMutAct_9fa48("300") ? {} : (stryCov_9fa48("300"), {
              type: stryMutAct_9fa48("301") ? "" : (stryCov_9fa48("301"), 'string')
            })
          })]),
          responses: stryMutAct_9fa48("302") ? {} : (stryCov_9fa48("302"), {
            '200': stryMutAct_9fa48("303") ? {} : (stryCov_9fa48("303"), {
              description: stryMutAct_9fa48("304") ? "" : (stryCov_9fa48("304"), 'OK')
            }),
            '404': stryMutAct_9fa48("305") ? {} : (stryCov_9fa48("305"), {
              description: stryMutAct_9fa48("306") ? "" : (stryCov_9fa48("306"), 'Not found')
            })
          })
        })
      }),
      '/api/storage/clear': stryMutAct_9fa48("307") ? {} : (stryCov_9fa48("307"), {
        delete: stryMutAct_9fa48("308") ? {} : (stryCov_9fa48("308"), {
          summary: stryMutAct_9fa48("309") ? "" : (stryCov_9fa48("309"), 'Clear storage'),
          responses: stryMutAct_9fa48("310") ? {} : (stryCov_9fa48("310"), {
            '200': stryMutAct_9fa48("311") ? {} : (stryCov_9fa48("311"), {
              description: stryMutAct_9fa48("312") ? "" : (stryCov_9fa48("312"), 'Cleared')
            })
          })
        })
      }),
      '/api/recipes/list': stryMutAct_9fa48("313") ? {} : (stryCov_9fa48("313"), {
        get: stryMutAct_9fa48("314") ? {} : (stryCov_9fa48("314"), {
          summary: stryMutAct_9fa48("315") ? "" : (stryCov_9fa48("315"), 'List recipes'),
          responses: stryMutAct_9fa48("316") ? {} : (stryCov_9fa48("316"), {
            '200': stryMutAct_9fa48("317") ? {} : (stryCov_9fa48("317"), {
              description: stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), 'OK')
            })
          })
        })
      }),
      '/api/recipes/get/{recipeName}': stryMutAct_9fa48("319") ? {} : (stryCov_9fa48("319"), {
        get: stryMutAct_9fa48("320") ? {} : (stryCov_9fa48("320"), {
          summary: stryMutAct_9fa48("321") ? "" : (stryCov_9fa48("321"), 'Get recipe by name'),
          parameters: stryMutAct_9fa48("322") ? [] : (stryCov_9fa48("322"), [stryMutAct_9fa48("323") ? {} : (stryCov_9fa48("323"), {
            name: stryMutAct_9fa48("324") ? "" : (stryCov_9fa48("324"), 'recipeName'),
            in: stryMutAct_9fa48("325") ? "" : (stryCov_9fa48("325"), 'path'),
            required: stryMutAct_9fa48("326") ? false : (stryCov_9fa48("326"), true),
            schema: stryMutAct_9fa48("327") ? {} : (stryCov_9fa48("327"), {
              type: stryMutAct_9fa48("328") ? "" : (stryCov_9fa48("328"), 'string')
            })
          })]),
          responses: stryMutAct_9fa48("329") ? {} : (stryCov_9fa48("329"), {
            '200': stryMutAct_9fa48("330") ? {} : (stryCov_9fa48("330"), {
              description: stryMutAct_9fa48("331") ? "" : (stryCov_9fa48("331"), 'OK')
            }),
            '404': stryMutAct_9fa48("332") ? {} : (stryCov_9fa48("332"), {
              description: stryMutAct_9fa48("333") ? "" : (stryCov_9fa48("333"), 'Not found')
            })
          })
        })
      }),
      '/api/recipes/getBySite': stryMutAct_9fa48("334") ? {} : (stryCov_9fa48("334"), {
        get: stryMutAct_9fa48("335") ? {} : (stryCov_9fa48("335"), {
          summary: stryMutAct_9fa48("336") ? "" : (stryCov_9fa48("336"), 'Get recipe by site URL'),
          parameters: stryMutAct_9fa48("337") ? [] : (stryCov_9fa48("337"), [stryMutAct_9fa48("338") ? {} : (stryCov_9fa48("338"), {
            name: stryMutAct_9fa48("339") ? "" : (stryCov_9fa48("339"), 'siteUrl'),
            in: stryMutAct_9fa48("340") ? "" : (stryCov_9fa48("340"), 'query'),
            required: stryMutAct_9fa48("341") ? false : (stryCov_9fa48("341"), true),
            schema: stryMutAct_9fa48("342") ? {} : (stryCov_9fa48("342"), {
              type: stryMutAct_9fa48("343") ? "" : (stryCov_9fa48("343"), 'string')
            })
          })]),
          responses: stryMutAct_9fa48("344") ? {} : (stryCov_9fa48("344"), {
            '200': stryMutAct_9fa48("345") ? {} : (stryCov_9fa48("345"), {
              description: stryMutAct_9fa48("346") ? "" : (stryCov_9fa48("346"), 'OK')
            }),
            '404': stryMutAct_9fa48("347") ? {} : (stryCov_9fa48("347"), {
              description: stryMutAct_9fa48("348") ? "" : (stryCov_9fa48("348"), 'Not found')
            })
          })
        })
      }),
      '/api/recipes/all': stryMutAct_9fa48("349") ? {} : (stryCov_9fa48("349"), {
        get: stryMutAct_9fa48("350") ? {} : (stryCov_9fa48("350"), {
          summary: stryMutAct_9fa48("351") ? "" : (stryCov_9fa48("351"), 'List recipes with details'),
          responses: stryMutAct_9fa48("352") ? {} : (stryCov_9fa48("352"), {
            '200': stryMutAct_9fa48("353") ? {} : (stryCov_9fa48("353"), {
              description: stryMutAct_9fa48("354") ? "" : (stryCov_9fa48("354"), 'OK')
            })
          })
        })
      }),
      '/api/recipes/names': stryMutAct_9fa48("355") ? {} : (stryCov_9fa48("355"), {
        get: stryMutAct_9fa48("356") ? {} : (stryCov_9fa48("356"), {
          summary: stryMutAct_9fa48("357") ? "" : (stryCov_9fa48("357"), 'List recipe names'),
          responses: stryMutAct_9fa48("358") ? {} : (stryCov_9fa48("358"), {
            '200': stryMutAct_9fa48("359") ? {} : (stryCov_9fa48("359"), {
              description: stryMutAct_9fa48("360") ? "" : (stryCov_9fa48("360"), 'OK')
            })
          })
        })
      }),
      '/api/recipes/validate': stryMutAct_9fa48("361") ? {} : (stryCov_9fa48("361"), {
        post: stryMutAct_9fa48("362") ? {} : (stryCov_9fa48("362"), {
          summary: stryMutAct_9fa48("363") ? "" : (stryCov_9fa48("363"), 'Validate a recipe by name'),
          responses: stryMutAct_9fa48("364") ? {} : (stryCov_9fa48("364"), {
            '200': stryMutAct_9fa48("365") ? {} : (stryCov_9fa48("365"), {
              description: stryMutAct_9fa48("366") ? "" : (stryCov_9fa48("366"), 'OK')
            }),
            '404': stryMutAct_9fa48("367") ? {} : (stryCov_9fa48("367"), {
              description: stryMutAct_9fa48("368") ? "" : (stryCov_9fa48("368"), 'Not found')
            })
          })
        })
      }),
      '/api/recipes/loadFromFile': stryMutAct_9fa48("369") ? {} : (stryCov_9fa48("369"), {
        post: stryMutAct_9fa48("370") ? {} : (stryCov_9fa48("370"), {
          summary: stryMutAct_9fa48("371") ? "" : (stryCov_9fa48("371"), 'Load recipe from file'),
          responses: stryMutAct_9fa48("372") ? {} : (stryCov_9fa48("372"), {
            '200': stryMutAct_9fa48("373") ? {} : (stryCov_9fa48("373"), {
              description: stryMutAct_9fa48("374") ? "" : (stryCov_9fa48("374"), 'OK')
            })
          })
        })
      })
    })
  }),
  apis: stryMutAct_9fa48("375") ? [] : (stryCov_9fa48("375"), [path.join(process.cwd(), stryMutAct_9fa48("376") ? "" : (stryCov_9fa48("376"), 'src/**/*.ts'))])
});
export const swaggerSpec = swaggerJSDoc(options);