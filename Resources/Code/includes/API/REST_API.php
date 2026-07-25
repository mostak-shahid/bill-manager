<?php
namespace MosPress\BillManager\API;
if ( ! defined( 'ABSPATH' ) ) exit;
use MosPress\BillManager\API\LogsController;
use MosPress\BillManager\Helpers\Utils;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_Query;
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



		


    
        register_rest_route(self::NAMESPACE, '/plugins', [
            'methods' => 'GET',
            'callback' => function () {
                $response = wp_remote_get('https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[author]=mostakshahid&request[per_page]=24');
                if (is_wp_error($response)) {
                    return new WP_Error('api_error', 'Failed to fetch plugins', ['status' => 500]);
                }
                return json_decode(wp_remote_retrieve_body($response), true);
            },
			'permission_callback' => function () {
				return current_user_can('manage_options');
			},
        ]);
        
        // // ✅ Get posts (with embed info)
        // // GET /wp-json/bill-manager/v1/posts?page=1&per_page=10&status=publish&search=hello
        // register_rest_route( self::NAMESPACE, '/posts', [
        //     'methods'  => 'GET',
        //     'callback' => [$this, 'get_posts'],
        //     'permission_callback' => function () {
        //         return current_user_can( 'edit_posts' );
        //     },
        //     'args' => [
        //         'page'     => ['type' => 'integer'],
        //         'per_page' => ['type' => 'integer'],
        //         'status'   => ['type' => 'string'],
        //         'search'   => ['type' => 'string'],
        //         'orderby'  => ['type' => 'string'], // title|date
        //         'order'    => ['type' => 'string'], // asc|desc
        //     ],
        // ]);

        // // ✅ Change status of a single post
        // // POST /wp-json/bill-manager/v1/post/123/status
        // // { "status": "draft" }
        // register_rest_route( self::NAMESPACE, '/post/(?P<id>\d+)/status', [
        //     'methods'  => 'POST',
        //     'callback' => [$this, 'change_post_status'],
        //     'permission_callback' => function () {
        //         return current_user_can( 'edit_posts' );
        //     },
        //     'args' => [
        //         'status' => [
        //             'required' => true,
        //             'type'     => 'string',
        //             'enum'     => [ 'publish', 'draft', 'trash' ],
        //         ],
        //     ],
        // ]);

        // // ✅ Bulk status change
        // // POST /wp-json/bill-manager/v1/posts/status
        // // { "ids": [1,2,3], "status": "trash" }

        // register_rest_route( self::NAMESPACE, '/posts/status', [
        //     'methods'  => 'POST',
        //     'callback' => [$this, 'bulk_change_status'],
        //     'permission_callback' => function () {
        //         return current_user_can( 'edit_posts' );
        //     },
        //     'args' => [
        //         'ids' => [
        //             'required' => true,
        //             'type'     => 'array',
        //             'items'    => [ 'type' => 'integer' ],
        //         ],
        //         'status' => [
        //             'required' => true,
        //             'type'     => 'string',
        //             'enum'     => [ 'publish', 'draft', 'trash' ],
        //         ],
        //     ],
        // ]);

        
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

		//Add the POST 'bill-manager/v1/options' endpoint to the Rest API
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
            '/options/import-settings', [
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
            '/deactivation-link',
            array(
                'methods' => 'GET',
                'callback' => array( $this, 'get_deactivation_link' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        //Log table REST routes
        /**
         * Register REST API routes
         */
        // Get logs with filters
        register_rest_route(
            self::NAMESPACE,
            '/logs',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_logs' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args' => [
                    'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                    'per_page' => ['sanitize_callback' => 'absint', 'default' => 5],
                    'search' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_field' => ['sanitize_callback' => 'sanitize_text_field'],
                    'sort_order' => ['sanitize_callback' => 'sanitize_text_field'],
                    'filter' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_from' => ['sanitize_callback' => 'sanitize_text_field'],
                    'date_to' => ['sanitize_callback' => 'sanitize_text_field'],
                ],
            )
        );

        // Search logs
        register_rest_route(
            self::NAMESPACE,
            '/logs/search',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'search_logs' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'q'        => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'page'     => array(
                        'default'           => 1,
                        'sanitize_callback' => 'absint',
                    ),
                    'per_page' => array(
                        'default'           => 10,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Insert new log
        register_rest_route(
            self::NAMESPACE,
            '/logs',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( LogsController::class, 'create_log' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'user_id'     => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                    'ip'          => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'user_agent'  => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'title'       => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'description' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'data'        => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                ),
            )
        );

        // Update log by ID
        register_rest_route(
            self::NAMESPACE,
            '/logs/(?P<id>\d+)',
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( LogsController::class, 'update_log' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'id'          => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                    'user_id'     => array(
                        'sanitize_callback' => 'absint',
                    ),
                    'ip'          => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'user_agent'  => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'title'       => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'description' => array(
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'data'        => array(
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                ),
            )
        );

        // Delete log by ID
        register_rest_route(
            self::NAMESPACE,
            '/logs/(?P<id>\d+)',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( LogsController::class, 'delete_log' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Delete all logs
        register_rest_route(
            self::NAMESPACE,
            '/logs/delete-all',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( LogsController::class, 'delete_all_logs' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        // Get single log by ID
        register_rest_route(
            self::NAMESPACE,
            '/logs/(?P<id>\d+)',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_log' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ),
            )
        );

        // Logs Over Time Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/over-time',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_logs_over_time' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        // Logs by Category Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/by-category',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_logs_by_category' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        // Logs by User (Top Users) Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/top-users',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_logs_top_users' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        // Logs by IP Address (Top IPs) Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/top-ips',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_logs_top_ips' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        // Hourly Activity Chart
        register_rest_route(
            self::NAMESPACE,
            '/logs/stats/hourly-activity',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( LogsController::class, 'get_logs_hourly_activity' ),
                'permission_callback' => array( $this, 'check_permission' ),
            )
        );

        // Bulk Delete Logs
        register_rest_route(
            self::NAMESPACE,
            '/logs/bulk-delete',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( LogsController::class, 'bulk_delete_logs' ),
                'permission_callback' => array( $this, 'check_permission' ),
                'args'                => array(
                    'ids' => array(
                        'required'          => true,
                        'type'     => 'array',
                        'items'    => array( 'type' => 'integer' ),
                    ),
                ),
            )
        );
    }

    /**
     * Register settings theme endpoints
     */
    private function register_settings_theme_endpoints()
    {
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
                        'items'    => [ 'type' => 'integer' ],
                    ],
                    
                    'settings_theme' => [
                        'required' => true,
                        'type'     => 'string',
                        'enum'     => [ 'light', 'dark' ],
                    ],
                ],
			)
		);  
    }
    // callback for settings theme endpoints
    public function rest_set_settings_theme(WP_REST_Request $request)
    {
        $user_id = sanitize_text_field(wp_unslash($request->get_param('id')));
        // $user_id = get_current_user_id();
        $settings_theme = sanitize_text_field(wp_unslash($request->get_param('settings_theme')));
        // get_user_meta($user_id, 'bill_manager_settings_theme', $settings_theme);
        update_user_meta( $user_id, 'bill_manager_settings_theme', $settings_theme );
                
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
        return $settings_theme?$settings_theme:'light';
    }


    /**
     * Register feedback endpoints
     */
    private function register_feedback_endpoints(){
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
    // callback for settings theme endpoints	
    public static function rest_feedback($request)
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

    /**
     * Check permission for API access
     *
     * @param WP_REST_Request $request Request object.
     * @return bool
     */
    // public function check_permission( $request ) {
    //     // Change this based on your requirements
    //     // For development, you might want to allow all users
    //     // For production, restrict to specific capabilities
    //     return current_user_can( 'manage_options' );
    // }
    /**
     * Check if user has permission to access the endpoint.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|WP_Error True if user has permission, WP_Error otherwise.
     */
    public function check_permission( WP_REST_Request $request ) {

        // Check if user has capability to manage options (typically administrators)
        if ( ! current_user_can( 'manage_options' ) ) {
            return new WP_Error(
                'rest_forbidden',
                __( 'You do not have permission to access this endpoint.', 'bill-manager' ),
                array( 'status' => 403 )
            );
        }

        return true;
    }
    
    // /**
    //  * Return posts for DataTables (server-side).
    //  */
    // public function get_posts( WP_REST_Request $request ) {
    //     $page     = max( 1, intval( $request->get_param('page') ?: 1 ) );
    //     $per_page = max( 1, intval( $request->get_param('per_page') ?: 10 ) );
    //     $status   = sanitize_text_field( $request->get_param('status') ?: 'publish' );
    //     $search   = sanitize_text_field( $request->get_param('search') ?: '' );

    //     // Sorting
    //     $orderby_param = strtolower( sanitize_text_field( $request->get_param('orderby') ?: '' ) );
    //     $order_param   = strtoupper( sanitize_text_field( $request->get_param('order') ?: 'ASC' ) );
    //     $allowed_orderby = [
    //         'title' => 'title',
    //         'date'  => 'date',
    //         'id'    => 'ID',
    //     ];
    //     $orderby = isset( $allowed_orderby[ $orderby_param ] ) ? $allowed_orderby[ $orderby_param ] : 'date';
    //     $order   = in_array( $order_param, [ 'ASC', 'DESC' ], true ) ? $order_param : 'DESC';

    //     $args = [
    //         'post_type'      => 'post',
    //         'post_status'    => $status, // publish|draft|trash|etc
    //         'posts_per_page' => $per_page,
    //         'paged'          => $page,
    //         'orderby'        => $orderby,
    //         'order'          => $order,
    //         's'              => $search,
    //         'no_found_rows'  => false, // we need totals for DataTables
    //     ];

    //     $query = new WP_Query( $args );

    //     $rows = [];
    //     foreach ( $query->posts as $post ) {
    //         $author_id  = $post->post_author;
    //         $categories = wp_get_post_terms( $post->ID, 'category', [ 'fields' => 'names' ] );
    //         $tags       = wp_get_post_terms( $post->ID, 'post_tag', [ 'fields' => 'names' ] );

    //         $rows[] = [
    //             'id'    => $post->ID,
    //             'title' => get_the_title( $post ),
    //             'date'  => get_the_date( '', $post ),
    //             'author'=> [
    //                 'id'     => $author_id,
    //                 'name'   => get_the_author_meta( 'display_name', $author_id ),
    //                 'avatar' => get_avatar_url( $author_id, [ 'size' => 24 ] ),
    //             ],
    //             'categories' => $categories ?: [],
    //             'tags'       => $tags ?: [],
    //             'status'       => get_post_status($post),
    //         ];
    //     }

    //     return [
    //         'data'  => $rows,
    //         'total' => (int) $query->found_posts,
    //         'page'  => (int) $page,
    //     ];
    // }

    // /**
    //  * Change status for a single post.
    //  */
    // public function change_post_status( WP_REST_Request $request ) {
    //     $post_id = (int) $request['id'];
    //     $status  = sanitize_text_field( $request['status'] );

    //     $updated = wp_update_post([
    //         'ID'          => $post_id,
    //         'post_status' => $status,
    //     ], true );

    //     if ( is_wp_error( $updated ) ) {
    //         return new WP_Error( 'update_failed', __( 'Failed to update post status', 'bill-manager' ), [ 'status' => 500 ] );
    //     }

    //     return [ 'success' => true, 'post_id' => $post_id, 'status' => $status ];
    // }

    // /**
    //  * Bulk change status of posts.
    //  */
    // public function bulk_change_status( WP_REST_Request $request ) {
    //     $ids    = $request['ids'];
    //     $status = sanitize_text_field( $request['status'] );

    //     $updated = [];
    //     foreach ( $ids as $id ) {
    //         $result = wp_update_post([
    //             'ID'          => (int) $id,
    //             'post_status' => $status,
    //         ], true );

    //         if ( ! is_wp_error( $result ) ) {
    //             $updated[] = (int) $id;
    //         }
    //     }

    //     return [ 'success' => true, 'updated' => $updated, 'status' => $status ];
    // }
    
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
	public function update_settings(WP_REST_Request $request) //WP_REST_Request $request
	{
		if (!current_user_can('manage_options')) {
			return new WP_Error(
				'rest_update_error',
				'Sorry, you are not allowed to update options.'.get_current_user_id(),
				array('status' => 403)
			);
		}
		$bill_manager_options_old = Utils::bill_manager_get_option();

		$bill_manager_options = map_deep(wp_unslash($request->get_param('bill_manager_options')), 'wp_kses_post');

		$bill_manager_options ? update_option('bill_manager_options', $bill_manager_options) : '';

		LogsController::log_settings_change($bill_manager_options_old, $bill_manager_options);

		$response = [
			'success' => true,
			'msg'	=> esc_html__('Data successfully added.', 'bill-manager')
		];

		// return $response;
		return new WP_REST_Response($response, 200);

		/*

		return new WP_REST_Response([
			'success' => true,
			'message' => 'Plugin installed successfully.'
		], 200);


		return new WP_REST_Response([
			'success' => false,
			'message' => 'Installed plugin could not be identified'
		], 404);
		*/
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
            LogsController::log_settings_reset($name, $bill_manager_options_old[$name] ?? null, $bill_manager_options[$name] ?? null);
            wp_send_json_success(['message' => __('Settings reset successfully.', 'bill-manager')]);
        } else {
            wp_send_json_error(['error_message' => __('Invalid settings path.', 'bill-manager')]);
        }

		$response = [
			'success' => true,
			'msg'	=> esc_html__('Data successfully added.', 'bill-manager')
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
        $bill_manager_default_options = Utils::bill_manager_get_default_options();

        update_option('bill_manager_options', $bill_manager_default_options);
        // $this->log_settings_reset($name, $bill_manager_options_old[$name] ?? null, $bill_manager_options[$name] ?? null);
        wp_send_json_success(['message' => __('Settings reset successfully.', 'bill-manager')]);

		$response = [
			'success' => true,
			'msg'	=> esc_html__('Data successfully added.', 'bill-manager')
		];

		// return $response;
		return new WP_REST_Response($response, 200);
	}
    /**
     * Get the deactivation link.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response|WP_Error The response or error.
     */
    public function get_deactivation_link( WP_REST_Request $request ) {
        // Get the encrypted key from options
        $encrypted_key = get_option( 'bill_manager_deactive_key' );

        if ( false === $encrypted_key ) {
            return new WP_Error(
                'key_not_found',
                __( 'Deactivation key not found. Please reactivate the plugin.', 'bill-manager' ),
                array( 'status' => 404 )
            );
        }

        // Decrypt the key
        $decrypted_key = CryptoHelper::decrypt( $encrypted_key );

        if ( false === $decrypted_key ) {
            return new WP_Error(
                'decryption_failed',
                __( 'Failed to decrypt deactivation key. Please contact support.', 'bill-manager' ),
                array( 'status' => 500 )
            );
        }

        // Build the deactivation URL
        $deactivation_url = add_query_arg(
            array(
                'action' => 'bill_manager_deactivate',
                'secret_key' => $decrypted_key,
            ),
            admin_url( 'admin-post.php' )
        );

        // Return the response
        return new WP_REST_Response(
            array(
                'success' => true,
                'deactivation_url' => $deactivation_url,
                'message' => __( 'Deactivation link generated successfully.', 'bill-manager' ),
                'warning' => __( 'This link will only work once. After deactivation, a new link will be generated on reactivation.', 'bill-manager' ),
            ),
            200
        );
    }

}
// new Rest_Api();