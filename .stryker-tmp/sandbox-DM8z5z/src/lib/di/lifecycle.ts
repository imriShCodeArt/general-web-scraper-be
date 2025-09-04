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
export interface Initializable {
  initialize(): Promise<void> | void;
}
export interface Destroyable {
  destroy(): Promise<void> | void;
}
export function isInitializable(value: unknown): value is Initializable {
  if (stryMutAct_9fa48("1401")) {
    {}
  } else {
    stryCov_9fa48("1401");
    return stryMutAct_9fa48("1404") ? !!value || typeof (value as unknown as {
      initialize?: () => Promise<void> | void;
    }).initialize === 'function' : stryMutAct_9fa48("1403") ? false : stryMutAct_9fa48("1402") ? true : (stryCov_9fa48("1402", "1403", "1404"), (stryMutAct_9fa48("1405") ? !value : (stryCov_9fa48("1405"), !(stryMutAct_9fa48("1406") ? value : (stryCov_9fa48("1406"), !value)))) && (stryMutAct_9fa48("1408") ? typeof (value as unknown as {
      initialize?: () => Promise<void> | void;
    }).initialize !== 'function' : stryMutAct_9fa48("1407") ? true : (stryCov_9fa48("1407", "1408"), typeof (value as unknown as {
      initialize?: () => Promise<void> | void;
    }).initialize === (stryMutAct_9fa48("1409") ? "" : (stryCov_9fa48("1409"), 'function')))));
  }
}
export function isDestroyable(value: unknown): value is Destroyable {
  if (stryMutAct_9fa48("1410")) {
    {}
  } else {
    stryCov_9fa48("1410");
    return stryMutAct_9fa48("1413") ? !!value || typeof (value as unknown as {
      destroy?: () => Promise<void> | void;
    }).destroy === 'function' : stryMutAct_9fa48("1412") ? false : stryMutAct_9fa48("1411") ? true : (stryCov_9fa48("1411", "1412", "1413"), (stryMutAct_9fa48("1414") ? !value : (stryCov_9fa48("1414"), !(stryMutAct_9fa48("1415") ? value : (stryCov_9fa48("1415"), !value)))) && (stryMutAct_9fa48("1417") ? typeof (value as unknown as {
      destroy?: () => Promise<void> | void;
    }).destroy !== 'function' : stryMutAct_9fa48("1416") ? true : (stryCov_9fa48("1416", "1417"), typeof (value as unknown as {
      destroy?: () => Promise<void> | void;
    }).destroy === (stryMutAct_9fa48("1418") ? "" : (stryCov_9fa48("1418"), 'function')))));
  }
}