# Feedback Webhook Integration

This document explains how to configure third-party webhook integration for the feedback form in Mos Product Specifications Tab.

## Overview

The feedback form sends two emails:
1. **Thank You Email** - Sent to the user who submitted feedback (or admin email if user email is blank)
2. **Admin Notification** - Sent to `mostak.shahid@gmail.com` with all feedback details

Additionally, the plugin can send feedback data to a third-party webhook endpoint for reliable storage and backup.

## Why Use Webhook Integration?

SMTP email delivery can be unreliable due to:
- Server configuration issues
- Spam filter problems
- Email provider restrictions
- Rate limiting

Webhook integration provides:
- ✅ Reliable data delivery
- ✅ Instant notification
- ✅ Centralized data collection
- ✅ Backup storage
- ✅ Integration with other tools

## Supported Webhook Services

You can use any service that accepts POST requests with JSON payload:

### Free Options:
1. **Discord Webhook** - Free, instant notifications to Discord channels
2. **Slack Webhook** - Free tier available
3. **Google Sheets via Google Forms** - Free spreadsheet storage
4. **Formspree** - Free tier with 50 submissions/month
5. **Formsubmit** - Free form handler
6. **Make.com (Integromat)** - Free tier with 1000 operations/month
7. **n8n** - Self-hosted, free and open-source
8. **Zapier** - Free tier with 100 tasks/month
9. **Pipedream** - Free tier with 500 workflow runs/month

### Paid Options:
1. **Airtable API** - Database storage
2. **Notion API** - Documentation and database
3. **Typeform API** - Professional form handling
4. **Custom API endpoint** - Build your own

## Configuration

To configure the webhook, add this filter to your theme's `functions.php` file or a custom plugin:

```php
add_filter('bill_manager_feedback_webhook_url', function($url) {
    return 'YOUR_WEBHOOK_URL_HERE';
});
```

## Example Configurations

### 1. Discord Webhook

```php
add_filter('bill_manager_feedback_webhook_url', function($url) {
    // Create webhook in Discord Server Settings → Integrations → Webhooks
    return 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';
});
```

**Note:** Discord requires specific JSON format. You may need to use a middleware service like Make.com to format the data correctly.

### 2. Slack Webhook

```php
add_filter('bill_manager_feedback_webhook_url', function($url) {
    // Create incoming webhook at https://api.slack.com/apps
    return 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
});
```

### 3. Formspree

```php
add_filter('bill_manager_feedback_webhook_url', function($url) {
    // Create form at https://formspree.io/
    return 'https://formspree.io/f/YOUR_FORM_ID';
});
```

### 4. Custom API Endpoint (using Make.com)

```php
add_filter('bill_manager_feedback_webhook_url', function($url) {
    // Create webhook in Make.com
    return 'https://hook.us1.make.com/YOUR_WEBHOOK_HASH';
});
```

## Webhook Payload Structure

The webhook receives a JSON payload with the following structure:

```json
{
    "site_name": "Your Website Name",
    "site_url": "https://yourwebsite.com",
    "subject": "Feedback Subject",
    "message": "Feedback message content",
    "user_email": "user@example.com",
    "phone": "+1234567890",
    "timestamp": "2024-01-15 10:30:00"
}
```

### Field Descriptions:

| Field | Type | Description |
|-------|------|-------------|
| `site_name` | string | WordPress site name |
| `site_url` | string | WordPress site URL |
| `subject` | string | Feedback subject |
| `message` | string | Feedback message content |
| `user_email` | string | User's email address (if provided) |
| `phone` | string | User's phone number (if provided) |
| `timestamp` | string | MySQL timestamp of submission |

## Testing the Webhook

After configuring the webhook:

1. Test it by submitting feedback through the form
2. Check your webhook service for the received data
3. Check error logs: `wp-content/debug.log` for any issues

Error log format:
```
Mos Product Specifications Tab - Failed to send feedback to webhook: Error message
```

## Best Practices

1. **Use multiple services**: Configure both email and webhook for redundancy
2. **Test regularly**: Periodically test your webhook to ensure it's working
3. **Monitor logs**: Check error logs for failed webhook deliveries
4. **Secure your webhook**: Use HTTPS and authentication where possible
5. **Backup data**: Periodically export data from your webhook service

## Troubleshooting

### Webhook not receiving data:
- Verify the webhook URL is correct
- Check if the service requires specific headers or authentication
- Review WordPress error logs
- Test the webhook with a tool like cURL or Postman

### Emails not sending:
- Check WordPress email configuration
- Verify SMTP settings if using an SMTP plugin
- Check spam folders
- Review server email logs

### Both email and webhook failing:
- Check server firewall settings
- Verify outgoing connections are allowed
- Contact your hosting provider
- Check for rate limiting

## Advanced Configuration

### Conditional Webhook (send only if specific condition met):

```php
add_filter('bill_manager_feedback_webhook_url', function($url) {
    // Example: Only send webhook for urgent feedback
    $urgent_subjects = ['urgent', 'critical', 'bug'];
    if (in_array(strtolower($_POST['subject'] ?? ''), $urgent_subjects)) {
        return 'https://hook.us1.make.com/YOUR_URGENT_WEBHOOK';
    }
    return $url;
});
```

### Multiple Webhooks:

```php
add_action('rest_after_insert_feedback', function($request, $response) {
    $data = $response->get_data();
    
    // Send to Discord
    wp_remote_post('https://discord.com/api/webhooks/YOUR_WEBHOOK', [
        'body' => json_encode($data),
        'headers' => ['Content-Type' => 'application/json']
    ]);
    
    // Send to Slack
    wp_remote_post('https://hooks.slack.com/services/YOUR_WEBHOOK', [
        'body' => json_encode($data),
        'headers' => ['Content-Type' => 'application/json']
    ]);
}, 10, 2);
```

## Support

For issues or questions:
- WordPress.org support forum
- Email: mostak.shahid@gmail.com
- Documentation: https://www.mdmostakshahid.com/bill-manager/
