import apiFetch from "@wordpress/api-fetch";
import { useEffect, useState } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
// Helper function to set nested values dynamically
export const setNestedValue = (obj, path, value) => {
    const keys = path.split(".");
    const newObj = JSON.parse(JSON.stringify(obj)); // Deep copy to avoid state mutation
    let current = newObj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
        }

        current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    // console.log("Updated Options:", newObj);
    return newObj; // Return full new object
};
const convertToPathArray = (path) => {
    // Step 1: Split by dots (.)
    let parts = path.split(".");

    // Step 2: Find "php" in the array and modify the previous element
    let phpIndex = parts.indexOf("php");
    if (phpIndex > 0) {
        parts[phpIndex - 1] += ".php"; // Append ".php" to the previous element
        parts.splice(phpIndex, 1); // Remove the "php" element
    }
    return parts;
}
export function convertToSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .normalize('NFD')                 // Decompose Unicode characters into base letters and accent marks
        .replace(/[\u0300-\u036f]/g, '')  // Strip out all decomposed accent marks
        .replace(/[^a-z0-9\s-]/g, '')     // Clean up remaining punctuation
        .replace(/[\s-]+/g, '-')          // Coalesce spacing / hyphens
        .replace(/^-+|-+$/g, '');         // Trim dangling hyphens
}
// Function to ajax post data
export const formDataPost = async (action, data = {}) => {
    try {
        const formData = new FormData();
        // Append the action
        formData.append('action', action);
        // Append the security nonce
        const _admin_nonce = bill_manager_ajax_obj?._admin_nonce || '';
        formData.append('_admin_nonce', _admin_nonce);
        // Make the fetch request

        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        // Make the POST request
        const response = await apiFetch({
            url: bill_manager_ajax_obj.ajax_url,
            method: 'POST',
            body: formData,
            headers: {
                'X-WP-Nonce': bill_manager_ajax_obj.api_nonce
            }
        });
        if (response.success) {
            return response;
        } else {
            throw new Error(response.data?.error_message || 'Reset failed');
        }
    } catch (error) {
        console.error('API Service Error:', error);
        throw error;
    }
}
export const urlToArr = () => {
    const location = useLocation();
    const [activePath, setActivePath] = useState('');
    const [activePathArr, setActivePathArr] = useState('');
    useEffect(() => {
        // Get the path from the location
        let path = location.pathname;

        // If using HashRouter, the path is in location.hash (remove the leading #)
        if (location.hash) {
            path = location.hash.substring(1);
        }

        // Remove leading slash if present
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        setActivePath(path);
        setActivePathArr(path.split("/"));

        // Convert slashes to dots
        // const dotPath = path.replace(/\//g, '.');

        // Handle empty path (home page)
        // const formattedPath = dotPath || 'home';

        // setActivePath(formattedPath);
    }, [location]);
    return activePathArr;
}
export function useSettingsBodyHeight() {
    const [height, setHeight] = useState(0);

    useEffect(() => {
        function calculateHeight() {
            // Base height (document or viewport fallback)
            const baseHeight = document.body.scrollHeight || window.innerHeight;

            // Helper to get element height safely
            const getHeight = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.offsetHeight : 0;
            };

            // Heights of optional elements
            const bannerHeight = getHeight('.bill-manager-promote-banner');
            const headerHeight = getHeight('.bill-manager-header');
            const footerHeight = getHeight('.bill-manager-footer');

            // Subtract them from total height
            const finalHeight = baseHeight - (bannerHeight + headerHeight + footerHeight);

            setHeight(finalHeight);
        }

        // Initial calculation
        calculateHeight();

        // Listeners
        window.visualViewport?.addEventListener("resize", calculateHeight);
        window.visualViewport?.addEventListener("scroll", calculateHeight);

        return () => {
            window.visualViewport?.removeEventListener("resize", calculateHeight);
            window.visualViewport?.removeEventListener("scroll", calculateHeight);
        };
    }, []);

    return height;
}
// Custom Hook to listen to window resizing
export function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}

export function capitalizeWords(string) {
    // Split the string into an array of words
    const words = string.split(' ');

    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Join the words back into a single string with spaces
    return capitalizedWords.join(' ');
}