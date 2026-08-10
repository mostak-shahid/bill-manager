<?php
/**
 * WP-CLI Commands
 *
 * @package BillManager
 * @subpackage CLI
 */

namespace MosPress\BillManager\CLI;
use WP_CLI;

/**
 * Class CLI_Command
 *
 * Handles WP-CLI commands for Bill Manager.
 */
class CLI_Command {

    /**
     * Seed the companies table with sample data.
     *
     * ## OPTIONS
     *
     * [--count=<number>]
     * : Number of log entries to create. Default: 10
     *
     * ## EXAMPLES
     *
     *     # Create 10 log entries (default)
     *     wp bill-manager seed_companies
     *
     *     # Create 50 log entries
     *     wp bill-manager seed_companies --count=50
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function seed_companies( $args, $assoc_args ) {
        global $wpdb;

        // Get parameters with defaults
        $count = isset( $assoc_args['count'] ) ? absint( $assoc_args['count'] ) : 10;
        
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$companies_table}'" ) !== $companies_table ) {
            WP_CLI::error( "Table {$companies_table} does not exist. Please activate the plugin first." );
            return;
        }

        WP_CLI::log( "Starting to seed {$count} log entries..." );

        $progress = \WP_CLI\Utils\make_progress_bar( 'Seeding companies', $count );

        $inserted = 0;
        $failed = 0;

        for ( $i = 1; $i <= $count; $i++ ) {
            // Generate random data for each log entry
            $user_id = rand( 1, 10 );
            $ip = $this->generate_random_ip();
            $user_agent = $this->generate_random_user_agent();
            $created_at = $this->generate_random_date($last_days = 90);
            
            $title = $this->generate_lorem_title();
            $address = $this->generate_random_address();
            $phone = $this->generate_random_phone();
            $email = $this->generate_random_email();

            $notes = "Sample notes for company {$title}. This is a randomly generated entry for testing purposes.";
            $status = rand( 0, 1 );

            $insert = $wpdb->insert(
                $companies_table,
                [
                    'user_id'    => $user_id,
                    'ip'         => $ip,
                    'user_agent' => $user_agent,

                    'title'      => $title,
                    'address'    => $address,
                    'phone'      => $phone,
                    'email'      => $email,
                    'notes'      => $notes,
                    'status'     => $status,

                    'created_at' => $created_at,
                    'updated_at' => $created_at,
                ],
                [
                    '%d', // user_id
                    '%s', // ip
                    '%s', // user_agent

                    '%s', // title
                    '%s', // address
                    '%s', // phone
                    '%s', // email
                    '%s', // notes
                    '%d', // status

                    '%s', // created_at
                    '%s', // updated_at
                ]

            );

            if ( $insert ) {
                $inserted++;
            } else {
                $failed++;
                WP_CLI::debug( "Failed to insert log entry #{$i}: " . $wpdb->last_error );
            }

            $progress->tick();
        }

        $progress->finish();

        // Summary
        WP_CLI::success( sprintf(
            'Successfully inserted %d log entries. Failed: %d',
            $inserted,
            $failed
        ) );

        // Show sample of inserted data
        $this->show_sample_companies( 5 );
    }

    /**
     * Seed the logs table with sample data.
     *
     * ## OPTIONS
     *
     * [--count=<number>]
     * : Number of log entries to create. Default: 10
     *
     * ## EXAMPLES
     *
     *     # Create 10 log entries (default)
     *     wp bill-manager seed-logs
     *
     *     # Create 50 log entries
     *     wp bill-manager seed-logs --count=50
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function seed_logs( $args, $assoc_args ) {
        global $wpdb;

        // Get parameters with defaults
        $count = isset( $assoc_args['count'] ) ? absint( $assoc_args['count'] ) : 10;
        
        $table_name = $wpdb->prefix . 'bill_manager_logs';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist. Please activate the plugin first." );
            return;
        }

        WP_CLI::log( "Starting to seed {$count} log entries..." );

        $progress = \WP_CLI\Utils\make_progress_bar( 'Seeding logs', $count );

        $inserted = 0;
        $failed = 0;

        for ( $i = 1; $i <= $count; $i++ ) {
            // Generate random data for each log entry
            $user_id = rand( 1, 10 );
            $ip = $this->generate_random_ip();
            $user_agent = $this->generate_random_user_agent();
            $created_at = $this->generate_random_date($last_days = 10);
            
            $title = $this->generate_lorem_title();
            $description = $this->generate_lorem_description();
            $category = $this->generate_random_category();

            $result = $wpdb->insert(
                $table_name,
                array(
                    'user_id'     => $user_id,
                    'ip'          => $ip,
                    'user_agent'  => $user_agent,
                    'title'       => $title,
                    'category'    => $category,
                    'description' => $description,
                    'created_at'  => $created_at,
                ),
                array(
                    '%d', // user_id
                    '%s', // ip
                    '%s', // user_agent
                    '%s', // title
                    '%s', // description
                    '%s', // data
                    '%s', // created_at
                )
            );

            if ( $result ) {
                $inserted++;
            } else {
                $failed++;
                WP_CLI::debug( "Failed to insert log entry #{$i}: " . $wpdb->last_error );
            }

            $progress->tick();
        }

        $progress->finish();

        // Summary
        WP_CLI::success( sprintf(
            'Successfully inserted %d log entries. Failed: %d',
            $inserted,
            $failed
        ) );

        // Show sample of inserted data
        $this->show_sample_logs( 5 );
    }

    /**
     * Clear all logs from the table.
     *
     * ## OPTIONS
     *
     * [--yes]
     * : Skip confirmation prompt.
     *
     * ## EXAMPLES
     *
     *     # Clear logs with confirmation
     *     wp bill-manager clear-logs
     *
     *     # Clear logs without confirmation
     *     wp bill-manager clear-logs --yes
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function clear_logs( $args, $assoc_args ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'bill_manager_logs';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        // Get count before deletion
        $count = $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" );

        if ( $count == 0 ) {
            WP_CLI::warning( 'No logs found in the table.' );
            return;
        }

        // Confirmation prompt (unless --yes flag is set)
        if ( ! isset( $assoc_args['yes'] ) ) {
            WP_CLI::confirm(
                sprintf( 'Are you sure you want to delete %d log entries?', $count ),
                $assoc_args
            );
        }

        // Delete all rows
        $result = $wpdb->query( "TRUNCATE TABLE {$table_name}" );

        if ( false === $result ) {
            WP_CLI::error( 'Failed to clear logs: ' . $wpdb->last_error );
        } else {
            WP_CLI::success( sprintf( 'Successfully deleted %d log entries.', $count ) );
        }
    }

    /**
     * Show recent logs from the table.
     *
     * ## OPTIONS
     *
     * [--limit=<number>]
     * : Number of logs to display. Default: 10
     *
     * [--format=<format>]
     * : Output format (table, csv, json, yaml). Default: table
     *
     * ## EXAMPLES
     *
     *     # Show 10 recent logs
     *     wp bill-manager show-logs
     *
     *     # Show 20 recent logs in JSON format
     *     wp bill-manager show-logs --limit=20 --format=json
     *
     * @param array $args       Positional arguments.
     * @param array $assoc_args Associative arguments.
     */
    public function show_logs( $args, $assoc_args ) {
        global $wpdb;

        $limit = isset( $assoc_args['limit'] ) ? absint( $assoc_args['limit'] ) : 10;
        $format = isset( $assoc_args['format'] ) ? $assoc_args['format'] : 'table';
        
        $table_name = $wpdb->prefix . 'bill_manager_logs';

        // Check if table exists
        if ( $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" ) !== $table_name ) {
            WP_CLI::error( "Table {$table_name} does not exist." );
            return;
        }

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, user_id, ip, title, LEFT(description, 50) as description, created_at 
                FROM {$table_name} 
                ORDER BY ID DESC 
                LIMIT %d",
                $limit
            ),
            ARRAY_A
        );

        if ( empty( $results ) ) {
            WP_CLI::warning( 'No logs found.' );
            return;
        }

        WP_CLI\Utils\format_items( $format, $results, array( 'ID', 'user_id', 'ip', 'title', 'description', 'created_at' ) );
    }

    /**
     * Generate a random valid IP address (IPv4).
     *
     * @return string
     */
    private function generate_random_ip() {
        // Generate random IPv4 address
        // Avoid special ranges (like 0.x.x.x, 127.x.x.x, 224-255.x.x.x)
        $first_octet = rand( 1, 223 );
        if ( $first_octet == 127 ) {
            $first_octet = 128; // Skip localhost range
        }
        
        return sprintf(
            '%d.%d.%d.%d',
            $first_octet,
            rand( 0, 255 ),
            rand( 0, 255 ),
            rand( 1, 254 )
        );
    }

    /**
     * Generate a random user agent string.
     *
     * @return string
     */
    private function generate_random_user_agent() {
        $user_agents = array(
            // Chrome on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            // Chrome on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            // Firefox on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            // Firefox on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
            // Safari on Mac
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            // Edge on Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
            // Chrome on Linux
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            // Mobile Chrome
            'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
            // Mobile Safari
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        );

        return $user_agents[ array_rand( $user_agents ) ];
    }

    /**
     * Generate a random date within the last 10 days.
     *
     * @return string Date in MySQL format (Y-m-d H:i:s)
     */
    private function generate_random_date($last_days = 10) {
        // Get current timestamp
        $now = current_time( 'timestamp' );
        
        // Calculate $last_days ago in seconds ($last_days days * 24 hours * 60 minutes * 60 seconds)
        $days_ago = $now - ( $last_days * 24 * 60 * 60 );
        
        // Generate random timestamp between $last_days ago and now
        $random_timestamp = rand( $days_ago, $now );
        
        // Convert to MySQL datetime format
        return date( 'Y-m-d H:i:s', $random_timestamp );
    }

    /**
     * Generate a random Lorem Ipsum title.
     *
     * @return string
     */
    private function generate_lorem_title() {
        $titles = array(
            'Lorem ipsum dolor sit amet',
            'Consectetur adipiscing elit',
            'Sed do eiusmod tempor incididunt',
            'Ut labore et dolore magna',
            'Aliqua enim ad minim veniam',
            'Quis nostrud exercitation ullamco',
            'Laboris nisi ut aliquip',
            'Ex ea commodo consequat',
            'Duis aute irure dolor',
            'Reprehenderit in voluptate velit',
            'Esse cillum dolore eu fugiat',
            'Nulla pariatur excepteur sint',
            'Occaecat cupidatat non proident',
            'Sunt in culpa qui officia',
            'Deserunt mollit anim id',
        );
        return $titles[ array_rand( $titles ) ];
    }

    /**
     * Generate a random Lorem Ipsum description.
     *
     * @return string
     */
    private function generate_lorem_description() {
        $descriptions = array(
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
            'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
            'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
            'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
        );
        return $descriptions[ array_rand( $descriptions ) ];
    }

    /**
     * Generate random Lorem Ipsum data (JSON format).
     *
     * @return string
     */
    private function generate_random_category() {
        $categories = array(
            'Lorem ipsum',
            'Consectetur',
            'Sed do eiusmod',
            'Ut labore',
            'Aliqua enim',
            'Quis nostrud',
            'Laboris nisi',
            'Ex ea commodo',
            'Duis aute',
            'Reprehenderit',
            'Esse cillum',
            'Nulla',
            'Occaecat',
            'Sunt in',
            'Deserunt',
        );
        return $categories[ array_rand( $categories ) ];
    }

    /**
     * Display sample of recently inserted logs.
     *
     * @param int $limit Number of logs to show.
     */
    private function show_sample_logs( $limit = 5 ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'bill_manager_logs';
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, title, created_at FROM {$table_name} ORDER BY ID DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );
        if ( ! empty( $results ) ) {
            WP_CLI::log( "\nSample of inserted logs:" );
            WP_CLI\Utils\format_items( 'table', $results, array( 'ID', 'title', 'created_at' ) );
        }
    }

    /**
     * Display sample of recently inserted companies.
     *
     * @param int $limit Number of companies to show.
     */
    private function show_sample_companies( $limit = 5 ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'bill_manager_companies';
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, title, created_at FROM {$table_name} ORDER BY ID DESC LIMIT %d",
                $limit
            ),
            ARRAY_A
        );
        if ( ! empty( $results ) ) {
            WP_CLI::log( "\nSample of inserted companies:" );
            WP_CLI\Utils\format_items( 'table', $results, array( 'ID', 'title', 'created_at' ) );
        }
    }
    /**
     * Generates a random 10-digit phone number in (XXX) XXX-XXXX format.
     */
    private function generate_random_phone(): string {
        $areaCode = rand(200, 999);
        $prefix   = rand(200, 999);
        $lineNum  = rand(1000, 9999);
        
        return "({$areaCode}) {$prefix}-{$lineNum}";
    }

    /**
     * Generates a random email address using common domains.
     */
    private function generate_random_email(): string {
        $names = ['john', 'jane', 'alex', 'taylor', 'morgan', 'sam', 'chris', 'jordan'];
        $domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'example.com'];
        
        $randomName = $names[array_rand($names)] . rand(10, 99);
        $randomDomain = $domains[array_rand($domains)];
        
        return "{$randomName}@{$randomDomain}";
    }

    /**
     * Generates a random US-style street address.
     */
    function generate_random_address(): string {
        $streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Washington Blvd'];
        $cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
        $states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA'];
        
        $houseNumber = rand(100, 9999);
        $streetIndex = array_rand($streets);
        $locationIndex = array_rand($cities); // Keeps city and state aligned for realism
        
        $street = $streets[$streetIndex];
        $city = $cities[$locationIndex];
        $state = $states[$locationIndex];
        $zipCode = rand(10000, 99999);
        
        return "{$houseNumber} {$street}, {$city}, {$state} {$zipCode}";
    }
}