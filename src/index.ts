import { useCallback, useEffect, useState } from 'react';

export const DEFAULT_MAXIMUM_PULL_LENGTH = 240;
export const DEFAULT_REFRESH_THRESHOLD = 180;

export type UsePullToRefreshParams = {
	onRefresh: () => void | Promise<void>;
	// default value is 240
	maximumPullLength?: number;
	// default value is 180
	refreshThreshold?: number;
	isDisabled?: boolean;
	pullUp?: boolean;
};
export type UsePullToRefreshReturn = {
	isRefreshing: boolean;
	pullPosition: number;
};
export type UsePullToRefresh = (params: UsePullToRefreshParams) => UsePullToRefreshReturn;

const isValid = (maximumPullLength: number, refreshThreshold: number) => maximumPullLength >= refreshThreshold;

export const usePullToRefresh: UsePullToRefresh = ({
	onRefresh,
	maximumPullLength = DEFAULT_MAXIMUM_PULL_LENGTH,
	refreshThreshold = DEFAULT_REFRESH_THRESHOLD,
	isDisabled = false,
	pullUp = false
}: UsePullToRefreshParams) => {
	const [pullStartPosition, setPullStartPosition] = useState(0);
	const [pullPosition, setPullPosition] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const onPullStart = useCallback(
		({ targetTouches }: TouchEvent) => {
			if (isDisabled) return;

			const touch = targetTouches[0];

			if (touch) setPullStartPosition(touch.screenY);
		},
		[isDisabled]
	);

	const onPulling = useCallback(
		({ targetTouches }: TouchEvent) => {
			if (isDisabled) return;

			const touch = targetTouches[0];

			if (!touch) return;

			let currentPullLength = 0;
			const pulledDown = pullStartPosition < touch.screenY;
			if ((pulledDown && !pullUp) || (!pulledDown && pullUp)) {
				currentPullLength = Math.abs(touch.screenY - pullStartPosition);
			}

			const inZone = pullUp
				? pullStartPosition > (window.screen.height * 2) / 3
				: pullStartPosition < window.screen.height / 3;
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

			if (typeof cb === 'object') return void cb.finally(() => setIsRefreshing(false));

			setIsRefreshing(false);
		}, 500);
	}, [isDisabled, onRefresh, pullPosition, refreshThreshold]);

	useEffect(() => {
		if (typeof window === 'undefined' || isDisabled) return;

		const ac = new AbortController();
		const options = {
			passive: true,
			signal: ac.signal
		};

		window.addEventListener('touchstart', onPullStart, options);
		window.addEventListener('touchmove', onPulling, options);
		window.addEventListener('touchend', onEndPull, options);

		return () => void ac.abort();
	}, [isDisabled, onEndPull, onPullStart, onPulling]);

	useEffect(() => {
		if (isValid(maximumPullLength, refreshThreshold) || process.env.NODE_ENV === 'production' || isDisabled) return;
		console.warn(
			'usePullToRefresh',
			`'maximumPullLength' (currently ${maximumPullLength})  should be bigger or equal than 'refreshThreshold' (currently ${refreshThreshold})`
		);
	}, [maximumPullLength, refreshThreshold, isDisabled]);

	return { isRefreshing, pullPosition };
};
