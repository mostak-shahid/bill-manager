<?php

namespace MosPress\BillManager\API;

use MosPress\BillManager\Helpers\Utils;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class CompaniesController
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
     * List companies
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function list_companies(WP_REST_Request $request)
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
    // public static function get_companies(WP_REST_Request $request)
    // {
    //     if (!current_user_can('manage_options')) {
    //         return new WP_Error(
    //             'rest_update_error',
    //             'Sorry, you are not allowed to update the DAEXT UI Test options.',
    //             array('status' => 403)
    //         );
    //     }
    //     global $wpdb;
    //     $companies_table = $wpdb->prefix . 'bill_manager_companies';

    //     $page     = max(1, (int) $request->get_param('page'));
    //     $per_page = max(1, (int) $request->get_param('per_page'));
    //     $search   = trim((string) $request->get_param('search'));
    //     $filter   = $request->get_param('filter');

    //     $date_from = $request->get_param('date_from');
    //     $date_to   = $request->get_param('date_to');

    //     $orderby = $request->get_param('sort_field');
    //     $order   = strtoupper($request->get_param('sort_order')) == 'ASC' ? 'ASC' : 'DESC';

    //     // Allowed order by columns
    //     $allowed_orderby = array('ID', 'user_id', 'ip', 'title', 'created_at', 'updated_at');
    //     if (! in_array($orderby, $allowed_orderby, true)) {
    //         $orderby = 'ID';
    //     }

    //     $offset = ($page - 1) * $per_page;

    //     $join_users     = "LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID";

    //     $prepared_where = '1=1';
    //     $where_params   = array();

    //     if ($search !== '') {
    //         $like = '%' . $wpdb->esc_like($search) . '%';
    //         $prepared_where .= " AND (u.display_name LIKE %s OR c.ip LIKE %s OR c.title LIKE %s)";
    //         $where_params[] = $like;
    //         $where_params[] = $like;
    //         $where_params[] = $like;

    //         // Date search only if valid YYYY-MM-DD
    //         if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $search)) {
    //             $prepared_where .= " OR DATE(c.created_at) = %s";
    //             $where_params[] = $search;
    //         }
    //     }

    //     /**
    //      * Time-based filter (today, week, month)
    //      */
    //     if (! empty($filter) && $filter !== 'any') {
    //         $current_date = gmdate('Y-m-d');
    //         if ($filter === 'today') {
    //             $prepared_where .= " AND DATE(c.created_at) = %s";
    //             $where_params[] = $current_date;
    //         } elseif ($filter === 'week') {
    //             $week_start = gmdate('Y-m-d', strtotime('this week monday'));
    //             $prepared_where .= " AND DATE(c.created_at) >= %s";
    //             $where_params[] = $week_start;
    //         } elseif ($filter === 'month') {
    //             $month_start = gmdate('Y-m-01');
    //             $prepared_where .= " AND DATE(c.created_at) >= %s";
    //             $where_params[] = $month_start;
    //         }
    //     }

    //     /**
    //      * Date range filter
    //      */
    //     if (! empty($date_from)) {
    //         $prepared_where .= " AND DATE(c.created_at) >= %s";
    //         $where_params[] = sanitize_text_field($date_from);
    //     }

    //     if (! empty($date_to)) {
    //         $prepared_where .= " AND DATE(c.created_at) <= %s";
    //         $where_params[] = sanitize_text_field($date_to);
    //     }

    //     /**
    //      * Total count query
    //      */
    //     $count_query = $wpdb->prepare(
    //         "SELECT COUNT(*)
    //         FROM {$companies_table} c
    //         {$join_users}
    //         WHERE {$prepared_where}",
    //         ...$where_params
    //     );

    //     $total = (int) $wpdb->get_var($count_query);

    //     /**
    //      * Data query
    //      */
    //     $data_query = $wpdb->prepare(
    //         "SELECT c.*, u.display_name AS user_name, u.user_login, u.user_email
    //         FROM {$companies_table} c
    //         {$join_users}
    //         WHERE {$prepared_where}
    //         ORDER BY c.{$orderby} {$order}
    //         LIMIT %d OFFSET %d",
    //         ...array_merge($where_params, array($per_page, $offset))
    //     );

    //     $results = $wpdb->get_results($data_query, ARRAY_A);

    //     return new WP_REST_Response(
    //         array(
    //             'success'      => true,
    //             'data'         => $results,
    //             'total'        => $total,
    //             'page'         => $page,
    //             'per_page'     => $per_page,
    //             'total_pages'  => (int) ceil($total / $per_page),
    //             'count_query' => $count_query,
    //             'data_query' => $data_query,
    //         ),
    //         200
    //     );
    // }

    /**
     * Get companies with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_companies(WP_REST_Request $request)
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
        $allowed_orderby = array('c.ID', 'c.title', 'c.address', 'c.phone', 'c.email', 'sale', 'purchase', 'sale_paid', 'purchase_paid', 'receivable', 'payable', 'balance', 'balance_type', 'c.created_at');
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
            // $join_users = "LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID";
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
                c.ID,
                c.title,
                c.address,
                c.phone,
                c.email,
                c.created_at,
                u.display_name AS user_display_name,
                u.ID AS user_id,
                u.user_email,
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
            LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
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
    public static function get_company( WP_REST_Request $request ) {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;

        // $company_id = absint( $request['id'] );
        $company_id = absint($request->get_param('id'));

        $companies_table = $wpdb->prefix . 'bill_manager_companies';
        $bills_table     = $wpdb->prefix . 'bill_manager_bills';
        $items_table     = $wpdb->prefix . 'bill_manager_bill_items';
        $payments_table  = $wpdb->prefix . 'bill_manager_payments';

        /*
        * First make sure company exists.
        */
        $company = $wpdb->get_row(
            $wpdb->prepare(
                "
                SELECT
                    c.*,
                    u.display_name AS user_display_name,
                    u.ID AS user_id,
                    u.user_email
                FROM {$companies_table} c
                LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
                WHERE c.ID = %d
                ",
                $company_id
            ),
            ARRAY_A
        );

        if ( ! $company ) {
            return new WP_Error(
                'company_not_found',
                __( 'Company not found.', 'bill-manager' ),
                [
                    'status' => 404,
                ]
            );
        }

        /*
        * Calculate company financial summary.
        *
        * Bill total:
        *
        * Item subtotal
        * - item discount
        * + item tax
        * + bill shipping
        * - bill discount
        * + bill tax
        */

        $financials = $wpdb->get_row(
            $wpdb->prepare(
                "
                SELECT

                    COALESCE(
                        SUM(
                            CASE
                                WHEN b.bill_type = 'sale'
                                THEN bt.bill_total
                                ELSE 0
                            END
                        ),
                        0
                    ) AS sale,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN b.bill_type = 'purchase'
                                THEN bt.bill_total
                                ELSE 0
                            END
                        ),
                        0
                    ) AS purchase

                FROM {$bills_table} b

                LEFT JOIN (

                    SELECT
                        b2.ID AS bill_id,

                        (
                            COALESCE(
                                SUM(
                                    (
                                        bi.quantity * bi.unit_price
                                    )
                                    
                                ),
                                0
                            )

                            - COALESCE(b2.discount, 0)
                            + COALESCE(b2.tax, 0)
                            + COALESCE(b2.shipping, 0)

                        ) AS bill_total

                    FROM {$bills_table} b2

                    LEFT JOIN {$items_table} bi
                        ON bi.bill_id = b2.ID

                    WHERE b2.company_id = %d

                    GROUP BY b2.ID

                ) bt
                    ON bt.bill_id = b.ID

                WHERE b.company_id = %d
                ",
                $company_id,
                $company_id
            ),
            ARRAY_A
        );

        /*
        * Calculate payments separately.
        *
        * sale_paid     = money received from company
        * purchase_paid = money paid to company
        */

        $payments = $wpdb->get_row(
            $wpdb->prepare(
                "
                SELECT

                    COALESCE(
                        SUM(
                            CASE
                                WHEN b.bill_type = 'sale'
                                THEN p.paid_amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS sale_paid,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN b.bill_type = 'purchase'
                                THEN p.paid_amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS purchase_paid

                FROM {$payments_table} p

                INNER JOIN {$bills_table} b
                    ON b.ID = p.bill_id

                WHERE b.company_id = %d
                ",
                $company_id
            ),
            ARRAY_A
        );

        $sale           = (float) $financials['sale'];
        $purchase       = (float) $financials['purchase'];
        $sale_paid      = (float) $payments['sale_paid'];
        $purchase_paid  = (float) $payments['purchase_paid'];

        /*
        * ABC owes us.
        */
        $receivable = $sale - $sale_paid;

        /*
        * We owe ABC.
        */
        $payable = $purchase - $purchase_paid;

        /*
        * Positive:
        * Company owes us.
        *
        * Negative:
        * We owe company.
        */
        $balance = $receivable - $payable;

        if ( $balance > 0 ) {
            $balance_type = 'receivable';
        } elseif ( $balance < 0 ) {
            $balance_type = 'payable';
        } else {
            $balance_type = 'settled';
        }

        $result = [
            'id'             => (int) $company['ID'],
            'title'          => $company['title'],
            'address'        => $company['address'],
            'phone'          => $company['phone'],
            'email'          => $company['email'],
            'notes'          => $company['notes'],
            'created_at'     => $company['created_at'],
            'user_display_name'     => $company['user_display_name'],
            'user_id'     => $company['user_id'],
            'user_email'     => $company['user_email'],
            'ip'     => $company['ip'],
            'user_agent'     => $company['user_agent'],

            'sale'           => number_format( $sale, 2, '.', '' ),
            'purchase'       => number_format( $purchase, 2, '.', '' ),

            'sale_paid'      => number_format( $sale_paid, 2, '.', '' ),
            'purchase_paid' => number_format( $purchase_paid, 2, '.', '' ),

            'receivable'     => number_format( max( 0, $receivable ), 2, '.', '' ),
            'payable'        => number_format( max( 0, $payable ), 2, '.', '' ),

            'balance'        => number_format( abs( $balance ), 2, '.', '' ),
            'balance_type'   => $balance_type,
        ];
        // return rest_ensure_response( $result );


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

    /**
     * Get conpanies over time
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
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
     * Get company bills
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_company_bills( WP_REST_Request $request ) 
    {

        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;

        $company_id = absint($request->get_param('id'));

        $page     = max( 1, absint( $request->get_param( 'page' ) ) );
        $per_page = min(
            100,
            max( 1, absint( $request->get_param( 'per_page' ) ) ) 
        );

        $offset = ( $page - 1 ) * $per_page;

        $search    = trim( (string) $request->get_param( 'search' ) );
        $orderby   = sanitize_key( $request->get_param( 'orderby' ) ?: 'date' );
        $order     = strtolower( $request->get_param( 'order' ) ?: 'desc' );

        $date_from = trim( (string) $request->get_param( 'date_from' ) );
        $date_to   = trim( (string) $request->get_param( 'date_to' ) );

        $companies_table = $wpdb->prefix . 'bill_manager_companies';
        $bills_table     = $wpdb->prefix . 'bill_manager_bills';
        $items_table     = $wpdb->prefix . 'bill_manager_bill_items';
        $payments_table  = $wpdb->prefix . 'bill_manager_payments';

        /*
        * Whitelist sortable columns.
        *
        * NEVER put a raw request parameter directly into ORDER BY.
        */
        $orderby_map = [
            'ID'       => 'b.ID',
            'bill_no'  => 'b.bill_no',
            'type'     => 'b.bill_type',
            'amount'   => 'bill_total',
            'paid'     => 'paid_amount',
            'balance'  => 'balance',
            'status'   => 'status_order',
            'date'     => 'b.bill_date',
        ];

        $orderby_sql = $orderby_map[ $orderby ] ?? 'b.bill_date';
        $order_sql   = $order === 'asc' ? 'ASC' : 'DESC';

        $where  = [];
        $params = [];

        $where[]  = 'b.company_id = %d';
        $params[] = $company_id;

        /*
        * Search.
        */
        if ( $search !== '' ) {

            $where[] = '(
                b.bill_no LIKE %s
                OR b.reference_no LIKE %s
                OR c.title LIKE %s
            )';

            $search_like = '%' . $wpdb->esc_like( $search ) . '%';

            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
        }

        /*
        * Date filters.
        */
        if ( $date_from !== '' ) {

            $where[]  = 'b.bill_date >= %s';
            $params[] = $date_from . ' 00:00:00';
        }

        if ( $date_to !== '' ) {

            $where[]  = 'b.bill_date <= %s';
            $params[] = $date_to . ' 23:59:59';
        }

        $where_sql = implode( ' AND ', $where );

        /*
        * Main query.
        */
        $sql = "
            SELECT

                b.ID,
                b.bill_no,

                c.title AS company,

                CASE
                    WHEN b.bill_type = 'sale'
                    THEN 'Sale'
                    ELSE 'Purchase'
                END AS type,

                ROUND(
                    COALESCE(bt.bill_total, 0),
                    2
                ) AS bill_total,

                ROUND(
                    COALESCE(pt.paid_amount, 0),
                    2
                ) AS paid_amount,

                ROUND(
                    COALESCE(bt.bill_total, 0)
                    - COALESCE(pt.paid_amount, 0),
                    2
                ) AS balance,

                CASE

                    WHEN COALESCE(pt.paid_amount, 0) = 0
                        THEN 'Due'

                    WHEN COALESCE(pt.paid_amount, 0) < COALESCE(bt.bill_total, 0)
                        THEN 'Partially Paid'

                    WHEN COALESCE(pt.paid_amount, 0) = COALESCE(bt.bill_total, 0)
                        THEN 'Paid'

                    WHEN COALESCE(pt.paid_amount, 0) > COALESCE(bt.bill_total, 0)
                        THEN 'Over Paid'

                END AS status,

                CASE

                    WHEN COALESCE(pt.paid_amount, 0) = 0
                        THEN 1

                    WHEN COALESCE(pt.paid_amount, 0) < COALESCE(bt.bill_total, 0)
                        THEN 2

                    WHEN COALESCE(pt.paid_amount, 0) = COALESCE(bt.bill_total, 0)
                        THEN 3

                    ELSE 4

                END AS status_order,

                b.bill_date AS date

            FROM {$bills_table} b

            INNER JOIN {$companies_table} c
                ON c.ID = b.company_id

            /*
            * Bill total.
            */
            LEFT JOIN (

                SELECT

                    b2.ID AS bill_id,

                    (
                        COALESCE(
                            SUM(
                                (
                                    bi.quantity * bi.unit_price
                                )
                                
                            ),
                            0
                        )

                        - COALESCE(b2.discount, 0)
                        + COALESCE(b2.tax, 0)
                        + COALESCE(b2.shipping, 0)

                    ) AS bill_total

                FROM {$bills_table} b2

                LEFT JOIN {$items_table} bi
                    ON bi.bill_id = b2.ID

                GROUP BY b2.ID

            ) bt
                ON bt.bill_id = b.ID

            /*
            * Total payments for each bill.
            */
            LEFT JOIN (

                SELECT

                    bill_id,
                    SUM(paid_amount) AS paid_amount

                FROM {$payments_table}

                GROUP BY bill_id

            ) pt
                ON pt.bill_id = b.ID

            WHERE {$where_sql}

            ORDER BY {$orderby_sql} {$order_sql}

            LIMIT %d OFFSET %d
        ";

        $params[] = $per_page;
        $params[] = $offset;

        $prepared_sql = $wpdb->prepare( $sql, $params );

        $results = $wpdb->get_results(
            $prepared_sql,
            ARRAY_A
        );

        /*
        * Total records.
        */
        $count_sql = "
            SELECT COUNT(*)

            FROM {$bills_table} b

            INNER JOIN {$companies_table} c
                ON c.ID = b.company_id

            WHERE {$where_sql}
        ";

        /*
        * Remove LIMIT/OFFSET parameters.
        */
        $count_params = array_slice(
            $params,
            0,
            count( $params ) - 2
        );

        $total = (int) $wpdb->get_var(
            $wpdb->prepare(
                $count_sql,
                $count_params
            )
        );

        foreach ( $results as &$row ) {

            $row['ID'] = (int) $row['ID'];

            $row['amount'] = number_format(
                (float) $row['bill_total'],
                2,
                '.',
                ''
            );

            $row['paid'] = number_format(
                (float) $row['paid_amount'],
                2,
                '.',
                ''
            );

            $row['balance'] = number_format(
                abs( (float) $row['balance'] ),
                2,
                '.',
                ''
            );

            unset( $row['bill_total'] );
            unset( $row['paid_amount'] );
            unset( $row['status_order'] );
        }

        return rest_ensure_response(
            [
                'success'    => true,
                'data' => $results,
                'page'        => $page,
                'per_page'    => $per_page,
                'total'       => $total,
                'total_pages' => $per_page > 0
                    ? (int) ceil( $total / $per_page )
                    : 1,
            ]
        );
    }

    /**
     * Get company payments
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function get_company_payments( WP_REST_Request $request ) 
    {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;

        $company_id = absint($request->get_param('id'));

        $page     = max( 1, absint( $request->get_param( 'page' ) ) );
        $per_page = min(
            100,
            max( 1, absint( $request->get_param( 'per_page' ) ) )
        );

        $offset = ( $page - 1 ) * $per_page;

        $search    = trim( (string) $request->get_param( 'search' ) );
        $orderby   = sanitize_key( $request->get_param( 'orderby' ) ?: 'date' );
        $order     = strtolower( $request->get_param( 'order' ) ?: 'desc' );

        $date_from = trim( (string) $request->get_param( 'date_from' ) );
        $date_to   = trim( (string) $request->get_param( 'date_to' ) );

        $companies_table = $wpdb->prefix . 'bill_manager_companies';
        $bills_table     = $wpdb->prefix . 'bill_manager_bills';
        $payments_table  = $wpdb->prefix . 'bill_manager_payments';

        /*
        * Whitelist sortable columns.
        */
        $orderby_map = [
            'id'       => 'p.ID',
            'bill_no'  => 'b.bill_no',
            'type'     => 'b.bill_type',
            'amount'   => 'p.paid_amount',
            // 'method'   => 'p.payment_method',
            'paid_by'  => 'p.paid_by',
            'date'     => 'p.payment_date',
        ];

        $orderby_sql = $orderby_map[ $orderby ] ?? 'p.payment_date';
        $order_sql   = $order === 'asc' ? 'ASC' : 'DESC';

        $where  = [];
        $params = [];

        $where[]  = 'b.company_id = %d';
        $params[] = $company_id;

        /*
        * Search.
        */
        if ( $search !== '' ) {

            $where[] = '(
                b.bill_no LIKE %s
                OR p.paid_by LIKE %s
                OR p.reference_no LIKE %s
                OR p.notes LIKE %s
            )';

            $search_like = '%' . $wpdb->esc_like( $search ) . '%';

            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
        }

        /*
        * Date filters.
        */
        if ( $date_from !== '' ) {

            $where[]  = 'p.payment_date >= %s';
            $params[] = $date_from . ' 00:00:00';
        }

        if ( $date_to !== '' ) {

            $where[]  = 'p.payment_date <= %s';
            $params[] = $date_to . ' 23:59:59';
        }

        $where_sql = implode( ' AND ', $where );

        $sql = "
            SELECT

                p.ID,

                CONCAT(
                    'PAY-',
                    LPAD(p.ID, 5, '0')
                ) AS payment_id,

                b.bill_no,

                c.title AS company,

                CASE
                    WHEN b.bill_type = 'sale'
                    THEN 'Sale'
                    ELSE 'Purchase'
                END AS type,

                ROUND(
                    p.paid_amount,
                    2
                ) AS amount,

                p.paid_by,

                p.payment_date AS date

            FROM {$payments_table} p

            INNER JOIN {$bills_table} b
                ON b.ID = p.bill_id

            INNER JOIN {$companies_table} c
                ON c.ID = b.company_id

            WHERE {$where_sql}

            ORDER BY {$orderby_sql} {$order_sql}

            LIMIT %d OFFSET %d
        ";

        $params[] = $per_page;
        $params[] = $offset;

        $results = $wpdb->get_results(
            $wpdb->prepare(
                $sql,
                $params
            ),
            ARRAY_A
        );

        /*
        * Total records.
        */
        $count_sql = "
            SELECT COUNT(*)

            FROM {$payments_table} p

            INNER JOIN {$bills_table} b
                ON b.ID = p.bill_id

            INNER JOIN {$companies_table} c
                ON c.ID = b.company_id

            WHERE {$where_sql}
        ";

        $count_params = array_slice(
            $params,
            0,
            count( $params ) - 2
        );

        $total = (int) $wpdb->get_var(
            $wpdb->prepare(
                $count_sql,
                $count_params
            )
        );

        foreach ( $results as &$row ) {

            $row['ID'] = (int) $row['ID'];

            $row['amount'] = number_format(
                (float) $row['amount'],
                2,
                '.',
                ''
            );
        }

        return rest_ensure_response(
            [
                'data' => $results,

                'pagination' => [
                    'page'        => $page,
                    'per_page'    => $per_page,
                    'total'       => $total,
                    'total_pages' => $per_page > 0
                        ? (int) ceil( $total / $per_page )
                        : 0,
                ],
            ]
        );
    }

    

    /**
     * Get company persons with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function  get_company_persons( WP_REST_Request $request ) {

        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;

        $company_id = absint($request->get_param('id'));

        $persons_table     = $wpdb->prefix . 'bill_manager_contact_persons';
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $page = max(
            1,
            absint( $request->get_param( 'page' ) ?: 1 )
        );

        $per_page = min(
            100,
            max(
                1,
                absint( $request->get_param( 'per_page' ) ?: 10 )
            )
        );

        $offset = ( $page - 1 ) * $per_page;

        $search = trim(
            (string) $request->get_param( 'search' )
        );

        $orderby = sanitize_key(
            $request->get_param( 'sort_field' ) ?: 'created_at'
        );

        $order = strtolower(
            $request->get_param( 'sort_order' ) ?: 'desc'
        );

        $date_from = trim(
            (string) $request->get_param( 'date_from' )
        );

        $date_to = trim(
            (string) $request->get_param( 'date_to' )
        );

        /*
        * Whitelist ORDER BY columns.
        */
        $orderby_map = [
            'id'       => 'p.ID',
            'title'       => 'p.title',
            'designation'       => 'p.designation',
            'phone'       => 'p.phone',
            'email'       => 'p.email',
            'created_at'     => 'p.created_at',
        ];

        $orderby_sql = $orderby_map[ $orderby ] ?? 'p.created_at';

        $order_sql = 'asc' === $order ? 'ASC' : 'DESC';

        /*
        * WHERE conditions.
        */
        $where  = [ 'p.company_id=%s' ];
        $params = [$company_id];

        if ( $search !== '' ) {

            $search_like = '%' . $wpdb->esc_like( $search ) . '%';

            $where[] = '(
                p.title LIKE %s
                OR p.designation LIKE %s
                OR p.phone LIKE %s
                OR p.email LIKE %s
            )';

            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
        }

        if ( $date_from !== '' ) {

            $where[]  = 'p.created_at >= %s';
            $params[] = $date_from . ' 00:00:00';
        }

        if ( $date_to !== '' ) {

            $where[]  = 'p.created_at <= %s';
            $params[] = $date_to . ' 23:59:59';
        }

        $where_sql = implode( ' AND ', $where );

        /*
        * Get bills.
        */
        $sql = "
            SELECT

                p.*,

                c.title AS company_title

            FROM {$persons_table} p

            LEFT JOIN {$companies_table} c
                ON c.ID = p.company_id

            WHERE {$where_sql}

            ORDER BY {$orderby_sql} {$order_sql}

            LIMIT %d OFFSET %d
        ";

        $params[] = $per_page;
        $params[] = $offset;

        $results = $wpdb->get_results(
            $wpdb->prepare( $sql, $params ),
            ARRAY_A
        );

        /*
        * Total number of bills.
        */
        $count_sql = "
            SELECT COUNT(*)

            FROM {$persons_table} p

            LEFT JOIN {$companies_table} c
                ON c.ID = p.company_id

            WHERE {$where_sql}
        ";

        $count_params = array_slice(
            $params,
            0,
            count( $params ) - 2
        );

        $total = (int) $wpdb->get_var(
            $wpdb->prepare(
                $count_sql,
                $count_params
            )
        );

        return rest_ensure_response(
            [
                'success' => true,
                'data' => $results,

                // 'pagination' => [
                    'page'        => $page,
                    'per_page'    => $per_page,
                    'total'       => $total,
                    'total_pages' => $per_page > 0
                        ? (int) ceil( $total / $per_page )
                        : 0,
                // ],
            ]
        );
    }

    

    /**
     * Get company events with filtering
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error
     */
    public static function  get_company_events( WP_REST_Request $request ) {

        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_update_error',
                'Sorry, you are not allowed to update the DAEXT UI Test options.',
                array('status' => 403)
            );
        }

        global $wpdb;

        $company_id = absint($request->get_param('id'));

        $events_table     = $wpdb->prefix . 'bill_manager_events';
        $companies_table = $wpdb->prefix . 'bill_manager_companies';

        $page = max(
            1,
            absint( $request->get_param( 'page' ) ?: 1 )
        );

        $per_page = min(
            100,
            max(
                1,
                absint( $request->get_param( 'per_page' ) ?: 10 )
            )
        );

        $offset = ( $page - 1 ) * $per_page;

        $search = trim(
            (string) $request->get_param( 'search' )
        );

        $orderby = sanitize_key(
            $request->get_param( 'sort_field' ) ?: 'created_at'
        );

        $order = strtolower(
            $request->get_param( 'sort_order' ) ?: 'desc'
        );

        $date_from = trim(
            (string) $request->get_param( 'date_from' )
        );

        $date_to = trim(
            (string) $request->get_param( 'date_to' )
        );

        /*
        * Whitelist ORDER BY columns.
        */
        $orderby_map = [
            'id'       => 'e.ID',
            'date'  => 'e.date',
            'type'     => 'e.type',
            'created_at'     => 'e.created_at',
        ];

        $orderby_sql = $orderby_map[ $orderby ] ?? 'e.created_at';

        $order_sql = 'asc' === $order ? 'ASC' : 'DESC';

        /*
        * WHERE conditions.
        */
        $where  = [ 'e.company_id=%s' ];
        $params = [$company_id];

        if ( $search !== '' ) {

            $search_like = '%' . $wpdb->esc_like( $search ) . '%';

            $where[] = '(
                e.type LIKE %s
                OR e.date LIKE %s
                OR e.details LIKE %s
            )';

            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
        }

        if ( $date_from !== '' ) {

            $where[]  = 'e.date >= %s';
            $params[] = $date_from . ' 00:00:00';
        }

        if ( $date_to !== '' ) {

            $where[]  = 'e.date <= %s';
            $params[] = $date_to . ' 23:59:59';
        }

        $where_sql = implode( ' AND ', $where );

        /*
        * Get bills.
        */
        $sql = "
            SELECT

                e.*,

                c.title AS company_title

            FROM {$events_table} e

            LEFT JOIN {$companies_table} c
                ON c.ID = e.company_id

            WHERE {$where_sql}

            ORDER BY {$orderby_sql} {$order_sql}

            LIMIT %d OFFSET %d
        ";

        $params[] = $per_page;
        $params[] = $offset;

        $results = $wpdb->get_results(
            $wpdb->prepare( $sql, $params ),
            ARRAY_A
        );

        /*
        * Total number of bills.
        */
        $count_sql = "
            SELECT COUNT(*)

            FROM {$events_table} e

            LEFT JOIN {$companies_table} c
                ON c.ID = e.company_id

            WHERE {$where_sql}
        ";

        $count_params = array_slice(
            $params,
            0,
            count( $params ) - 2
        );

        $total = (int) $wpdb->get_var(
            $wpdb->prepare(
                $count_sql,
                $count_params
            )
        );

        return rest_ensure_response(
            [
                'success' => true,
                'data' => $results,

                // 'pagination' => [
                    'page'        => $page,
                    'per_page'    => $per_page,
                    'total'       => $total,
                    'total_pages' => $per_page > 0
                        ? (int) ceil( $total / $per_page )
                        : 0,
                // ],
            ]
        );
    }
}