import '../bootstrap-wrapper.scss';
import { render } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import ProfileApp from './ProfileApp';
// Configure apiFetch with REST API settings
// WordPress automatically uses window.wpApiSettings if available
// Fallback to manual configuration if needed
if (typeof window.wpApiSettings === 'undefined' && typeof bill_manager_ajax_obj !== 'undefined') {
    window.wpApiSettings = {
        root: bill_manager_ajax_obj.root,
        nonce: bill_manager_ajax_obj.nonce
    };
}

// Ensure apiFetch uses the configured settings
if (typeof window.wpApiSettings !== 'undefined') {
    apiFetch.use(apiFetch.createRootURLMiddleware(window.wpApiSettings.root));
    apiFetch.use(apiFetch.createNonceMiddleware(window.wpApiSettings.nonce));
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bill-manager-profile-react-app');
    if (container) {
        render(<ProfileApp/> , container);
    }
});
