<?php
namespace MosPress\BillManager\Profile;
if ( ! defined( 'ABSPATH' ) ) exit;
use WP_REST_Server;
use WP_Error;
use WP_REST_Response;
class Profile
{
    private const NAMESPACE = 'bill-manager/v1';
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
		add_action('admin_enqueue_scripts', [$this, 'profile_scripts']);
		// User profile hooks
		add_action('show_user_profile', [self::class, 'display_profile_settings']);
		add_action('edit_user_profile', [self::class, 'display_profile_settings']);

		add_action('personal_options_update', [self::class, 'save_profile_settings']);
		add_action('edit_user_profile_update', [self::class, 'save_profile_settings']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
    }
	public function profile_scripts($hook)
	{
		if ($hook !== 'profile.php' && $hook !== 'user-edit.php') {
			return;
		}
        global $user_id;
		wp_enqueue_script(
			'bill-manager-profile-react',
			BILL_MANAGER_URL . 'build/profile.js',
			[],
			// filemtime($asset_path . 'profile.js'),
			time(),
			true
		);
        $ajax_params = [
            'user_id' => $user_id,
        ];
        wp_localize_script('bill-manager-profile-react', 'bill_manager_profile_obj', $ajax_params);

	}
	public static function display_profile_settings($user) {
        wp_nonce_field( 'bill_manager_profile_action', 'bill_manager_profile_field' );
        // echo  $user->ID; 
        echo '<div id="bill-manager-profile-react-app" class="build-with-bootstrap"></div>';
    }

	// Save 2FA settings when the user profile is updated
	public static function save_profile_settings($user_id)
	{
        // if (  isset( $_POST['bill_manager_profile_field'] ) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['bill_manager_profile_field'])), 'bill_manager_profile_action' ) ) {
	
		if (
			isset($_POST['_wpnonce'])
			&& wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'update-user_' . $user_id)
		) {
            $media_uploader = isset($_POST['media_uploader'])?$_POST['media_uploader']:[];
            update_user_meta($user_id, 'media_uploader', $media_uploader);
		}
	}

    public function rest_api_init()
    {
		register_rest_route(self::NAMESPACE, '/profile/metas/(?P<id>\d+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback' => [$this, 'get_user_meta'],
				// 'permission_callback' => '__return_true',
				'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args' => [
                    //['sanitize_callback' => 'absint', 'default' => 1],
                    // 'id' => [
                    //     'required' => true,
                    //     'type'     => 'string',
                    //     'items'    => [ 'type' => 'integer' ],
                    // ]
                    'id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'absint',
                    ),
                ],
			)
		); 
    }
    public function get_user_meta($request){
		if (!current_user_can('manage_options')) {
			return new WP_Error(
				'rest_update_error',
				'Sorry, you are not allowed to update the DAEXT UI Test options.',
				array('status' => 403)
			);
		}
        $user_id = trim((string) $request->get_param('id'));
        $user = get_user_by( 'id', $user_id );
        if ($user) {
            $media_uploader = get_user_meta($user_id, 'media_uploader', true);
            // $results = get_user_meta( $user_id );
            $results = [
                'media_uploader' => $media_uploader,
            ];

            return new WP_REST_Response(
                array(
                    'success'       => true,
                    'user_id'       => $user_id,
                    'data'          => $results,
                ),
                200
            );
        }

        return new WP_REST_Response(
            array(
                'success'       => false,
                'user_id'       => $user_id,
                'message'          => __('Invalid User ID', 'bill-manager'),
            ),
            200
        );
    }
}