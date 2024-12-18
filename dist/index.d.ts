declare const DEFAULT_MAXIMUM_PULL_LENGTH = 240;
declare const DEFAULT_REFRESH_THRESHOLD = 180;
type UsePullToRefreshParams = {
    onRefresh: () => void | Promise<void>;
    maximumPullLength?: number;
    refreshThreshold?: number;
    isDisabled?: boolean;
    pullUp?: boolean;
};
type UsePullToRefreshReturn = {
    isRefreshing: boolean;
    pullPosition: number;
};
type UsePullToRefresh = (params: UsePullToRefreshParams) => UsePullToRefreshReturn;
declare const usePullToRefresh: UsePullToRefresh;

export { DEFAULT_MAXIMUM_PULL_LENGTH, DEFAULT_REFRESH_THRESHOLD, type UsePullToRefresh, type UsePullToRefreshParams, type UsePullToRefreshReturn, usePullToRefresh };
