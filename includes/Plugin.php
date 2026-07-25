<?php

namespace MosPress\BillManager;

defined('ABSPATH') || exit;

use MosPress\BillManager\API\Ajax_API;
use MosPress\BillManager\API\Rest_API;
use MosPress\BillManager\Hook\Action_Hook;
use MosPress\BillManager\Hook\Filter_Hook;
use MosPress\BillManager\Core\Tools;
use MosPress\BillManager\Helpers\Utils;
use MosPress\BillManager\Profile\Profile;
class Plugin {
	public function __construct() {

		$this->define_admin_hooks();
		$this->define_public_hooks();

		Ajax_API::get_instance();
		Rest_API::get_instance();
		Action_Hook::get_instance();
		Filter_Hook::get_instance();
		Profile::get_instance();
		
		// Instantiate additional core classes
		new Utils();
		new Tools();
	}
	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks()
	{
		add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 9999);
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks()
	{
		add_action('wp_enqueue_scripts', [$this, 'wp_enqueue_scripts']);
		// Save settings by ajax
		// add_action('wp_ajax_bill_manager_ajax_callback', [$this, 'bill_manager_ajax_callback']);
		// add_action('wp_ajax_nopriv_bill_manager_ajax_callback', [$this, 'bill_manager_ajax_callback']);
	}
	public function admin_enqueue_scripts()
	{
		wp_enqueue_style('bill-manager-admin-styles', BILL_MANAGER_URL . 'assets/css/admin.css', [], BILL_MANAGER_VERSION);
	}
	public function wp_enqueue_scripts()
	{
		// wp_enqueue_style('bill-manager-public-styles', BILL_MANAGER_URL . 'assets/css/public.css', [], BILL_MANAGER_VERSION);
	}
}
