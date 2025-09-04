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
import type { Registration } from './types';
export class Container {
  private registrations = new Map<symbol, Registration<unknown>>();
  private resolving = new Set<symbol>();
  private scopedInstances = new Map<symbol, unknown>();
  private parent?: Container;
  constructor(parent?: Container) {
    if (stryMutAct_9fa48("1338")) {
      {}
    } else {
      stryCov_9fa48("1338");
      this.parent = parent;
    }
  }
  register<T>(token: symbol, registration: Registration<T>): void {
    if (stryMutAct_9fa48("1339")) {
      {}
    } else {
      stryCov_9fa48("1339");
      this.registrations.set(token, registration as Registration<unknown>);
    }
  }
  async resolve<T>(token: symbol): Promise<T> {
    if (stryMutAct_9fa48("1340")) {
      {}
    } else {
      stryCov_9fa48("1340");
      const registration = this.getRegistration(token);
      if (stryMutAct_9fa48("1343") ? false : stryMutAct_9fa48("1342") ? true : stryMutAct_9fa48("1341") ? registration : (stryCov_9fa48("1341", "1342", "1343"), !registration)) {
        if (stryMutAct_9fa48("1344")) {
          {}
        } else {
          stryCov_9fa48("1344");
          throw new Error(stryMutAct_9fa48("1345") ? `` : (stryCov_9fa48("1345"), `Service not found for token ${String(token)}`));
        }
      }
      if (stryMutAct_9fa48("1347") ? false : stryMutAct_9fa48("1346") ? true : (stryCov_9fa48("1346", "1347"), this.resolving.has(token))) {
        if (stryMutAct_9fa48("1348")) {
          {}
        } else {
          stryCov_9fa48("1348");
          throw new Error(stryMutAct_9fa48("1349") ? `` : (stryCov_9fa48("1349"), `Circular dependency detected while resolving ${String(token)}`));
        }
      }
      this.resolving.add(token);
      try {
        if (stryMutAct_9fa48("1350")) {
          {}
        } else {
          stryCov_9fa48("1350");
          if (stryMutAct_9fa48("1353") ? registration.lifetime !== 'singleton' : stryMutAct_9fa48("1352") ? false : stryMutAct_9fa48("1351") ? true : (stryCov_9fa48("1351", "1352", "1353"), registration.lifetime === (stryMutAct_9fa48("1354") ? "" : (stryCov_9fa48("1354"), 'singleton')))) {
            if (stryMutAct_9fa48("1355")) {
              {}
            } else {
              stryCov_9fa48("1355");
              if (stryMutAct_9fa48("1358") ? registration.instance !== undefined : stryMutAct_9fa48("1357") ? false : stryMutAct_9fa48("1356") ? true : (stryCov_9fa48("1356", "1357", "1358"), registration.instance === undefined)) {
                if (stryMutAct_9fa48("1359")) {
                  {}
                } else {
                  stryCov_9fa48("1359");
                  registration.instance = await registration.factory(this);
                }
              }
              return registration.instance as T;
            }
          }
          if (stryMutAct_9fa48("1362") ? registration.lifetime !== 'scoped' : stryMutAct_9fa48("1361") ? false : stryMutAct_9fa48("1360") ? true : (stryCov_9fa48("1360", "1361", "1362"), registration.lifetime === (stryMutAct_9fa48("1363") ? "" : (stryCov_9fa48("1363"), 'scoped')))) {
            if (stryMutAct_9fa48("1364")) {
              {}
            } else {
              stryCov_9fa48("1364");
              if (stryMutAct_9fa48("1367") ? false : stryMutAct_9fa48("1366") ? true : stryMutAct_9fa48("1365") ? this.scopedInstances.has(token) : (stryCov_9fa48("1365", "1366", "1367"), !this.scopedInstances.has(token))) {
                if (stryMutAct_9fa48("1368")) {
                  {}
                } else {
                  stryCov_9fa48("1368");
                  const instance = await registration.factory(this);
                  this.scopedInstances.set(token, instance);
                }
              }
              return this.scopedInstances.get(token) as T;
            }
          }

          // transient
          return (await registration.factory(this)) as T;
        }
      } finally {
        if (stryMutAct_9fa48("1369")) {
          {}
        } else {
          stryCov_9fa48("1369");
          this.resolving.delete(token);
        }
      }
    }
  }
  async dispose(): Promise<void> {
    if (stryMutAct_9fa48("1370")) {
      {}
    } else {
      stryCov_9fa48("1370");
      const disposals: Array<Promise<void> | void> = stryMutAct_9fa48("1371") ? ["Stryker was here"] : (stryCov_9fa48("1371"), []);

      // dispose scoped instances
      for (const instance of this.scopedInstances.values()) {
        if (stryMutAct_9fa48("1372")) {
          {}
        } else {
          stryCov_9fa48("1372");
          // Note: We can't easily get the registration here without the token
          // This is a limitation of the current design
          // For now, we'll just dispose the instance if it has a destroy method
          if (stryMutAct_9fa48("1375") ? instance || typeof (instance as unknown as {
            destroy?: () => Promise<void>;
          }).destroy === 'function' : stryMutAct_9fa48("1374") ? false : stryMutAct_9fa48("1373") ? true : (stryCov_9fa48("1373", "1374", "1375"), instance && (stryMutAct_9fa48("1377") ? typeof (instance as unknown as {
            destroy?: () => Promise<void>;
          }).destroy !== 'function' : stryMutAct_9fa48("1376") ? true : (stryCov_9fa48("1376", "1377"), typeof (instance as unknown as {
            destroy?: () => Promise<void>;
          }).destroy === (stryMutAct_9fa48("1378") ? "" : (stryCov_9fa48("1378"), 'function')))))) {
            if (stryMutAct_9fa48("1379")) {
              {}
            } else {
              stryCov_9fa48("1379");
              disposals.push((instance as unknown as {
                destroy: () => Promise<void>;
              }).destroy());
            }
          }
        }
      }
      this.scopedInstances.clear();

      // dispose singleton instances only if owned by this container
      for (const registration of this.registrations.values()) {
        if (stryMutAct_9fa48("1380")) {
          {}
        } else {
          stryCov_9fa48("1380");
          if (stryMutAct_9fa48("1383") ? registration.lifetime === 'singleton' || registration.instance !== undefined : stryMutAct_9fa48("1382") ? false : stryMutAct_9fa48("1381") ? true : (stryCov_9fa48("1381", "1382", "1383"), (stryMutAct_9fa48("1385") ? registration.lifetime !== 'singleton' : stryMutAct_9fa48("1384") ? true : (stryCov_9fa48("1384", "1385"), registration.lifetime === (stryMutAct_9fa48("1386") ? "" : (stryCov_9fa48("1386"), 'singleton')))) && (stryMutAct_9fa48("1388") ? registration.instance === undefined : stryMutAct_9fa48("1387") ? true : (stryCov_9fa48("1387", "1388"), registration.instance !== undefined)))) {
            if (stryMutAct_9fa48("1389")) {
              {}
            } else {
              stryCov_9fa48("1389");
              if (stryMutAct_9fa48("1391") ? false : stryMutAct_9fa48("1390") ? true : (stryCov_9fa48("1390", "1391"), registration.destroy)) {
                if (stryMutAct_9fa48("1392")) {
                  {}
                } else {
                  stryCov_9fa48("1392");
                  disposals.push(registration.destroy(registration.instance));
                }
              }
            }
          }
        }
      }
      await Promise.all(disposals);
    }
  }
  createScope(): Container {
    if (stryMutAct_9fa48("1393")) {
      {}
    } else {
      stryCov_9fa48("1393");
      return new Container(this);
    }
  }
  async withScope<T>(fn: (scope: Container) => Promise<T> | T): Promise<T> {
    if (stryMutAct_9fa48("1394")) {
      {}
    } else {
      stryCov_9fa48("1394");
      const scope = this.createScope();
      try {
        if (stryMutAct_9fa48("1395")) {
          {}
        } else {
          stryCov_9fa48("1395");
          return await fn(scope);
        }
      } finally {
        if (stryMutAct_9fa48("1396")) {
          {}
        } else {
          stryCov_9fa48("1396");
          await scope.dispose();
        }
      }
    }
  }
  private getRegistration(token: symbol): Registration<unknown> | undefined {
    if (stryMutAct_9fa48("1397")) {
      {}
    } else {
      stryCov_9fa48("1397");
      return stryMutAct_9fa48("1398") ? this.getOwnRegistration(token) && this.parent?.getRegistration(token) : (stryCov_9fa48("1398"), this.getOwnRegistration(token) ?? (stryMutAct_9fa48("1399") ? this.parent.getRegistration(token) : (stryCov_9fa48("1399"), this.parent?.getRegistration(token))));
    }
  }
  private getOwnRegistration(token: symbol): Registration<unknown> | undefined {
    if (stryMutAct_9fa48("1400")) {
      {}
    } else {
      stryCov_9fa48("1400");
      return this.registrations.get(token);
    }
  }
}