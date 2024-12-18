// src/index.ts
import { useCallback, useEffect, useState } from "react";
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
  const [pullStartPosition, setPullStartPosition] = useState(0);
  const [pullPosition, setPullPosition] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onPullStart = useCallback(
    ({ targetTouches }) => {
      if (isDisabled) return;
      const touch = targetTouches[0];
      if (touch) setPullStartPosition(touch.screenY);
    },
    [isDisabled]
  );
  const onPulling = useCallback(
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
  const onEndPull = useCallback(() => {
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
  useEffect(() => {
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
  useEffect(() => {
    if (isValid(maximumPullLength, refreshThreshold) || process.env.NODE_ENV === "production" || isDisabled) return;
    console.warn(
      "usePullToRefresh",
      `'maximumPullLength' (currently ${maximumPullLength})  should be bigger or equal than 'refreshThreshold' (currently ${refreshThreshold})`
    );
  }, [maximumPullLength, refreshThreshold, isDisabled]);
  return { isRefreshing, pullPosition };
};
export {
  DEFAULT_MAXIMUM_PULL_LENGTH,
  DEFAULT_REFRESH_THRESHOLD,
  usePullToRefresh
};
