<?php

namespace MosPress\BillManager\API;

use MosPress\BillManager\Helpers\Utils;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_Query;
use WP_REST_Server;

class BillsController
{
    /**
     * Create company
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function create_company(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $user_id    = get_current_user_id();
        $ip         = Utils::get_client_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';

        $title   = sanitize_text_field(wp_unslash($request->get_param('title')));
        $address = sanitize_textarea_field(wp_unslash($request->get_param('address')));
        $phone   = sanitize_text_field(wp_unslash($request->get_param('phone')));
        $email   = sanitize_text_field(wp_unslash($request->get_param('email')));
        $notes   = sanitize_textarea_field(wp_unslash($request->get_param('notes')));
        $status  = sanitize_text_field(wp_unslash($request->get_param('status')));

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
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%s']
        );

        // $wpdb->insert() returns false on failure, or the number of rows affected on success.
        if ($insert === false) {
            return new WP_Error(
                'rest_insert_error',
                'An error occurred while saving the company. Please try again.',
                array(
                    'status'   => 500,
                    'db_error' => $wpdb->last_error, // remove/guard this in production if you don't want to expose raw DB errors
                )
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Company created successfully.',
                'data'    => [
                    'id'         => $wpdb->insert_id,
                    'user_id'    => $user_id,
                    'ip'         => $ip,
                    'user_agent' => $user_agent,
                    'title'      => $title,
                    'address'    => $address,
                    'phone'      => $phone,
                    'email'      => $email,
                    'notes'      => $notes,
                    'status'     => $status,
                ],
            ),
            200
        );
    }
    /**
     * All companies
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function all_companies(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }
        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';
        $data_query = $wpdb->prepare(
            "SELECT * FROM {$companies_table}"
        );

        $results = $wpdb->get_results($data_query, ARRAY_A);

        return new WP_REST_Response(
            array(
                'success'      => true,
                'data'         => $results,
            ),
            200
        );
    }

    /**
     * Get companies with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_companies(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }
        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $page     = max(1, (int) $request->get_param('page'));
        $per_page = max(1, (int) $request->get_param('per_page'));
        $search   = trim((string) $request->get_param('search'));
        $filter   = $request->get_param('filter');

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

        /**
         * Build unified where clause and joins
         */
        $prepared_where = '1=1';
        $where_params   = array();
        $join_users     = '';

