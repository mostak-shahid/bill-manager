<?php
namespace MosPress\BillManager\Hook;

if ( ! defined( 'ABSPATH' ) ) exit;
use MosPress\BillManager\Helpers\Utils;

class Filter_Hook {

    private $plugin_slug;      // bill-manager
    private $plugin_basename;  // bill-manager/bill-manager.php
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {

        // Automatically detect plugin slug + basename
        $this->plugin_basename = plugin_basename( BILL_MANAGER_MAIN_FILE ); 
        $this->plugin_slug     = dirname( $this->plugin_basename );

        /**
         * Now supports:
         * plugin_action_links_bill-manager/bill-manager.php
         * WITHOUT hard-coding strings.
         */
        add_filter(
            "plugin_action_links_{$this->plugin_basename}",
            [ $this, 'bill_manager_add_action_links' ]
        );

        add_filter('admin_body_class', [ $this, 'bill_manager_admin_body_class' ]);

        add_filter('bill_manager_default_options_modify', [ $this, 'modify_bill_manager_default_options' ]);
        add_filter('bill_manager_default_options_details_modify', [ $this, 'modify_bill_manager_default_options_details' ]);
        add_filter('bill_manager_default_colors_modify', [ $this, 'modify_bill_manager_default_colors' ]);
        add_filter('bill_manager_default_gradients_modify', [ $this, 'modify_bill_manager_default_gradients' ]);
        add_filter('bill_manager_default_tables_modify', [ $this, 'modify_bill_manager_default_tables' ]);

        /**
         * Allow PRO add-ons or Module Federation remotes to inject links dynamically
         */
        add_filter('bill_manager_action_links_extra', '__return_empty_array');

        

    }

    /**
     * Add Settings link + dynamic injected links
     */
    public function bill_manager_add_action_links( $links ) {

        $default_links = [
            '<a href="' . admin_url("admin.php?page={$this->plugin_slug}") . '">' .
                esc_html__('Settings', 'bill-manager') .
            '</a>',
            '<a href="https://mostak-shahid.github.io/plugins/bill-manager.html" target="_blank">' .
                esc_html__('Docs', 'bill-manager') .
            '</a>',
            '<a href="https://www.facebook.com/mospressbd" target="_blank">' .
                esc_html__('Community', 'bill-manager') .
            '</a>',
        ];

        /**
         * Dynamic links injected from PRO plugin or remote MF
         * Example:
         * add_filter( 'bill_manager_action_links_extra', function($links) {
         *     $links[] = '<a href="https://example.com/pro">Go Pro</a>';
         *     return $links;
         * });
         */
        $extra_links = apply_filters('bill_manager_action_links_extra', []);

        return array_merge( $default_links, $extra_links, $links );
    }

