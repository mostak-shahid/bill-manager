import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import { Popover } from '@wordpress/components';

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import DataTable from 'react-data-table-component';
import { useWindowWidth } from '../../../lib/Helpers';
import '../Logs/ResponsiveTable.css';
import { ToastControl } from "../../../components";

export default function CompanyPayments({ id = 0 }) {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('any');
    const [dateRange, setDateRange] = useState([]);
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRowIDs, setSelectedRowIDs] = useState([]);
    const [bulkAction, setBulkAction] = useState('any');
    const [reloadTable, setReloadTable] = useState(0);
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                per_page: pageSize,
                search: search,
                filter,
                sort_field: sortField,
                sort_order: sortOrder,
            });

            if (dateRange && dateRange.length === 2) {
                const formatDate = (date) => {
                    const d = new Date(date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                const startDate = formatDate(dateRange[0]);
                const endDate = formatDate(dateRange[1]);
                // console.log('Adding date range:', startDate, endDate);
                params.append('date_from', startDate);
                params.append('date_to', endDate);
            }

            const queryString = params.toString();
            // console.log('Fetching companies with params:', queryString);

            const response = await apiFetch({
                path: `/bill-manager/v1/company/${id}/payments?${queryString}`,
            });
            setData(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, [
        page,
        pageSize,
        search,
        filter,
        dateRange,
        sortField,
        sortOrder,
        reloadTable,
        id,
    ]);

    const columns = [
        { name: '#', id: 'id', selector: row => row.ID, sortable: true },
        // { name: 'Company', id: 'c.title', selector: row => row.company, sortable: false, pinned: 'left' },
        { name: 'Bill No', id: 'bill_no', selector: row => row.bill_no, sortable: true, hide: 'sm' },
        { name: 'Type', id: 'type', selector: row => row.type, sortable: true, hide: 'sm' },
        { name: 'Paid', id: 'amount', selector: row => row.amount, sortable: true, hide: 'md', },
        { name: 'Paid By', id: 'paid_by', selector: row => row.paid_by, sortable: true, hide: 'md', },
        { name: 'Date', id: 'date', selector: row => row.date, sortable: true, hide: 'md', },
    ];
    /*
    {
{
    "id": 1,
    "payment_id": "PAY-00001",
    "bill_no": "bill-xyz123abc",
    "company": "ABC Company",
    "type": "Purchase",
    "amount": "50000.00",
    "paid_by": "",
    "date": "2026-08-10 00:00:00"
}
}
    */
    return (
        <>
            {console.log('Rendering CompanyPayments with data:', data)}
            {!loading &&  (
                <>
                <span className="text-muted">{__('No bills found for this company.', 'bill-manager')}</span>
                <DataTable
                    // keyField="ID"
                    columns={columns}
                    data={data}
                // selectableRows
                // selectedRows={selectedRowKeys}
                // // onSelectedRowsChange={({ selectedRows }) => setSelectedRowKeys(selectedRows)}
                // onSelectedRowsChange={({ selectedRows }) => {
                //     const rows = selectedRows;
                //     const keys = selectedRows.map(row => row.ID);
                //     setSelectedRowKeys(rows);
                //     setSelectedRowIDs(keys);
                // }}
                // pagination
                // highlightOnHover
                // // dense

                // paginationServer
                // paginationTotalRows={total}
                // onChangePage={(page) => setPage(page)}
                // sortServer
                // onSort={(column, sortDirection) => {
                //     // setSortField(column.id.toLowerCase().replace(' ', ''));
                //     setSortField(column.id);
                //     setSortOrder(sortDirection);
                // }}

                // expandableRows={hasHiddenColumns} // Turns off the expander logic entirely if on desktop
                // expandableRowDisabled={row => !hasHiddenColumns} // Hides the ">" arrow icon dynamically per row
                // expandableRowsComponent={ExpandedComponent}
                // responsive
                // resizable
                // conditionalRowStyles={conditionalRowStyles}
                // customStyles={customStyles}
                />
                </>
            )}

        </>
    )
}
