<?php

namespace MosPress\BillManager\API;

if (! defined('ABSPATH')) exit;

use MosPress\BillManager\API\LogsController;
use MosPress\BillManager\API\BillsController;
use MosPress\BillManager\Helpers\Utils;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

use MosPress\BillManager\Helpers\CryptoHelper;

/**
 * Rest API Router
 *
 * Registers all REST API endpoints and routes them to appropriate controllers
 */
class Rest_API
{

    private const NAMESPACE = 'bill-manager/v1';
    private static $instance = null;
    /**
     * Table name
     *
     * @var string
     */
    public static function get_instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'rest_api_init']);
    }
    public function rest_api_init()
    {
        // self::register_settings_theme_endpoints();
        $this->register_settings_theme_endpoints();
        $this->register_feedback_endpoints();
        $this->register_options_endpoints();
        $this->register_logs_endpoints();
        $this->register_bills_endpoints();
    }

    /**
     * Register settings theme endpoints
     */
    private function register_settings_theme_endpoints()
    {
        register_rest_route(
            self::NAMESPACE,
            '/set-settings-theme',
            array(
                'methods'  => 'GET',
                'callback' => [$this, 'rest_set_settings_theme'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'id' => [
                        'required' => true,
                        'type'     => 'string',
                        'items'    => ['type' => 'integer'],
                    ],

                    'settings_theme' => [
                        'required' => true,
                        'type'     => 'string',
                        'enum'     => ['light', 'dark'],
                    ],
                ],
            )
        );
        register_rest_route(
            self::NAMESPACE,
            '/get-settings-theme',
            array(
                'methods'  => 'GET',
                'callback' => [$this, 'rest_get_settings_theme'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
    }

    /**
     * Register feedback endpoints
     */
    private function register_feedback_endpoints()
    {
        register_rest_route(
            self::NAMESPACE,
            '/feedback',
            array(
                'methods' => 'POST',
                'callback' => [$this, 'rest_feedback'],
                // 'permission_callback' => '__return_true'
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
    }

    /**
     * Register options endpoints
     */
    private function register_options_endpoints()
    {
        register_rest_route(
            self::NAMESPACE,
            '/options',
            array(
                'methods'  => 'GET',
                'callback' => [$this, 'get_settings'],
                // 'permission_callback' => '__return_true', // Allow public access
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
        register_rest_route(
            self::NAMESPACE,
            '/options',
            array(
                'methods'             => 'POST',
                'callback'            => [$this, 'update_settings'],
                // 'permission_callback' => '__return_true'
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
        register_rest_route(
            self::NAMESPACE,
            '/options/reset-settings',
            array(
                'methods' => 'POST',
                'callback' => [$this, 'reset_settings'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
        register_rest_route(
            self::NAMESPACE,
            '/options/reset-settings-all',
            array(
                'methods' => 'POST',
                'callback' => [$this, 'reset_settings_all'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
        register_rest_route(
            self::NAMESPACE,
            '/options/import-settings',
            [
                'methods' => 'POST',
                'callback' => function ($request) {
                    $data = $request->get_json_params();
                    update_option('bill_manager_options', $data);
                    return rest_ensure_response(['success' => true]);
                },
                // 'permission_callback' => '__return_true',
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/options-details',
            array(
                'methods'  => 'GET',
                'callback' => [$this, 'get_settings_details'],
                // 'permission_callback' => '__return_true', // Allow public access
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            )
        );
    }

    /**
     * Register logs endpoints
     */
    private function register_logs_endpoints()
    {
        // Get logs with filters
        register_rest_route(
            self::NAMESPACE,
            '/logs',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(LogsController::class, 'get_logs'),

                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            )
        );

        // Delete log by ID
        register_rest_route(
            self::NAMESPACE,
            '/logs/(?P<id>\d+)',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array(LogsController::class, 'delete_log'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Bulk Delete Logs
        register_rest_route(
            self::NAMESPACE,
            '/logs/bulk-delete',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array(LogsController::class, 'bulk_delete_logs'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'ids' => array(
                        'required'          => true,
                        'type'     => 'array',
                        'items'    => array('type' => 'integer'),
                    ),
                ),
            )
        );

        // Delete all logs
        register_rest_route(
            self::NAMESPACE,
            '/logs/',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array(LogsController::class, 'delete_all_logs'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );

        // Logs Over Time Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/over-time',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(LogsController::class, 'get_logs_over_time'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );

        // Logs by Category Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/by-category',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(LogsController::class, 'get_logs_by_category'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );

        // Logs by User (Top Users) Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/top-users',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(LogsController::class, 'get_logs_top_users'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );

        // Logs by IP Address (Top IPs) Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/top-ips',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(LogsController::class, 'get_logs_top_ips'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );

        // Hourly Activity Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/hourly-activity',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(LogsController::class, 'get_logs_hourly_activity'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            )
        );
    }
    /**
     * Register logs endpoints
     */
    private function register_bills_endpoints()
    {
        // Create Company
        register_rest_route(
            self::NAMESPACE,
            '/companies',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [BillsController::class, 'create_company'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'title'   => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'address' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'phone'   => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'email'   => array(
                        'required'          => false,
                        'type'              => 'string',
                        'format'            => 'email',
                        'sanitize_callback' => 'sanitize_email',
                    ),
                    'notes' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'status'  => array(
                        'required'          => false,
                        'type'              => 'string',
                        'validate_callback' => function ($param, $request, $key) {
                            return in_array($param, ['1', '0']);
                        }
                    )
                ),
            ]
        );

        // All companies
        register_rest_route(
            self::NAMESPACE,
            '/all-companies',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'all_companies'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ]
        );

        // Get companies with filters
        register_rest_route(
            self::NAMESPACE,
            '/companies',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_companies'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            ]
        );

        // Get companies with filters
        register_rest_route(
            self::NAMESPACE,
            '/companies/with-transactions',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_companies_with_transactions'],
                // 'permission_callback' => function () {
                //     return current_user_can('manage_options');
                // },
                'args' => [
                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            ]
        );

        // Get company by ID
        register_rest_route(
            self::NAMESPACE,
            '/company/(?P<id>\d+)',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_company'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'id' => [
                        'required'          => true,
                        'validate_callback' => function ($param, $request, $key) {
                            return is_numeric($param) && (int) $param > 0;
                        },
                        'sanitize_callback' => 'absint',
                    ],
                ],
            ]
        );

        // Update company
        register_rest_route(
            self::NAMESPACE, 
            '/company/(?P<id>\d+)', 
            [
                'methods'             => WP_REST_Server::EDITABLE, // Identical to 'PUT, PATCH'
                'callback'            => array(BillsController::class, 'update_company'), // Replace with your actual class name
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'id'      => array(
                        'required'          => true,
                        'type'              => 'integer',
                        'validate_callback' => function ($param, $request, $key) {
                            return is_numeric($param);
                        }
                    ),
                    'title'   => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'address' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'phone'   => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'email'   => array(
                        'required'          => false,
                        'type'              => 'string',
                        'format'            => 'email',
                        'sanitize_callback' => 'sanitize_email',
                    ),
                    'status'  => array(
                        'required'          => false,
                        'type'              => 'string',
                        'validate_callback' => function ($param, $request, $key) {
                            return in_array($param, ['1', '0']);
                        }
                    ),
                    'notes' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                ),
            ]
        );

        // Delete company by ID
        register_rest_route(
            self::NAMESPACE,
            '/company/(?P<id>\d+)',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array(BillsController::class, 'delete_company'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );        

        // Bulk Delete companies
        register_rest_route(
            self::NAMESPACE,
            '/companies/bulk-delete',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array(BillsController::class, 'bulk_delete_companies'),
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'ids' => array(
                        'required'          => true,
                        'type'     => 'array',
                        'items'    => array('type' => 'integer'),
                    ),
                ),
            )
        );

        // Get company bills by company ID
        register_rest_route(
            self::NAMESPACE,
            '/company/(?P<id>\d+)/bills',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_company_bills'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    'id' => [
                        'required'          => true,
                        'validate_callback' => function ($param, $request, $key) {
                            return is_numeric($param) && (int) $param > 0;
                        },
                        'sanitize_callback' => 'absint',
                    ],

                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            ]
        );

        // Get company payments by company ID
        register_rest_route(
            self::NAMESPACE,
            '/company/(?P<id>\d+)/payments',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_company_payments'],
                // 'permission_callback' => function () {
                //     return current_user_can('manage_options');
                // },
                'args' => [
                    'id' => [
                        'required'          => true,
                        'validate_callback' => function ($param, $request, $key) {
                            return is_numeric($param) && (int) $param > 0;
                        },
                        'sanitize_callback' => 'absint',
                    ],

                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            ]
        );

        

        // All bills
        register_rest_route(
            self::NAMESPACE,
            '/all-bills',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'all_bills'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ]
        );

        // Create Bill
        register_rest_route(
            self::NAMESPACE,
            '/bill',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [BillsController::class, 'create_bill'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'company_id'   => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),

                    'bill_no'   => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'bill_type' => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'bill_date'   => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'discount' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'ait' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'tax' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'vat' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'shipping' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'status'  => array(
                        'required'          => false,
                        'type'              => 'integer',
                        'validate_callback' => function ($param, $request, $key) {
                            return in_array($param, [1, 0]);
                        }
                    ),
                    'notes'  => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'bill_items'   => array(
                        'required'          => false,
                        'type'              => 'array',
                        'items'             => array(
                            'type' => 'object', // Change to 'string', 'integer' or 'object' if needed
                        ),
                    ),
                ),
            ]
        );

        // Get bills with filters
        register_rest_route(
            self::NAMESPACE,
            '/bills',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array(BillsController::class, 'get_bills'),

                // 'permission_callback' => function () {
                //     return current_user_can('manage_options');
                // },
                'args' => [
                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            )
        );

        // Get bill by ID
        register_rest_route(
            self::NAMESPACE,
            '/bill/(?P<id>\d+)',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_bill'],
                // 'permission_callback' => function () {
                //     return current_user_can('manage_options');
                // },
                'args'                => [
                    'id' => [
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function ( $value ) {
                            return absint( $value ) > 0;
                        },
                    ],
                ],
            ]
        );

        
        // All Payments
        register_rest_route(
            self::NAMESPACE,
            '/all-payments',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'all_payments'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
            ]
        );
        
        // Create Payment
        register_rest_route(
            self::NAMESPACE,
            '/payment',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [BillsController::class, 'create_payment'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => array(
                    'bill_id'   => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),

                    'payment_date'   => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'paid_amount' => array(
                        'required'          => true,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'paid_by' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'reference_no'   => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'notes' => array(
                        'required'          => false,
                        'type'              => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                ),
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/payments',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [BillsController::class, 'get_payments'],
                // 'permission_callback' => function () {
                //     return current_user_can('manage_options');
                // },
            ]
        );
    }
    // callback for settings theme endpoints
    public function rest_set_settings_theme(WP_REST_Request $request)
    {
        $user_id = sanitize_text_field(wp_unslash($request->get_param('id')));
        // $user_id = get_current_user_id();
        $settings_theme = sanitize_text_field(wp_unslash($request->get_param('settings_theme')));
        // get_user_meta($user_id, 'bill_manager_settings_theme', $settings_theme);
        update_user_meta($user_id, 'bill_manager_settings_theme', $settings_theme);

        $response = [
            'success' => true,
            'msg' => esc_html__('Theme set successfully.', 'bill-manager'),
        ];

        return new WP_REST_Response($response, 200);
    }
    public function rest_get_settings_theme(WP_REST_Request $request)
    {
        $user_id = sanitize_text_field(wp_unslash($request->get_param('id')));
        $settings_theme = get_user_meta($user_id, 'bill_manager_settings_theme', true);
        // return $settings_theme??'light';
        return $settings_theme ? $settings_theme : 'light';
    }

    // callback for feedback endpoints	
    public function rest_feedback($request)
    {
        $name = sanitize_text_field(wp_unslash($request->get_param('name')));
        $email = sanitize_email(wp_unslash($request->get_param('email')));
        $phone = sanitize_text_field(wp_unslash($request->get_param('phone')));
        $subject = sanitize_text_field(wp_unslash($request->get_param('subject')));
        $message = sanitize_textarea_field(wp_unslash($request->get_param('message')));

        if (empty($email)) {
            return new WP_Error('empty_email', __('Email cannot be empty.', 'bill-manager'), array('status' => 400));
        }

        if (empty($message)) {
            return new WP_Error('empty_message', __('Message cannot be empty.', 'bill-manager'), array('status' => 400));
        }

        $email = 'mostak.shahid@gmail.com';
        $output = '<strong>Name:</strong> ' . $name;
        $output .= '<br/><strong>Email:</strong> ' . $email;
        $output .= '<br/><strong>Phone:</strong> ' . $phone;
        $output .= '<br/><strong>Subject:</strong> ' . $subject;
        $output .= '<br/><strong>Message:</strong> ' . $message;
        $headers = array(
            'From: ' . get_bloginfo('name') . ' <' . get_option('admin_email') . '>',
            'Content-Type: text/html; charset=UTF-8'
        );

        wp_mail($email, 'Feedback from Bill Manager', $output, $headers);
        $response = [
            'success' => true,
            'msg' => esc_html__('Email Send successfully.', 'bill-manager'),
            'subject' => $subject,
            'message' => $message
        ];
        return new WP_REST_Response($response, 200);
    }

    // callback for options enpoints    
    public function get_settings(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }
        $bill_manager_options = Utils::bill_manager_get_option();
        return new WP_REST_Response($bill_manager_options, 200);
    }
    public function get_settings_details(WP_REST_Request $request)
    {
        $bill_manager_options_details = Utils::bill_manager_get_option_details();
        // $output = $this->flatten_options_details($bill_manager_options_details);

        $search   = $request->get_param('search');
        $per_page = $request->get_param('per_page');

        if (! empty($search)) {
            // 1. Flatten the option details
            $flat_details = $this->flatten_options_details($bill_manager_options_details);

            // // 2. Filter items case-insensitively by title
            // $filtered_details = [];
            // foreach ($flat_details as $item) {
            //     if (isset($item['title']) && stripos($item['title'], $search) !== false) {
            //         $filtered_details[] = $item;
            //     }
            // }

            // 2. Filter items case-insensitively by specified keys
            $filtered_details = [];
            $search_keys = ['title', 'intro', 'hints', 'before', 'after', 'url'];

            foreach ($flat_details as $item) {
                $matched = false;
                foreach ($search_keys as $key) {
                    if (isset($item[$key]) && stripos($item[$key], $search) !== false) {
                        $matched = true;
                        break;
                    }
                }
                if ($matched) {
                    $filtered_details[] = $item;
                }
            }

            // 3. Paginate/Slice the results
            $limit = ! empty($per_page) ? intval($per_page) : 5;
            $bill_manager_options_details = array_slice($filtered_details, 0, $limit);
        }

        return new WP_REST_Response($bill_manager_options_details, 200);
    }
    public function update_settings(WP_REST_Request $request) //WP_REST_Request $request
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update options.' . get_current_user_id(),
                array('status' => 403)
            );
        }
        $bill_manager_options_old = Utils::bill_manager_get_option();

        $bill_manager_options = map_deep(wp_unslash($request->get_param('bill_manager_options')), 'wp_kses_post');

        $bill_manager_options ? update_option('bill_manager_options', $bill_manager_options) : '';

        LogsController::log_settings_change($bill_manager_options_old, $bill_manager_options);

        $response = [
            'success' => true,
            'msg'    => esc_html__('Data successfully added.', 'bill-manager')
        ];
        return new WP_REST_Response($response, 200);
    }
    private function reset_option_by_path(&$options, $defaults, $path)
    {
        $keys = explode('.', $path);
        $target = &$options;
        $default = $defaults;

        foreach ($keys as $key) {
            if (!isset($target[$key]) || !isset($default[$key])) {
                return false; // path not found
            }
            $target = &$target[$key];
            $default = $default[$key];
        }

        // Set the value at the final nested level
        $target = $default;
        return true;
    }
    public function reset_settings(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to reset the settings.',
                array('status' => 403)
            );
        }
        $name = sanitize_text_field(wp_unslash($request->get_param('name')));
        $bill_manager_options_old = Utils::bill_manager_get_option();
        $bill_manager_options = Utils::bill_manager_get_option();
        $bill_manager_default_options = Utils::bill_manager_get_default_options();

        $success = $this->reset_option_by_path($bill_manager_options, $bill_manager_default_options, $name);

        if ($success) {
            update_option('bill_manager_options', $bill_manager_options);
            LogsController::log_settings_change($bill_manager_options_old, $bill_manager_default_options, 'reset');
            wp_send_json_success(['message' => __('Settings reset successfully.', 'bill-manager')]);
        } else {
            wp_send_json_error(['error_message' => __('Invalid settings path.', 'bill-manager')]);
        }

        $response = [
            'success' => true,
            'msg'    => esc_html__('Data successfully added.', 'bill-manager')
        ];

        // return $response;
        return new WP_REST_Response($response, 200);
    }
    public function reset_settings_all(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to reset the settings.',
                array('status' => 403)
            );
        }
        $bill_manager_options_old = Utils::bill_manager_get_option();
        $bill_manager_default_options = Utils::bill_manager_get_default_options();

        update_option('bill_manager_options', $bill_manager_default_options);
        LogsController::log_settings_change($bill_manager_options_old, $bill_manager_default_options, 'reset-all');
        wp_send_json_success(['message' => __('Settings reset successfully.', 'bill-manager')]);

        $response = [
            'success' => true,
            'msg'    => esc_html__('Data successfully added.', 'bill-manager')
        ];

        // return $response;
        return new WP_REST_Response($response, 200);
    }

    /**
     * Recursively flattens nested option details into a single list of items.
     *
     * @param array $options_details Nested option details array.
     * @return array Flattened list of options.
     */
    private function flatten_options_details($options_details)
    {
        $flat = [];
        if (!is_array($options_details)) {
            return $flat;
        }
        foreach ($options_details as $key => $value) {
            if (is_array($value)) {
                if (isset($value['title'])) {
                    $flat[] = $value;
                } else {
                    $flat = array_merge($flat, $this->flatten_options_details($value));
                }
            }
        }
        return $flat;
    }
}
