import {HashRouter} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './bootstrap-wrapper.css';
import './index.css'; // Tells Webpack to handle the CSS compilation
import { render } from '@wordpress/element';
import App from './App';
import apiFetch from '@wordpress/api-fetch';
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
    const container = document.getElementById('bill-manager-settings-react-app');
    if (container) {
        render(<HashRouter><App /></HashRouter>, container);
    }
});
