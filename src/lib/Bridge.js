import { useState, useEffect } from '@wordpress/element';

export const useBridge = () => {
    const [bridgeData, setBridgeData] = useState(window.BillManagerBridge || null);

    useEffect(() => {
        // Poll for the bridge if it's not immediately available
        const interval = setInterval(() => {
            if (window.BillManagerBridge) {
                setBridgeData(window.BillManagerBridge);
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return bridgeData;
};