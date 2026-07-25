<?php

namespace MosPress\BillManager\Core;
if ( ! defined( 'ABSPATH' ) ) exit;
use MosPress\BillManager\API\Ajax_API;
use MosPress\BillManager\Hook\Filter_Hook;
use MosPress\BillManager\Hook\Action_Hook;
use MosPress\BillManager\Core\Deactivator;
use MosPress\BillManager\Helpers\Utils;
class Tools
{
    protected $options;

	public function __construct()
	{
		$this->options = Utils::bill_manager_get_option();
        // error_log($this->options['utilities']['tools']['hide_plugin']);
        if (isset($this->options['utilities']['tools']['hide_plugin']) && $this->options['utilities']['tools']['hide_plugin'] == 1) {
            // Hide plugin from plugins list
            add_filter('all_plugins', [Utils::class,'bill_manager_hide_plugin_from_list']);
        }
        // if (isset($this->options['utilities']['tools]['self_defense']) && $this->options['utilities']['tools]['self_defense'] == 1) {
        //     add_action('admin_footer', [Action_Hook::class, 'bill_manager_deactivation_scripts']);
        //     // AJAX handler to verify password
        //     add_action('wp_ajax_verify_user_password', [Ajax_API::class, 'verify_user_password_ajax']);
        // }

        // // if (isset($this->options['utilities']['tools]['delete_data_on']) && $this->options['utilities']['tools]['delete_data_on'] == 'deactivate') {
        // //     // Cleaning up on Deactive
        // // } else if (isset($this->options['utilities']['tools]['delete_data_on']) && $this->options['utilities']['tools]['delete_data_on'] == 'delete') {
        // //     // Cleaning up on Delete
        // // }

        // add_action('wp_ajax_bill_manager_reset_all_settings', [Ajax_API::class, 'bill_manager_reset_all_settings']);	
        
    }
}