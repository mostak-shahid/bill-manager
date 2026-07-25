<?php
/**
 * Plugin Name: Mos Product Specifications Tab - Feedback Webhook Config
 * Description: Configure webhook integration for feedback form
 * Version: 1.0.0
 * Author: Mostak Shahid
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Configure your webhook URL below
 * 
 * Uncomment one of the options below or add your own webhook URL
 */

// Option 1: Discord Webhook (recommended for free, instant notifications)
// Create webhook at: Server Settings → Integrations → Webhooks
// add_filter('bill_manager_feedback_webhook_url', function($url) {
//     return 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
// });

// Option 2: Slack Webhook
// Create incoming webhook at: https://api.slack.com/apps
// add_filter('bill_manager_feedback_webhook_url', function($url) {
//     return 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
// });

// Option 3: Make.com (Integromat) - Most flexible option
// Create webhook at: https://www.make.com/en
// add_filter('bill_manager_feedback_webhook_url', function($url) {
//     return 'https://hook.us1.make.com/YOUR_WEBHOOK_HASH';
// });

// Option 4: Formspree - Simple form handler
// Create form at: https://formspree.io/
// add_filter('bill_manager_feedback_webhook_url', function($url) {
//     return 'https://formspree.io/f/YOUR_FORM_ID';
// });

// Option 5: Custom webhook URL
// add_filter('bill_manager_feedback_webhook_url', function($url) {
//     return 'YOUR_CUSTOM_WEBHOOK_URL_HERE';
// });

/**
 * Example: Send webhook notification to admin when critical feedback is received
 * 
 * This example sends additional notification to a different webhook
 * when feedback contains urgent/critical keywords
 */
add_action('rest_after_insert_feedback', function($request, $response) {
    $data = $response->get_data();
    $subject = strtolower($data['subject'] ?? '');
    $urgent_keywords = ['urgent', 'critical', 'bug', 'error', 'broken', 'not working'];
    
    // Check if subject contains urgent keywords
    foreach ($urgent_keywords as $keyword) {
        if (strpos($subject, $keyword) !== false) {
            // Send urgent notification
            wp_remote_post('YOUR_URGENT_NOTIFICATION_WEBHOOK_URL', [
                'body' => json_encode([
                    'text' => __('🚨 Urgent Feedback Received!', 'bill-manager'),
                    'data' => $data
                ]),
                'headers' => ['Content-Type' => 'application/json'],
                'timeout' => 30
            ]);
            break;
        }
    }
}, 10, 2);

/**
 * Example: Log all feedback submissions to a custom file
 * 
 * This creates a log file in wp-content/uploads/mos-feedback.log
 */
add_action('rest_after_insert_feedback', function($request, $response) {
    $data = $response->get_data();
    $upload_dir = wp_upload_dir();
    $log_file = $upload_dir['basedir'] . '/mos-feedback.log';
    
    $log_entry = sprintf(
        "[%s] Site: %s | Subject: %s | Email: %s | Phone: %s\n",
        current_time('mysql'),
        $data['site_name'] ?? 'N/A',
        $data['subject'] ?? 'N/A',
        $data['user_email'] ?? 'N/A',
        $data['phone'] ?? 'N/A'
    );
    
    file_put_contents($log_file, $log_entry, FILE_APPEND);
}, 10, 2);

/**
 * Example: Store feedback in WordPress database as a custom post type
 * 
 * This creates a "Feedback" post type entry for each submission
 */
add_action('rest_after_insert_feedback', function($request, $response) {
    $data = $response->get_data();
    
    $feedback_id = wp_insert_post([
        'post_title' => sanitize_text_field($data['subject']),
        'post_content' => sanitize_textarea_field($data['message']),
        'post_type' => 'mos_feedback',
        'post_status' => 'private',
        'meta_input' => [
            'user_email' => sanitize_email($data['user_email']),
            'user_phone' => sanitize_text_field($data['phone']),
            'site_url' => esc_url($data['site_url']),
            'submitted_at' => current_time('mysql')
        ]
    ]);
}, 10, 2);

/**
 * Example: Send to Google Sheets via Google Forms
 * 
 * Note: You need to set up a Google Form and use a service like Make.com
 * or n8n to forward the webhook data to Google Sheets
 * 
 * add_filter('bill_manager_feedback_webhook_url', function($url) {
 *     // Use Make.com or similar to bridge to Google Sheets
 *     return 'https://hook.make.com/YOUR_GOOGLE_SHEETS_WEBHOOK';
 * });
 */
