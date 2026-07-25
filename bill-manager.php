<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://mostak-shahid.github.io/
 * @since             1.0.0
 * @package           BillManager\
 *
 * @wordpress-plugin
 * Plugin Name:       Bill Manager
 * Plugin URI:        https://mostak-shahid.github.io/plugins/bill-manager.html
 * Description:       A modern WordPress Bill Manager plugin.
 * Version:           1.0.0
 * Author:            Md. Mostak Shahid
 * Author URI:        https://mostak-shahid.github.io/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       bill-manager
 * Domain Path:       /languages
 */

defined('ABSPATH') || exit;

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define('BILL_MANAGER_VERSION', '1.0.0');
define('BILL_MANAGER_NAME', 'Bill Manager');
define('BILL_MANAGER_PATH', plugin_dir_path(__FILE__));
define('BILL_MANAGER_URL', plugin_dir_url(__FILE__));
define('BILL_MANAGER_MAIN_FILE', __FILE__);

/**
 * The core class that is used to define internationalization, 
 * caching, and others.
 */
if (file_exists(BILL_MANAGER_PATH . '/vendor/autoload.php')) {
    require_once BILL_MANAGER_PATH . '/vendor/autoload.php';
}
/**
 * The code that runs during plugin activation.
 * This action is documented in src/Core/Activator.php
 */
function bill_manager_activate()
{
	\MosPress\BillManager\Core\Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in src/Core/Deactivator.php
 */
function bill_manager_deactivate()
{
	\MosPress\BillManager\Core\Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'bill_manager_activate');
register_deactivation_hook(__FILE__, 'bill_manager_deactivate');

/**
 * Register WP-CLI commands only if file exists
 */
if ( defined( 'WP_CLI' ) && WP_CLI && file_exists( plugin_dir_path( __FILE__ ) . 'includes/CLI/CLI_Command.php' ) ) {
    $cli_file = plugin_dir_path( __FILE__ ) . 'includes/CLI/CLI_Command.php';

    if ( file_exists( $cli_file ) ) {
        WP_CLI::add_command( 'bill-manager', 'MosPress\BillManager\CLI\CLI_Command' );
    }
}


function run_bill_manager() {
    new \MosPress\BillManager\Plugin();
}
add_action('plugins_loaded', 'run_bill_manager');
