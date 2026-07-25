<?php
namespace MosPress\BillManager\API;
if ( ! defined( 'ABSPATH' ) ) exit;
use Plugin_Upgrader;
use WP_Ajax_Upgrader_Skin;

use MosPress\BillManager\Helpers\CryptoHelper;

class Ajax_API
{
    private static $instance = null;
    public static function get_instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    public function __construct()
	{		
		add_action('wp_ajax_bill_manager_ajax_install_plugins', [$this, 'bill_manager_ajax_install_plugins']);		
		add_action('wp_ajax_bill_manager_ajax_plugins_status', [$this, 'bill_manager_ajax_plugins_status']);
		add_action('init', [$this, 'bill_manager_maybe_flush_rules'], 99);   
		
    }  
	public static function bill_manager_reset_all_settings()
	{
		// wp_send_json_success($_POST['_admin_nonce']);
		if (isset($_POST['_admin_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_admin_nonce'])), 'bill_manager_admin_nonce')) {
			$bill_manager_default_options = bill_manager_get_default_options();

			// wp_send_json_success(['name' => $name]);

			$success = update_option('bill_manager_options', $bill_manager_default_options);

			if ($success) {
				wp_send_json_success(['message' => __('Settings reset successfully.', 'bill-manager')]);
			} else {
				wp_send_json_error(['error_message' => __('Invalid settings path.', 'bill-manager')]);
			}
		} else {
			wp_send_json_error(array('error_message' => esc_html__('Nonce verification failed. Please try again.', 'bill-manager')));
			// wp_die(esc_html__('Nonce verification failed. Please try again.', 'bill-manager'));
		}
		wp_die();
	}
	// public function bill_manager_ajax_install_plugins()
	// {
		

	// 	if (!current_user_can('install_plugins')) {
	// 		wp_send_json_error('Permission denied');
	// 	}
	// 	if (isset($_POST['_admin_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_admin_nonce'])), 'bill_manager_admin_nonce')) {

	// 		// wp_send_json_success('Working');

	// 		$sub_action = isset($_POST['sub_action']) ? sanitize_text_field(wp_unslash($_POST['sub_action'])) : '';
	// 		$plugin_slug = isset($_POST['plugin_slug']) ? sanitize_text_field(wp_unslash($_POST['plugin_slug'])) : '';
	// 		$plugin_file = isset($_POST['plugin_file']) ? sanitize_text_field(wp_unslash($_POST['plugin_file'])) : '';
	// 		$plugin_source = isset($_POST['plugin_source']) ? sanitize_text_field(wp_unslash($_POST['plugin_source'])) : 'internal';


	// 		include_once ABSPATH . 'wp-admin/includes/file.php';
	// 		include_once ABSPATH . 'wp-admin/includes/misc.php';
	// 		include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
	// 		include_once ABSPATH . 'wp-admin/includes/plugin.php';

	// 		if ($sub_action === 'install' || $sub_action === 'install_activate') {
	// 			if ($plugin_source == 'external') {
	// 				$download_url = isset($_POST['download_url']) ? sanitize_url(wp_unslash($_POST['download_url'])) : ''; //'https://github.com/mostak-shahid/mos-woocommerce-protected-categories/archive/refs/heads/main.zip';

	// 				// $upgrader = new Plugin_Upgrader();
	// 				// $installed = $upgrader->install($download_url);
	// 				$upgrader = new Plugin_Upgrader(new WP_Ajax_Upgrader_Skin());
	// 				$installed = $upgrader->install($download_url);


	// 				if (is_wp_error($installed)) {
	// 					wp_send_json_error('Install failed: ' . $installed->get_error_message());
	// 				}

	// 				// GitHub plugin zip will likely extract with this kind of name
	// 				$extracted_dir = WP_PLUGIN_DIR . '/' . $plugin_slug;
	// 				if (is_dir($extracted_dir)) {
	// 					rename($extracted_dir, WP_PLUGIN_DIR . '/' . $plugin_slug);
	// 				}
	// 			} else {

	// 				include_once ABSPATH . 'wp-admin/includes/plugin-install.php';

	// 				$api = plugins_api('plugin_information', ['slug' => $plugin_slug, 'fields' => ['sections' => false]]);
	// 				if (is_wp_error($api)) {
	// 					wp_send_json_error(['message' => 'Plugin info fetch failed']);
	// 				}

	// 				// wp_send_json_success($_POST);
	// 				$upgrader = new Plugin_Upgrader(new WP_Ajax_Upgrader_Skin());
	// 				// wp_send_json_success($upgrader);
	// 				$install_result = $upgrader->install($api->download_link);

	// 				if (is_wp_error($install_result)) {
	// 					wp_send_json_error(['message' => 'Install failed: ' . $install_result->get_error_message()]);
	// 				}
	// 			}

	// 			if ($sub_action === 'install') {
	// 				wp_send_json_success('not_active.');
	// 			}
	// 		}

	// 		if ($sub_action === 'install_activate' || $sub_action === 'activate') {
	// 			$result = activate_plugin(WP_PLUGIN_DIR . '/' . $plugin_file);
	// 			if (is_wp_error($result)) {
	// 				wp_send_json_error('Activation failed: ' . $result->get_error_message());
	// 			} else {
	// 				wp_send_json_success('active.');
	// 			}
	// 		}

	// 		wp_send_json_error(array('error_message' => esc_html__('Unknown action.', 'bill-manager')));
	// 	} else {
	// 		wp_send_json_error(array('error_message' => esc_html__('Nonce verification failed. Please try again.', 'bill-manager')));
	// 		// wp_die(esc_html__('Nonce verification failed. Please try again.', 'bill-manager'));
	// 	}
	// 	wp_die();
	// }
	public static function verify_user_password_ajax() {
		check_ajax_referer('verify_password_nonce', 'nonce');
		
		$password = isset($_POST['password']) ? sanitize_text_field( wp_unslash( $_POST['password'] ) ) : '';
		$user = wp_get_current_user();
		
		// Verify password
		if (wp_check_password($password, $user->user_pass, $user->ID)) {
			wp_send_json_success(array('message' => 'Password verified'));
		} else {
			wp_send_json_error(array('message' => 'Incorrect password. Please try again.'));
		}
	}
	public static function handle_deactivation(){
		if (!function_exists('is_plugin_active')) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		// ?action=bill_manager_deactivate&secret_key=xxxxxx
		$action = isset($_GET['action'])? sanitize_text_field( wp_unslash( $_GET['action'] ) ) : '';
		$secret_key = isset($_GET['secret_key'])? sanitize_text_field( wp_unslash( $_GET['secret_key'] ) ) : '';
		if ($action && $secret_key) {
			// $encrypted_secret_key = CryptoHelper::encrypt( $secret_key );
			$bill_manager_deactive_key = get_option('bill_manager_deactive_key');
			$decrypted_secret_key = CryptoHelper::decrypt($bill_manager_deactive_key);
			// echo $secret_key.'<br/>';
			// // echo $encrypted_secret_key.'<br/>';
			// echo $bill_manager_deactive_key.'<br/>';
			// echo $decrypted_secret_key.'<br/>';
			if ($secret_key == $decrypted_secret_key) {
				$plugins_deactivated = [];

				// Deactivate Pro first
				$pro_plugin = 'bill-manager-pro/bill-manager-pro.php';
				if (is_plugin_active($pro_plugin)) {
					deactivate_plugins($pro_plugin);
					$plugins_deactivated[] = 'Bill Manager Pro';
				}

				// Then Free
				$free_plugin = 'bill-manager/bill-manager.php';
				if (is_plugin_active($free_plugin)) {
					deactivate_plugins($free_plugin);
					$plugins_deactivated[] = 'Bill Manager';
				}

				if (!empty($plugins_deactivated)) {
					wp_die(
						esc_html(
							'The following plugin(s) have been deactivated successfully: '
							. implode(', ', array_map('esc_html', $plugins_deactivated))
						),
						esc_html__('Plugin Deactivated', 'bill-manager'),
						['response' => 200]
					);

				} else {
					wp_die(
						esc_html('Neither Ultimate Security nor Ultimate Security Pro is active.')
					);
				}

			}
			wp_die('Invalid Request.', 'Unauthorized', ['response' => 403]);
		}
		wp_die('Invalid Request.', 'Unauthorized', ['response' => 403]);
	}
}

// new Ajax_API();