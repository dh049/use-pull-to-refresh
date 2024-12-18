"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DEFAULT_MAXIMUM_PULL_LENGTH: () => DEFAULT_MAXIMUM_PULL_LENGTH,
  DEFAULT_REFRESH_THRESHOLD: () => DEFAULT_REFRESH_THRESHOLD,
  usePullToRefresh: () => usePullToRefresh
});
module.exports = __toCommonJS(src_exports);
var import_react = require("react");
var DEFAULT_MAXIMUM_PULL_LENGTH = 240;
var DEFAULT_REFRESH_THRESHOLD = 180;
var isValid = (maximumPullLength, refreshThreshold) => maximumPullLength >= refreshThreshold;
var usePullToRefresh = ({
  onRefresh,
  maximumPullLength = DEFAULT_MAXIMUM_PULL_LENGTH,
  refreshThreshold = DEFAULT_REFRESH_THRESHOLD,
  isDisabled = false,
  pullUp = false
}) => {
  const [pullStartPosition, setPullStartPosition] = (0, import_react.useState)(0);
  const [pullPosition, setPullPosition] = (0, import_react.useState)(0);
  const [isRefreshing, setIsRefreshing] = (0, import_react.useState)(false);
  const onPullStart = (0, import_react.useCallback)(
    ({ targetTouches }) => {
      if (isDisabled) return;
      const touch = targetTouches[0];
      if (touch) setPullStartPosition(touch.screenY);
    },
    [isDisabled]
  );
  const onPulling = (0, import_react.useCallback)(
    ({ targetTouches }) => {
      if (isDisabled) return;
      const touch = targetTouches[0];
      if (!touch) return;
      let currentPullLength = 0;
      const pulledDown = pullStartPosition < touch.screenY;
      if (pulledDown && !pullUp || !pulledDown && pullUp) {
        currentPullLength = Math.abs(touch.screenY - pullStartPosition);
      }
      const inZone = pullUp ? pullStartPosition > window.screen.height * 2 / 3 : pullStartPosition < window.screen.height / 3;
      if (currentPullLength <= maximumPullLength && inZone) {
        setPullPosition(() => currentPullLength);
      }
    },
    [isDisabled, maximumPullLength, pullStartPosition, pullUp]
  );
  const onEndPull = (0, import_react.useCallback)(() => {
    if (isDisabled) return;
    setPullStartPosition(0);
    setPullPosition(0);
    if (pullPosition < refreshThreshold) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const cb = onRefresh();
      if (typeof cb === "object") return void cb.finally(() => setIsRefreshing(false));
      setIsRefreshing(false);
    }, 500);
  }, [isDisabled, onRefresh, pullPosition, refreshThreshold]);
  (0, import_react.useEffect)(() => {
    if (typeof window === "undefined" || isDisabled) return;
    const ac = new AbortController();
    const options = {
      passive: true,
      signal: ac.signal
    };
    window.addEventListener("touchstart", onPullStart, options);
    window.addEventListener("touchmove", onPulling, options);
    window.addEventListener("touchend", onEndPull, options);
    return () => void ac.abort();
  }, [isDisabled, onEndPull, onPullStart, onPulling]);
  (0, import_react.useEffect)(() => {
    if (isValid(maximumPullLength, refreshThreshold) || process.env.NODE_ENV === "production" || isDisabled) return;
    console.warn(
      "usePullToRefresh",
      `'maximumPullLength' (currently ${maximumPullLength})  should be bigger or equal than 'refreshThreshold' (currently ${refreshThreshold})`
    );
  }, [maximumPullLength, refreshThreshold, isDisabled]);
  return { isRefreshing, pullPosition };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_MAXIMUM_PULL_LENGTH,
  DEFAULT_REFRESH_THRESHOLD,
  usePullToRefresh
});