    /**
     * Add body classes on plugin pages
     */
    public function bill_manager_admin_body_class( $classes ) {
        if (Utils::bill_manager_is_plugin_page()) {
            $classes .= ' ' . sanitize_html_class( $this->plugin_slug . '-settings-template' ) . ' ';
        }
        return $classes;
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_bill_manager_default_options( $opts ) {
        $defaults = [
            'inputs' => [
                'basic_inputs' => [
                    'text' => '',
                    'textarea' => '',
                    'radio' => 'radio-1',
                    'select' => 'select-2',
                    'number' => '10',
                    'range' => '100',
                    'color' => '#ff0000',
                    'checkbox' => 0,
                    'switch' => 1,
                    'date' => '',
                    'time' => '',
                    'datetime' => '',
                ],
                'array_inputs' => [
                    'checkbox' => ['checkbox-1', 'checkbox-3']
                ],
                'complex_inputs' => [
                    'multiselect' => [],
                    'multiselectposts' => [],
                    'multiselectpost' => [],
                    'media' => [],
                    'repeater' => [],
                    'sortableaccordion' => [],
                    'imageselector' => '10',
                    'colorpicker' => '#ffffff',
                    'background' => [
                        'color' => '#ffffff',
                        'image' => [
                            'id' => '9',
                            'url' => 'http://localhost:10003/wp-content/uploads/2026/04/people-surfing-coasts-varkala-near-trivandrum-scaled.jpg',
                        ],
                        'position' => "left center",
                        'size' => "cover",
                        'repeat' => "no-repeat",
                        'origin' => "border-box",
                        'clip' => "content-box",
                        'attachment' => "scroll"
                    ],
                ],

            ],
            'utilities' => [
                'tools' => [
                    'hide_plugin' => 0, // delete, uninstall, none
                    // 'self_defense' => false, // delete, uninstall, none
                    // 'delete_data_on' => 'none', // delete, uninstall, none
                ],
            ]
        ];
        return wp_parse_args( $opts, $defaults );
    }
    /**
     * Default options details filter (still dynamic)
     */
    public function modify_bill_manager_default_options_details( $opts ) {
        $defaults = [
            'inputs' => [
                'basic_inputs' => [
                    'text' => [
                        'title' => __('Text Input', 'bill-manager'),
                        'intro' => __('This is a intro for Text Input', 'bill-manager'),
                        'hint' => __('This is a hints for Text Input', 'bill-manager'),
                        'before' => __('This is a before text for Text Input', 'bill-manager'),
                        'after' => __('This is a after text for Text Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'textarea' => [
                        'title' => __('Textarea Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'radio' => [
                        'title' => __('Radio Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'select' => [
                        'title' => __('Select Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'number' => [
                        'title' => __('Number Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'range' => [
                        'title' => __('Range Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'color' => [
                        'title' => __('Color Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'checkbox' => [
                        'title' => __('Checkbox Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'switch' => [
                        'title' => __('Switch Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'date' => [
                        'title' => __('Date Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'time' => [
                        'title' => __('Time Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                    'datetime' => [
                        'title' => __('Datetime Input', 'bill-manager'),
                        'url' => '/settings/inputs/basic_inputs',
                    ],
                ],
                'array_inputs' => [
                    'checkbox' => [
                        'title' => __('Checkbox Input', 'bill-manager'),
                        'url' => '/settings/inputs/array_inputs',
                    ],
                ],
                'complex_inputs' => [
                    'multiselect' => [
                        'title' => __('Multiselect Input', 'bill-manager'),
                        'url' => '/settings/inputs/complex_inputs',
                    ],
                    'media' => [
                        'title' => __('Media Input', 'bill-manager'),
                        'url' => '/settings/inputs/complex_inputs',
                    ],
                    'repeater' => [
                        'title' => __('Repeater Input', 'bill-manager'),
                        'url' => '/settings/inputs/complex_inputs',
                    ],
                    'sortableaccordion' => [
                        'title' => __('Sortable Accordion Input', 'bill-manager'),
                        'url' => '/settings/inputs/complex_inputs',
                    ],
                ],

            ],
            'utilities' => [
                'tools' => [
                    'hide_plugin' => [
                        'title' => __('Hide Plugin', 'bill-manager'),
                        'intro' => __('Hide this plugin from plugin list.', 'bill-manager'),
                        'url' => '/settings/utilities/tools',
                    ],
                    // 'self_defense' => false, // delete, uninstall, none
                    // 'delete_data_on' => 'none', // delete, uninstall, none
                ],
            ],
            'feedback' => [
                'title' => __('Feedback', 'bill-manager'),
                'intro' => __('Share feedback, report issues, or suggest improvements.', 'bill-manager'),
                'url' => '/feedback',

            ]
        ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_bill_manager_default_colors( $opts ) {
        $defaults = [
            ['name' => esc_html__('Black', 'bill-manager'), 'color' => '#000000'],
            ['name' => esc_html__('Blue', 'bill-manager'), 'color' => '#0073AA'],
            ['name' => esc_html__('Cyan', 'bill-manager'), 'color' => '#00A0D2'],
            ['name' => esc_html__('Deep Blue', 'bill-manager'), 'color' => '#005075'],
            ['name' => esc_html__('Deep Purple', 'bill-manager'), 'color' => '#23036A'],
            ['name' => esc_html__('Gold', 'bill-manager'), 'color' => '#FFB900'],
            ['name' => esc_html__('Gray', 'bill-manager'), 'color' => '#888888'],
            ['name' => esc_html__('Green', 'bill-manager'), 'color' => '#008000'],
            ['name' => esc_html__('Light Gray', 'bill-manager'), 'color' => '#E6E6E6'],
            ['name' => esc_html__('Lime Green', 'bill-manager'), 'color' => '#82C91E'],
            ['name' => esc_html__('Navy Blue', 'bill-manager'), 'color' => '#001F3F'],
            ['name' => esc_html__('Orange', 'bill-manager'), 'color' => '#FF6600'],
            ['name' => esc_html__('Pink', 'bill-manager'), 'color' => '#FF4081'],
            ['name' => esc_html__('Purple', 'bill-manager'), 'color' => '#800080'],
            ['name' => esc_html__('Red', 'bill-manager'), 'color' => '#FF0000'],
            ['name' => esc_html__('Silver', 'bill-manager'), 'color' => '#C0C0C0'],
            ['name' => esc_html__('White', 'bill-manager'), 'color' => '#FFFFFF'],
            ['name' => esc_html__('Yellow', 'bill-manager'), 'color' => '#FFFF00'],
        ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_bill_manager_default_gradients( $opts ) {
        $defaults = [
            ['name' => esc_html__('Blue to Purple', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #0064fa 0%, #800080 100%)'],
            ['name' => esc_html__('Pink to Orange', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #ff4081 0%, #ff6600 100%)'],
            ['name' => esc_html__('Cyan to Blue', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #00a0d2 0%, #0073aa 100%)'],
            ['name' => esc_html__('Lime Green to Green', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #82c91e 0%, #008000 100%)'],
            ['name' => esc_html__('Gold to Orange', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #ffb900 0%, #ff6600 100%)'],
            ['name' => esc_html__('Red to Deep Purple', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #ff0000 0%, #23036a 100%)'],
            ['name' => esc_html__('Yellow to Lime Green', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #ffff00 0%, #82c91e 100%)'],
            ['name' => esc_html__('Silver to Gray', 'bill-manager'), 'gradient' => 'linear-gradient(135deg, #c0c0c0 0%, #888888 100%)'],
	    ];
        return wp_parse_args( $opts, $defaults );
    }

    /**
     * Default options filter (still dynamic)
     */
    public function modify_bill_manager_default_tables( $opts ) {
        $defaults = [
            ['bill_manager_logs'],
	    ];
        return wp_parse_args( $opts, $defaults );
    }
}