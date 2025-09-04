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
export const isDebugEnabled = stryMutAct_9fa48("3913") ? () => undefined : (stryCov_9fa48("3913"), (() => {
  const isDebugEnabled = () => stryMutAct_9fa48("3916") ? process.env.SCRAPER_DEBUG === '1' && process.env.DEBUG === '1' : stryMutAct_9fa48("3915") ? false : stryMutAct_9fa48("3914") ? true : (stryCov_9fa48("3914", "3915", "3916"), (stryMutAct_9fa48("3918") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3917") ? false : (stryCov_9fa48("3917", "3918"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3919") ? "" : (stryCov_9fa48("3919"), '1')))) || (stryMutAct_9fa48("3921") ? process.env.DEBUG !== '1' : stryMutAct_9fa48("3920") ? false : (stryCov_9fa48("3920", "3921"), process.env.DEBUG === (stryMutAct_9fa48("3922") ? "" : (stryCov_9fa48("3922"), '1')))));
  return isDebugEnabled;
})());
export const debug = (...args: unknown[]) => {
  if (stryMutAct_9fa48("3923")) {
    {}
  } else {
    stryCov_9fa48("3923");
    if (stryMutAct_9fa48("3925") ? false : stryMutAct_9fa48("3924") ? true : (stryCov_9fa48("3924", "3925"), isDebugEnabled())) {
      if (stryMutAct_9fa48("3926")) {
        {}
      } else {
        stryCov_9fa48("3926");
        // eslint-disable-next-line no-console
        console.log(...args);
      }
    }
  }
};
export const info = (...args: unknown[]) => {
  if (stryMutAct_9fa48("3927")) {
    {}
  } else {
    stryCov_9fa48("3927");
    // eslint-disable-next-line no-console
    console.info(...args);
  }
};
export const warn = (...args: unknown[]) => {
  if (stryMutAct_9fa48("3928")) {
    {}
  } else {
    stryCov_9fa48("3928");
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};
export const error = (...args: unknown[]) => {
  if (stryMutAct_9fa48("3929")) {
    {}
  } else {
    stryCov_9fa48("3929");
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};