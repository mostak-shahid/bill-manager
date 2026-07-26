<?php

namespace MosPress\BillManager\API;

use MosPress\BillManager\Helpers\Utils;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_Query;
use WP_REST_Server;

class LogsController
{

    private $logs_table_name;
    public function __construct()
    {
        global $wpdb;
        $this->logs_table_name = $wpdb->prefix . 'bill_manager_logs';
    }

    public static function log_settings_change($old_data, $new_data, $category = 'change')
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        // Retrieve setting details (title, url)
        $details = Utils::bill_manager_get_option_details();
        $changes = self::get_changes_recursive($old_data, $new_data, $details);
        // error_log(print_r($changes), true);
        if (empty($changes)) {
            return;
        }

        $user_id = get_current_user_id();
        $ip = Utils::get_client_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';

        $wpdb->insert(
            $logs_table_name,
            [
                'user_id'     => $user_id,
                'ip'          => $ip,
                'user_agent'  => $user_agent,
                'title'       => count($changes) . ' setting(s) changed',
                'category'    => match ($category) {
                    'reset'     => __('Reset Change', 'bill-manager'),
                    'reset-all' => __('Reset All', 'bill-manager'),
                    default     => __('Settings Change', 'bill-manager'),
                },
                // 'description' => count($changes) . ' setting(s) changed',
                'description' => json_encode($changes), // Save structured changes JSON
                'created_at'  => current_time('mysql'),
                'updated_at'  => current_time('mysql')
            ],
            ['%d', '%s', '%s', '%s', '%s', '%s', '%s']
        );
    }

    /**
     * Get logs with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_logs($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $page     = max(1, (int) $request->get_param('page'));
        $per_page = max(1, (int) $request->get_param('per_page'));
        $search   = trim((string) $request->get_param('search'));
        $filter    = $request->get_param('filter');

        $date_from = $request->get_param('date_from');
        $date_to   = $request->get_param('date_to');

        $orderby = $request->get_param('sort_field');
        $order   = strtoupper($request->get_param('sort_order')) == 'ASC' ? 'ASC' : 'DESC';

        // Allowed order by columns
        $allowed_orderby = array('ID', 'user_id', 'ip', 'title', 'created_at', 'updated_at');
        if (! in_array($orderby, $allowed_orderby, true)) {
            $orderby = 'ID';
        }

        $offset = ($page - 1) * $per_page;

        $join            = '';
        $where_clauses   = array('1=1');
        $search_clauses  = array();

        /**
         * Search logic
         */
        if ($search !== '') {
            $join = "LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID";

            $like = '%' . $wpdb->esc_like($search) . '%';

            $search_clauses[] = $wpdb->prepare('u.display_name LIKE %s', $like);
            $search_clauses[] = $wpdb->prepare('l.ip LIKE %s', $like);
            $search_clauses[] = $wpdb->prepare('l.title LIKE %s', $like);

            // Date search only if valid YYYY-MM-DD
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $search)) {
                $search_clauses[] = $wpdb->prepare('DATE(l.created_at) = %s', $search);
            }
        }

        if (! empty($search_clauses)) {
            $where_clauses[] = '(' . implode(' OR ', $search_clauses) . ')';
        }

        /**
         * Time-based filter (today, week, month)
         */
        if (! empty($filter) && $filter !== 'any') {
            $current_date = gmdate('Y-m-d');
            switch ($filter) {
                case 'today':
                    $where_clauses[] = $wpdb->prepare('DATE(l.created_at) = %s', $current_date);
                    break;
                case 'week':
                    $week_start = gmdate('Y-m-d', strtotime('this week monday'));
                    $where_clauses[] = $wpdb->prepare('DATE(l.created_at) >= %s', $week_start);
                    break;
                case 'month':
                    $month_start = gmdate('Y-m-01');
                    $where_clauses[] = $wpdb->prepare('DATE(l.created_at) >= %s', $month_start);
                    break;
            }
        }

        /**
         * Date range filter
         */
        if (! empty($date_from)) {
            $where_clauses[] = $wpdb->prepare('DATE(l.created_at) >= %s', sanitize_text_field($date_from));
        }

        if (! empty($date_to)) {
            $where_clauses[] = $wpdb->prepare('DATE(l.created_at) <= %s', sanitize_text_field($date_to));
        }

        /**
         * Build prepared where clause with placeholders
         */
        $prepared_where = '1=1';
        $where_params = array();

        if ($search !== '') {
            $join = "LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID";
            $like = '%' . $wpdb->esc_like($search) . '%';
            $prepared_where .= " AND (u.display_name LIKE %s OR l.ip LIKE %s OR l.title LIKE %s";
            $where_params[] = $like;
            $where_params[] = $like;
            $where_params[] = $like;

            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $search)) {
                $prepared_where .= " OR DATE(l.created_at) = %s";
                $where_params[] = $search;
            }
            $prepared_where .= ')';
        }

        if (! empty($filter) && $filter !== 'any') {
            $current_date = gmdate('Y-m-d');
            if ($filter === 'today') {
                $prepared_where .= " AND DATE(l.created_at) = %s";
                $where_params[] = $current_date;
            } elseif ($filter === 'week') {
                $week_start = gmdate('Y-m-d', strtotime('this week monday'));
                $prepared_where .= " AND DATE(l.created_at) >= %s";
                $where_params[] = $week_start;
            } elseif ($filter === 'month') {
                $month_start = gmdate('Y-m-01');
                $prepared_where .= " AND DATE(l.created_at) >= %s";
                $where_params[] = $month_start;
            }
        }

        if (! empty($date_from)) {
            $prepared_where .= " AND DATE(l.created_at) >= %s";
            $where_params[] = sanitize_text_field($date_from);
        }

        if (! empty($date_to)) {
            $prepared_where .= " AND DATE(l.created_at) <= %s";
            $where_params[] = sanitize_text_field($date_to);
        }

        /**
         * Total count query
         */
        $count_query = $wpdb->prepare(
            "SELECT COUNT(*)
            FROM {$logs_table_name} l
            {$join}
            WHERE {$prepared_where}",
            ...$where_params
        );

        $total = (int) $wpdb->get_var($count_query);

        /**
         * Data query - add per_page and offset to params
         */
        $data_query_params = $where_params;
        $data_query_params[] = $per_page;
        $data_query_params[] = $offset;

        $data_query = $wpdb->prepare(
            "SELECT l.*, u.display_name AS user_name, u.user_login, u.user_email
            FROM {$logs_table_name} l
            LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID
            WHERE {$prepared_where}
            ORDER BY l.{$orderby} {$order}
            LIMIT %d OFFSET %d",
            ...$data_query_params
        );

        $results = $wpdb->get_results($data_query, ARRAY_A);

        return new WP_REST_Response(
            array(
                'success'      => true,
                'data'         => $results,
                'total'        => $total,
                'page'         => $page,
                'per_page'     => $per_page,
                'total_pages'  => (int) ceil($total / $per_page),
            ),
            200
        );
    }

    /**
     * Get single log by ID
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_log($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $id = absint($request->get_param('id'));

        $query = $wpdb->prepare(
            "SELECT l.*, u.display_name as user_name, u.user_login, u.user_email
            FROM {$logs_table_name} l
            LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID
            WHERE l.ID = %d",
            $id
        );

        $result = $wpdb->get_row($query, ARRAY_A);

        if (! $result) {
            return new WP_Error(
                'log_not_found',
                'Log entry not found',
                array('status' => 404)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'data'    => $result,
            ),
            200
        );
    }

    /**
     * Delete log entry
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function delete_log($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $id = absint($request->get_param('id'));

        // Get the record before deleting
        $log = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$logs_table_name} WHERE ID = %d", $id),
            ARRAY_A
        );

        if (! $log) {
            return new WP_Error(
                'log_not_found',
                'Log entry not found',
                array('status' => 404)
            );
        }

        $result = $wpdb->delete(
            $logs_table_name,
            array('ID' => $id),
            array('%d')
        );

        if (! $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete log entry: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Log entry deleted successfully',
                'data'    => $log,
            ),
            200
        );
    }

    public static function bulk_delete_logs($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $ids = $request->get_param('ids');
        if (empty($ids) || ! is_array($ids)) {
            return new WP_Error(
                'invalid_ids',
                'Invalid or empty IDs provided',
                array('status' => 400)
            );
        }

        $ids = array_map('absint', $ids);
        $placeholders = implode(',', array_fill(0, count($ids), '%d'));

        $result = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$logs_table_name} WHERE ID IN ({$placeholders})",
                $ids
            )
        );

        if (false === $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete logs: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => sprintf('Successfully deleted %d log entries', count($ids)),
                'deleted_count' => count($ids),
            ),
            200
        );
    }

    /**
     * Delete all log entries
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function delete_all_logs($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        // Get count before deletion
        $count = $wpdb->get_var("SELECT COUNT(*) FROM {$logs_table_name}");

        if ($count == 0) {
            return new WP_REST_Response(
                array(
                    'success' => true,
                    'message' => 'No logs to delete',
                    'count'   => 0,
                ),
                200
            );
        }

        $result = $wpdb->query("TRUNCATE TABLE {$logs_table_name}");

        if (false === $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete all logs: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => sprintf('Successfully deleted %d log entries', $count),
                'count'   => (int) $count,
            ),
            200
        );
    }

    public static function get_logs_over_time($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $results = $wpdb->get_results(
            "SELECT DATE(created_at) AS date, COUNT(*) AS total
            FROM {$logs_table_name}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30",
            ARRAY_A
        );

        return new WP_REST_Response(
            array(
                'success' => true,
                'data'    => $results,
            ),
            200
        );
    }

    public static function get_logs_by_category($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $results = $wpdb->get_results(
            "SELECT category, COUNT(*) AS total
            FROM {$logs_table_name}
            GROUP BY category
            ORDER BY total DESC",
            ARRAY_A
        );

        return new WP_REST_Response(
            array(
                'success' => true,
                'data'    => $results,
            ),
            200
        );
    }

    public static function get_logs_top_users($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $results = $wpdb->get_results(
            "SELECT l.user_id, u.display_name, COUNT(*) AS total
            FROM {$logs_table_name} l
            LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID
            GROUP BY l.user_id
            ORDER BY total DESC
            LIMIT 10",
            ARRAY_A
        );

        return new WP_REST_Response(
            array(
                'success' => true,
                'data'    => $results,
            ),
            200
        );
    }

    public static function get_logs_top_ips($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $results = $wpdb->get_results(
            "SELECT ip, COUNT(*) AS total
            FROM {$logs_table_name}
            GROUP BY ip
            ORDER BY total DESC
            LIMIT 10",
            ARRAY_A
        );

        return new WP_REST_Response(
            array(
                'success' => true,
                'data'    => $results,
            ),
            200
        );
    }

    public static function get_logs_hourly_activity($request)
    {
        global $wpdb;
        $logs_table_name = $wpdb->prefix . 'bill_manager_logs';

        $results = $wpdb->get_results(
            "SELECT HOUR(created_at) AS hour, COUNT(*) AS total
            FROM {$logs_table_name}
            GROUP BY hour
            ORDER BY hour",
            ARRAY_A
        );

        return new WP_REST_Response(
            array(
                'success' => true,
                'data'    => $results,
            ),
            200
        );
    }

    /**
     * Helper to check if an array is associative.
     */
    private static function is_associative_array($array)
    {
        if (!is_array($array)) {
            return false;
        }
        if (empty($array)) {
            return false;
        }
        return array_keys($array) !== range(0, count($array) - 1);
    }

    /**
     * Recursively compares old and new data arrays against the options details.
     */
    private static function get_changes_recursive($old, $new, $details)
    {
        $changes = [];
        if (!is_array($new)) $new = [];
        foreach ($new as $key => $value) {
            $old_val = isset($old[$key]) ? $old[$key] : null;

            // Check if details has a title key at this level (meaning we reached the leaf setting details)
            $has_details_title = isset($details[$key]['title']);

            if (is_array($value) && !$has_details_title && self::is_associative_array($value)) {
                $sub_details = isset($details[$key]) ? $details[$key] : [];
                $sub_changes = self::get_changes_recursive($old_val, $value, $sub_details);
                $changes = array_merge($changes, $sub_changes);
            } else {
                if ($old_val != $value) {
                    $title = isset($details[$key]['title']) ? $details[$key]['title'] : ucwords(str_replace('_', ' ', $key));
                    $url = isset($details[$key]['url']) ? $details[$key]['url'] : '';

                    $changes[] = [
                        'title'   => $title,
                        'url'     => $url,
                        'old'     => $old_val,
                        'changed' => $value
                    ];
                }
            }
        }
        return $changes;
    }
}
