<?php

namespace MosPress\BillManager\Core;
/**
 * Fired during plugin activation
 *
 * @link       https://mostak-shahid.github.io/
 * @since      1.0.0
 *
 * @package    BillManager
 * @subpackage BillManager/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    BillManager
 * @subpackage BillManager/includes
 * @author     Md. Mostak Shahid <mostak.shahid@gmail.com>
 */
use MosPress\BillManager\Helpers\CryptoHelper;
use MosPress\BillManager\Helpers\Utils;
class Activator
{

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate()
	{
		// $bill_manager_options = bill_manager_get_option();
		// update_option('bill_manager_options', $bill_manager_options);
		add_option('bill_manager_do_activation_redirect', true);

		self::create_necessary_table();

		// Check if OpenSSL is available
        if ( ! CryptoHelper::is_encryption_available() ) {
            wp_die(
                esc_html__( 'OpenSSL is required but not available on your server. Please contact your hosting provider.', 'bill-manager' ),
                esc_html__( 'Plugin Activation Error', 'bill-manager' ),
                array( 'back_link' => true )
            );
        }

        // Generate random 8-digit string
        $random_key = CryptoHelper::generate_random_string( 8 );

        // Encrypt the key
        $encrypted_key = CryptoHelper::encrypt( $random_key );

        if ( false === $encrypted_key ) {
            wp_die(
                esc_html__( 'Failed to generate secure deactivation key. Please try again.', 'bill-manager' ),
                esc_html__( 'Plugin Activation Error', 'bill-manager' ),
                array( 'back_link' => true )
            );
        }

        // Store the encrypted key in options
        update_option( 'bill_manager_deactive_key', $encrypted_key, false );

        // Log activation if debugging is enabled
        // if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        //     error_log( 'Bill Manager activated with secure deactivation key' );
        // }

        // Flush rewrite rules
        flush_rewrite_rules();

        // Set activation flag for any one-time notices
        set_transient( 'bill_manager_activation_notice', true, 30 );
	}

	private static function create_necessary_table()
	{
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

		$logs_table = $wpdb->prefix . 'bill_manager_logs';
		$logs_sql = "CREATE TABLE $logs_table (
			ID bigint(20) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) NOT NULL,
			ip varchar(45) NOT NULL,
			user_agent text NOT NULL,
			title varchar(255) NOT NULL,
			category varchar(45) NOT NULL,
			description longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (ID)
		) $charset_collate;";
		dbDelta($logs_sql);

		$companies_table = $wpdb->prefix . 'bill_manager_companies';
		$companies_sql = "CREATE TABLE $companies_table (
			ID bigint(20) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) NOT NULL,
			ip varchar(45) NOT NULL,
			user_agent text NOT NULL,

			title varchar(255) NOT NULL,
			address text NOT NULL,
			phone varchar(255) NOT NULL,
			email varchar(255) NOT NULL,

			notes text NULL,
			status tinyint(1) NOT NULL DEFAULT 1,

			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

			PRIMARY KEY  (ID),

			KEY user_id (user_id),
			KEY title (title),
			KEY status (status)

		) $charset_collate;";
		dbDelta($companies_sql);

		$bills_table = $wpdb->prefix . 'bill_manager_bills';
		$bills_sql = "CREATE TABLE $bills_table (
			ID bigint(20) NOT NULL AUTO_INCREMENT,

			user_id bigint(20) NOT NULL,
			ip varchar(45) NOT NULL,
			user_agent text NOT NULL,

			company_id bigint(20) NOT NULL,

			bill_no varchar(50) NOT NULL,
			bill_type enum('purchase','sale') NOT NULL,
			bill_date datetime NOT NULL,

			discount decimal(12,2) NOT NULL DEFAULT 0.00,
			ait decimal(12,2) NOT NULL DEFAULT 0.00,
			tax decimal(12,2) NOT NULL DEFAULT 0.00,
			vat decimal(12,2) NOT NULL DEFAULT 0.00,
			shipping decimal(12,2) NOT NULL DEFAULT 0.00,

			notes text NULL,

			status tinyint(1) NOT NULL DEFAULT 1,

			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
			PRIMARY KEY (ID),

			UNIQUE KEY bill_no (bill_no),

			KEY company_id (company_id),
			KEY bill_type (bill_type),
			KEY bill_date (bill_date),
			KEY user_id (user_id),
			KEY status (status)

		) $charset_collate;";
		dbDelta($bills_sql);

		$bill_items_table = $wpdb->prefix . 'bill_manager_bill_items';
		$bill_items_sql = "CREATE TABLE $bill_items_table (
			ID bigint(20) NOT NULL AUTO_INCREMENT,

			user_id bigint(20) NOT NULL,
			ip varchar(45) NOT NULL,
			user_agent text NOT NULL,

			bill_id bigint(20) unsigned NOT NULL,

			title varchar(255) NOT NULL,
			quantity decimal(12,2) NOT NULL DEFAULT 1.00,
			unit varchar(50) NULL,
			unit_price decimal(12,2) NOT NULL DEFAULT 0.00,

			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

			PRIMARY KEY (ID),

			KEY bill_id (bill_id),
			KEY title (title),
			KEY user_id (user_id)

			/*
			*/
		) $charset_collate;";
		dbDelta($bill_items_sql);
		
		$payments_table = $wpdb->prefix . 'bill_manager_payments';
		$payments_sql = "CREATE TABLE $payments_table (
			ID bigint(20) NOT NULL AUTO_INCREMENT,
			user_id bigint(20) NOT NULL,
			ip varchar(45) NOT NULL,
			user_agent text NOT NULL,

			bill_id bigint(20) unsigned NOT NULL,
			payment_date datetime NOT NULL,
			paid_amount decimal(12,2) NOT NULL,

			reference_no varchar(100) NULL,

			notes text NULL,

			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

			PRIMARY KEY (ID),

			KEY bill_id (bill_id),
			KEY payment_date (payment_date),
			KEY user_id (user_id)
		) $charset_collate;";
		dbDelta($payments_sql);
	}
}