        if ($search !== '') {
            $join_users = "LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID";
            $like = '%' . $wpdb->esc_like($search) . '%';
            $prepared_where .= " AND (u.display_name LIKE %s OR c.ip LIKE %s OR c.title LIKE %s)";
            $where_params[] = $like;
            $where_params[] = $like;
            $where_params[] = $like;

            // Date search only if valid YYYY-MM-DD
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $search)) {
                $prepared_where .= " OR DATE(c.created_at) = %s";
                $where_params[] = $search;
            }
        }

        /**
         * Time-based filter (today, week, month)
         */
        if (! empty($filter) && $filter !== 'any') {
            $current_date = gmdate('Y-m-d');
            if ($filter === 'today') {
                $prepared_where .= " AND DATE(c.created_at) = %s";
                $where_params[] = $current_date;
            } elseif ($filter === 'week') {
                $week_start = gmdate('Y-m-d', strtotime('this week monday'));
                $prepared_where .= " AND DATE(c.created_at) >= %s";
                $where_params[] = $week_start;
            } elseif ($filter === 'month') {
                $month_start = gmdate('Y-m-01');
                $prepared_where .= " AND DATE(c.created_at) >= %s";
                $where_params[] = $month_start;
            }
        }

        /**
         * Date range filter
         */
        if (! empty($date_from)) {
            $prepared_where .= " AND DATE(c.created_at) >= %s";
            $where_params[] = sanitize_text_field($date_from);
        }

        if (! empty($date_to)) {
            $prepared_where .= " AND DATE(c.created_at) <= %s";
            $where_params[] = sanitize_text_field($date_to);
        }

        /**
         * Total count query
         */
        $count_query = $wpdb->prepare(
            "SELECT COUNT(*)
            FROM {$companies_table} c
            {$join_users}
            WHERE {$prepared_where}",
            ...$where_params
        );

        $total = (int) $wpdb->get_var($count_query);

        /**
         * Data query
         */
        $data_query = $wpdb->prepare(
            "SELECT c.*, u.display_name AS user_name, u.user_login, u.user_email
            FROM {$companies_table} c
            {$join_users}
            WHERE {$prepared_where}
            ORDER BY c.{$orderby} {$order}
            LIMIT %d OFFSET %d",
            ...array_merge($where_params, array($per_page, $offset))
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
     * Get companies with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_companies_with_transactions(WP_REST_Request $request)
    {
        global $wpdb;

        $companies_table = $wpdb->prefix . 'bill_manager_companies';
        $bills_table     = $wpdb->prefix . 'bill_manager_bills';
        $items_table     = $wpdb->prefix . 'bill_manager_bill_items';
        $payments_table  = $wpdb->prefix . 'bill_manager_payments';

        $page     = max(1, (int) $request->get_param('page'));
        $per_page = max(1, (int) $request->get_param('per_page'));
        $search   = trim((string) $request->get_param('search'));
        $filter   = $request->get_param('filter');
        $balance_type_filter = $request->get_param('balance_type');

        $date_from = $request->get_param('date_from');
        $date_to   = $request->get_param('date_to');

        $orderby = $request->get_param('sort_field') ?? 'c.ID';
        $order   = strtoupper($request->get_param('sort_order')) == 'ASC' ? 'ASC' : 'DESC';

        // Allowed order by columns
        $allowed_orderby = array('c.ID', 'c.title', 'c.address', 'c.phone', 'c.email', 'sale', 'purchase', 'sale_paid', 'purchase_paid', 'receivable', 'payable', 'balance');
        if (! in_array($orderby, $allowed_orderby, true)) {
            $orderby = 'c.ID';
        }

        $offset = ($page - 1) * $per_page;

        /**
         * Build unified where clause and joins
         */
        $prepared_where = '1=1';
        $where_params   = array();
        $join_users     = '';

        if ($search !== '') {
            $join_users = "LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID";
            $like = '%' . $wpdb->esc_like($search) . '%';
            $prepared_where .= " AND (u.display_name LIKE %s OR c.title LIKE %s OR  c.address LIKE %s OR c.phone LIKE %s OR c.email LIKE %s)";
            $where_params[] = $like;
            $where_params[] = $like;
            $where_params[] = $like;
            $where_params[] = $like;
            $where_params[] = $like;

            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $search)) {
                $prepared_where .= " OR DATE(c.created_at) = %s";
                $where_params[] = $search;
            }
        }

        if (! empty($filter) && $filter !== 'any') {
            $current_date = gmdate('Y-m-d');
            if ($filter === 'today') {
                $prepared_where .= " AND DATE(c.created_at) = %s";
                $where_params[] = $current_date;
            } elseif ($filter === 'week') {
                $week_start = gmdate('Y-m-d', strtotime('this week monday'));
                $prepared_where .= " AND DATE(c.created_at) >= %s";
                $where_params[] = $week_start;
            } elseif ($filter === 'month') {
                $month_start = gmdate('Y-m-01');
                $prepared_where .= " AND DATE(c.created_at) >= %s";
                $where_params[] = $month_start;
            }
        }

        if (! empty($date_from)) {
            $prepared_where .= " AND DATE(c.created_at) >= %s";
            $where_params[] = sanitize_text_field($date_from);
        }

        if (! empty($date_to)) {
            $prepared_where .= " AND DATE(c.created_at) <= %s";
            $where_params[] = sanitize_text_field($date_to);
        }

        /**
         * Build HAVING clause for balance_type
         */
        $having_clause = '';
        $having_params = array();
        if (!empty($balance_type_filter) && in_array($balance_type_filter, ['receivable', 'payable', 'settled'])) {
            $having_clause = "HAVING balance_type = %s";
            $having_params[] = $balance_type_filter;
        }

        /**
         * Main Query to calculate amounts
         */
        $sql_base = "
            SELECT
                c.ID AS id,
                c.title,
                c.address,
                c.phone,
                c.email,
                c.created_at,
                COALESCE(sales.sale_amount, 0) AS sale,
                COALESCE(purchases.purchase_amount, 0) AS purchase,
                COALESCE(sale_payments.sale_paid, 0) AS sale_paid,
                COALESCE(purchase_payments.purchase_paid, 0) AS purchase_paid,
                (COALESCE(sales.sale_amount, 0) - COALESCE(sale_payments.sale_paid, 0)) AS receivable,
                (COALESCE(purchases.purchase_amount, 0) - COALESCE(purchase_payments.purchase_paid, 0)) AS payable,
                ((COALESCE(sales.sale_amount, 0) - COALESCE(sale_payments.sale_paid, 0)) - (COALESCE(purchases.purchase_amount, 0) - COALESCE(purchase_payments.purchase_paid, 0))) AS balance,
                CASE
                    WHEN ((COALESCE(sales.sale_amount, 0) - COALESCE(sale_payments.sale_paid, 0)) - (COALESCE(purchases.purchase_amount, 0) - COALESCE(purchase_payments.purchase_paid, 0))) > 0 THEN 'receivable'
                    WHEN ((COALESCE(sales.sale_amount, 0) - COALESCE(sale_payments.sale_paid, 0)) - (COALESCE(purchases.purchase_amount, 0) - COALESCE(purchase_payments.purchase_paid, 0))) < 0 THEN 'payable'
                    ELSE 'settled'
                END AS balance_type
            FROM {$companies_table} c
            {$join_users}
            LEFT JOIN (SELECT b.company_id, SUM(bi.quantity * bi.unit_price) AS sale_amount FROM {$bills_table} b INNER JOIN {$items_table} bi ON bi.bill_id = b.ID WHERE b.bill_type = 'sale' GROUP BY b.company_id) sales ON sales.company_id = c.ID
            LEFT JOIN (SELECT b.company_id, SUM(bi.quantity * bi.unit_price) AS purchase_amount FROM {$bills_table} b INNER JOIN {$items_table} bi ON bi.bill_id = b.ID WHERE b.bill_type = 'purchase' GROUP BY b.company_id) purchases ON purchases.company_id = c.ID
            LEFT JOIN (SELECT b.company_id, SUM(p.paid_amount) AS sale_paid FROM {$payments_table} p INNER JOIN {$bills_table} b ON b.ID = p.bill_id WHERE b.bill_type = 'sale' GROUP BY b.company_id) sale_payments ON sale_payments.company_id = c.ID
            LEFT JOIN (SELECT b.company_id, SUM(p.paid_amount) AS purchase_paid FROM {$payments_table} p INNER JOIN {$bills_table} b ON b.ID = p.bill_id WHERE b.bill_type = 'purchase' GROUP BY b.company_id) purchase_payments ON purchase_payments.company_id = c.ID
            WHERE {$prepared_where}
            GROUP BY c.ID
            {$having_clause}
        ";

        /**
         * Total count query
         */
        $count_sql = "SELECT COUNT(*) FROM (" . $sql_base . ") AS temp_table";
        $total = (int) $wpdb->get_var($wpdb->prepare($count_sql, array_merge($where_params, $having_params)));

        /**
         * Data query
         */
        $data_query = $sql_base . " ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $data_query_params = array_merge($where_params, $having_params, array($per_page, $offset));
        
        $results = $wpdb->get_results($wpdb->prepare($data_query, ...$data_query_params), ARRAY_A);

        if ( ! $results ) {
            return rest_ensure_response( [] );
        }

        // Format results
        foreach ( $results as &$company ) {
            $company['sale']           = number_format( (float)$company['sale'], 2, '.', '' );
            $company['purchase']       = number_format( (float)$company['purchase'], 2, '.', '' );
            $company['sale_paid']      = number_format( (float)$company['sale_paid'], 2, '.', '' );
            $company['purchase_paid']  = number_format( (float)$company['purchase_paid'], 2, '.', '' );
            $company['receivable']     = number_format( max( (float)$company['receivable'], 0 ), 2, '.', '' );
            $company['payable']        = number_format( max( (float)$company['payable'], 0 ), 2, '.', '' );
            $company['balance']        = number_format( abs( (float)$company['balance'] ), 2, '.', '' );
        }

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
     * Get company by id
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_company(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $id = absint($request->get_param('id'));

        if (empty($id)) {
            return new WP_Error(
                'rest_invalid_param',
                'A valid company ID is required.',
                array('status' => 400)
            );
        }


        $data_query = $wpdb->prepare(
            "SELECT l.*, u.display_name AS user_name, u.user_login, u.user_email
            FROM {$companies_table} l
            LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID
            WHERE l.ID = %d
            LIMIT 1",
            $id
        );

        $result = $wpdb->get_row($data_query, ARRAY_A);

        if (empty($result)) {
            return new WP_Error(
                'rest_not_found',
                'Company not found.',
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
     * Update company by id
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function update_company(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $id = absint($request->get_param('id'));

        if (empty($id)) {
            return new WP_Error(
                'rest_invalid_param',
                'A valid company ID is required.',
                array('status' => 400)
            );
        }

        $data_query = $wpdb->prepare(
            "SELECT l.* 
            FROM {$companies_table} l 
            WHERE l.ID = %d 
            LIMIT 1",
            $id
        );


        $result = $wpdb->get_row($data_query, ARRAY_A);

        if (empty($result)) {
            return new WP_Error(
                'rest_not_found',
                'Company not found.',
                array('status' => 404)
            );
        }


        $user_id    = get_current_user_id();
        $ip         = Utils::get_client_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';

        $title   = sanitize_text_field(wp_unslash($request->get_param('title')));
        $address = sanitize_textarea_field(wp_unslash($request->get_param('address')));
        $phone   = sanitize_text_field(wp_unslash($request->get_param('phone')));
        $email   = sanitize_text_field(wp_unslash($request->get_param('email')));
        $notes   = sanitize_textarea_field(wp_unslash($request->get_param('notes')));
        $status  = sanitize_text_field(wp_unslash($request->get_param('status')));

        $update = $wpdb->update(
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
                'updated_at' => current_time('mysql'),
            ],
            ['ID' => $id],
            ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s'],
            ['%d']
        );

        // $wpdb->update() returns false on failure, or the number of rows affected on success.
        if ($update === false) {
            return new WP_Error(
                'rest_insert_error',
                'An error occurred while saving the company. Please try again.',
                array(
                    'status'   => 500,
                    'db_error' => $wpdb->last_error, // remove/guard this in production if you don't want to expose raw DB errors
                )
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
     * Delete company entry
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function delete_company(WP_REST_Request $request)
    {
        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $id = absint($request->get_param('id'));

        // Get the record before deleting
        $company = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$companies_table} WHERE ID = %d", $id),
            ARRAY_A
        );

        if (! $company) {
            return new WP_Error(
                'company_not_found',
                'Company entry not found',
                array('status' => 404)
            );
        }

        $result = $wpdb->delete(
            $companies_table,
            array('ID' => $id),
            array('%d')
        );

        if (! $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete company entry: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Company entry deleted successfully',
                'data'    => $company,
            ),
            200
        );
    }

    /**
     * Bulk delete country entry
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function bulk_delete_companies(WP_REST_Request $request)
    {
        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

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
                "DELETE FROM {$companies_table} WHERE ID IN ({$placeholders})",
                $ids
            )
        );

        if (false === $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete companies: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => sprintf('Successfully deleted %d company entries', count($ids)),
                'deleted_count' => count($ids),
            ),
            200
        );
    }

    /**
     * Delete all country entries
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function delete_all_companies(WP_REST_Request $request)
    {
        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        // Get count before deletion
        $count = $wpdb->get_var("SELECT COUNT(*) FROM {$companies_table}");

        if ($count == 0) {
            return new WP_REST_Response(
                array(
                    'success' => true,
                    'message' => 'No companies to delete',
                    'count'   => 0,
                ),
                200
            );
        }

        $result = $wpdb->query("TRUNCATE TABLE {$companies_table}");

        if (false === $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete all companies: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => sprintf('Successfully deleted %d company entries', $count),
                'count'   => (int) $count,
            ),
            200
        );
    }

    public static function get_companies_over_time(WP_REST_Request $request)
    {
        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $results = $wpdb->get_results(
            "SELECT DATE(created_at) AS date, COUNT(*) AS total
            FROM {$companies_table}
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

    /**
     * All bill
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function all_bills(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';
        $data_query = $wpdb->prepare(
            "SELECT * FROM {$bills_table}"
        );

        $results = $wpdb->get_results($data_query, ARRAY_A);

        return new WP_REST_Response(
            array(
                'success'      => true,
                'data'         => $results,
            ),
            200
        );
    }

    /**
     * Create bill
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function create_bill(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;
        $companies_table = $wpdb->prefix . 'bill_manager_bills';

        $user_id        = get_current_user_id();
        $ip             = Utils::get_client_ip();
        $user_agent     = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';

        $company_id     = sanitize_text_field(wp_unslash($request->get_param('company_id')));

        $bill_no     = sanitize_text_field(wp_unslash($request->get_param('bill_no')));
        $bill_type      = sanitize_textarea_field(wp_unslash($request->get_param('bill_type')));
        $bill_date      = sanitize_text_field(wp_unslash($request->get_param('bill_date')));
        $discount      = sanitize_text_field(wp_unslash($request->get_param('discount')));
        $ait      = sanitize_text_field(wp_unslash($request->get_param('ait')));
        $tax      = sanitize_text_field(wp_unslash($request->get_param('tax')));
        $vat      = sanitize_text_field(wp_unslash($request->get_param('vat')));
        $shipping      = sanitize_text_field(wp_unslash($request->get_param('shipping')));
        $status      = sanitize_text_field(wp_unslash($request->get_param('status')));
        $notes      = sanitize_textarea_field(wp_unslash($request->get_param('notes')));

        $bill_items     = map_deep(wp_unslash($request->get_param('bill_items')), 'wp_kses_post');

        $bill_no = $bill_no ?? 'BILL-' . strtoupper(uniqid());

        $insert = $wpdb->insert(
            $companies_table,
            [
                'user_id'       => $user_id,
                'ip'            => $ip,
                'user_agent'    => $user_agent,
                'company_id'    => $company_id,

                'bill_no'       => $bill_no,
                'bill_type'     => $bill_type,
                'bill_date'     => $bill_date,

                'discount'      => $discount,
                'ait'           => $ait,
                'tax'           => $tax,
                'vat'           => $vat,
                'shipping'      => $shipping,
                'status'        => $status,
                'notes'         => $notes,
                'created_at'    => current_time('mysql'),
                'updated_at'    => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%d', '%s', '%s', '%s', '%f', '%f', '%f', '%f', '%f', '%d', '%s', '%s', '%s']
        );

        // $wpdb->insert() returns false on failure, or the number of rows affected on success.
        if ($insert === false) {
            return new WP_Error(
                'rest_insert_error',
                'An error occurred while saving the company. Please try again.',
                array(
                    'status'   => 500,
                    'db_error' => $wpdb->last_error, // remove/guard this in production if you don't want to expose raw DB errors
                )
            );
        }

        $item_result = self::create_item($bill_items, (int) $wpdb->insert_id);
        if ($item_result instanceof WP_Error) {
            return $item_result;
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Company created successfully.',
                'data'    => [
                    'id'            => $wpdb->insert_id,
                    'user_id'       => $user_id,
                    'ip'            => $ip,
                    'user_agent'    => $user_agent,
                    'company_id'    => $company_id,
                    'bill_no'       => $bill_no,
                    'bill_type'     => $bill_type,
                    'bill_date'     => $bill_date,
                    'discount'      => $discount,
                    'ait'           => $ait,
                    'tax'           => $tax,
                    'vat'           => $vat,
                    'shipping'      => $shipping,
                    'status'        => $status,
                    'notes'         => $notes,
                ],
            ),
            200
        );
    }

    /**
     * Get bills with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_bills(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';

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
         * Search billic
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
            FROM {$bills_table} l
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
            FROM {$bills_table} l
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
     * Get single bill by ID
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_bill(WP_REST_Request $request)
    {
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';

        $id = absint($request->get_param('id'));

        $query = $wpdb->prepare(
            "SELECT l.*, u.display_name as user_name, u.user_login, u.user_email
            FROM {$bills_table} l
            LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID
            WHERE l.ID = %d",
            $id
        );

        $result = $wpdb->get_row($query, ARRAY_A);

        if (! $result) {
            return new WP_Error(
                'bill_not_found',
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
     * Delete bill entry
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function delete_bill(WP_REST_Request $request)
    {
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';

        $id = absint($request->get_param('id'));

        // Get the record before deleting
        $bill = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$bills_table} WHERE ID = %d", $id),
            ARRAY_A
        );

        if (! $bill) {
            return new WP_Error(
                'bill_not_found',
                'Log entry not found',
                array('status' => 404)
            );
        }

        $result = $wpdb->delete(
            $bills_table,
            array('ID' => $id),
            array('%d')
        );

        if (! $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete bill entry: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Log entry deleted successfully',
                'data'    => $bill,
            ),
            200
        );
    }

    /**
     * Bulk delete bill entry
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function bulk_delete_bills(WP_REST_Request $request)
    {
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';

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
                "DELETE FROM {$bills_table} WHERE ID IN ({$placeholders})",
                $ids
            )
        );

        if (false === $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete bills: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => sprintf('Successfully deleted %d bill entries', count($ids)),
                'deleted_count' => count($ids),
            ),
            200
        );
    }

    /**
     * Delete all bill entries
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function delete_all_bills(WP_REST_Request $request)
    {
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';

        // Get count before deletion
        $count = $wpdb->get_var("SELECT COUNT(*) FROM {$bills_table}");

        if ($count == 0) {
            return new WP_REST_Response(
                array(
                    'success' => true,
                    'message' => 'No bills to delete',
                    'count'   => 0,
                ),
                200
            );
        }

        $result = $wpdb->query("TRUNCATE TABLE {$bills_table}");

        if (false === $result) {
            return new WP_Error(
                'delete_failed',
                'Failed to delete all bills: ' . $wpdb->last_error,
                array('status' => 500)
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => sprintf('Successfully deleted %d bill entries', $count),
                'count'   => (int) $count,
            ),
            200
        );
    }

    public static function get_bills_over_time(WP_REST_Request $request)
    {
        global $wpdb;
        $bills_table = $wpdb->prefix . 'bill_manager_bills';

        $results = $wpdb->get_results(
            "SELECT DATE(created_at) AS date, COUNT(*) AS total
            FROM {$bills_table}
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


    /**
     * Create items
     */
    public static function create_item($items, $bill_id = 0)
    {
        error_log(print_r($items, true));
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;
        $items_table = $wpdb->prefix . 'bill_manager_bill_items';

        $user_id        = get_current_user_id();
        $ip             = Utils::get_client_ip();
        $user_agent     = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';

        $bill_id     = $bill_id ? sanitize_text_field(wp_unslash($bill_id)) : '';
        foreach ($items as $item) {
            $title     = isset($item['title']) ? sanitize_text_field(wp_unslash($item['title'])) : '';
            $quantity     = isset($item['quantity']) ? sanitize_text_field(wp_unslash($item['quantity'])) : '';
            $unit     = isset($item['unit']) ? sanitize_text_field(wp_unslash($item['unit'])) : '';
            $unit_price     = isset($item['unit_price']) ? sanitize_text_field(wp_unslash($item['unit_price'])) : '';

            $insert = $wpdb->insert(
                $items_table,
                [
                    'user_id'       => $user_id,
                    'ip'            => $ip,
                    'user_agent'    => $user_agent,

                    'bill_id'    => $bill_id,
                    'title'  => $title,
                    'quantity'     => $quantity,
                    'unit'     => $unit,
                    'unit_price'     => $unit_price,

                    'created_at'    => current_time('mysql'),
                    'updated_at'    => current_time('mysql'),
                ],
                ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
            );


            // $wpdb->insert() returns false on failure, or the number of rows affected on success.
            if ($insert === false) {
                return new WP_Error(
                    'rest_insert_error',
                    'An error occurred while saving the company. Please try again.',
                    array(
                        'status'   => 500,
                        'db_error' => $wpdb->last_error, // remove/guard this in production if you don't want to expose raw DB errors
                    )
                );
            }
        }
        return true;

        // return new WP_REST_Response(
        //     array(
        //         'success' => true,
        //         'message' => 'Company created successfully.',
        //         'data'    => [
        //             'id'            => $wpdb->insert_id,
        //             'user_id'       => $user_id,
        //             'ip'            => $ip,

        //             'bill_id'    => $bill_id,
        //             'title'  => $title,
        //             'quantity'     => $quantity,
        //             'unit'     => $unit,
        //             'unit_price'     => $unit_price,
        //         ],
        //     ),
        //     200
        // );
    }

    /**
     * All payments
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function all_payments(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }
        global $wpdb;
        $payments_table = $wpdb->prefix . 'bill_manager_payments';
        $data_query = $wpdb->prepare(
            "SELECT * FROM {$payments_table}"
        );

        $results = $wpdb->get_results($data_query, ARRAY_A);

        return new WP_REST_Response(
            array(
                'success'      => true,
                'data'         => $results,
            ),
            200
        );
    }


    /**
     * Create payment
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function create_payment(WP_REST_Request $request)
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;
        $payments_table = $wpdb->prefix . 'bill_manager_payments';

        $user_id        = get_current_user_id();
        $ip             = Utils::get_client_ip();
        $user_agent     = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';


        $bill_id     = sanitize_text_field(wp_unslash($request->get_param('bill_id')));
        $payment_date      = sanitize_text_field(wp_unslash($request->get_param('payment_date')));
        $paid_amount      = sanitize_text_field(wp_unslash($request->get_param('paid_amount')));
        $reference_no      = sanitize_text_field(wp_unslash($request->get_param('reference_no')));
        $notes      = sanitize_textarea_field(wp_unslash($request->get_param('notes')));

        $insert = $wpdb->insert(
            $payments_table,
            [
                'user_id'       => $user_id,
                'ip'            => $ip,
                'user_agent'    => $user_agent,

                'bill_id'       => $bill_id,
                'payment_date'  => $payment_date,
                'paid_amount'   => $paid_amount,
                'reference_no'  => $reference_no,
                'notes'         => $notes,

                'created_at'    => current_time('mysql'),
                'updated_at'    => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%d', '%s', '%f', '%s', '%s', '%s', '%s']
        );

        // $wpdb->insert() returns false on failure, or the number of rows affected on success.
        if ($insert === false) {
            return new WP_Error(
                'rest_insert_error',
                'An error occurred while saving the payment. Please try again.',
                array(
                    'status'   => 500,
                    'db_error' => $wpdb->last_error, // remove/guard this in production if you don't want to expose raw DB errors
                )
            );
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Payment created successfully.',
                'data'    => [
                    'id'            => $wpdb->insert_id,
                    'user_id'       => $user_id,
                    'ip'            => $ip,
                    'user_agent'    => $user_agent,
                    'bill_id'       => $bill_id,
                    'payment_date'  => $payment_date,
                    'paid_amount'   => $paid_amount,
                    'reference_no'  => $reference_no,
                    'notes'         => $notes,
                ],
            ),
            200
        );
    }
}
