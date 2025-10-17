
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAnalytics, type EventName } from './use-analytics';

/**
 * A hook to ensure an analytics event is tracked only once for a given key
 * within the component's lifecycle, even with HMR or re-renders.
 *
 * @param key A unique string to identify the event. If the key changes, the event can be tracked again.
 */
export const useOnceEvent = (key: string) => {
    const { track } = useAnalytics();
    const trackedKeys = useRef(new Set<string>());

    // Reset tracked keys if the component unmounts
    useEffect(() => {
        return () => {
            trackedKeys.current.clear();
        };
    }, []);

    const trackOnce = useCallback(
        (eventName: EventName, payload?: any) => {
            if (process.env.NODE_ENV === 'development') {
                if (trackedKeys.current.has(key)) {
                    console.log(`[Analytics] Event "${eventName}" with key "${key}" already tracked. Skipping.`);
                    return;
                }
            }
            track(eventName, payload);
            trackedKeys.current.add(key);
        },
        [key, track]
    );

    return { trackOnce };
};

    