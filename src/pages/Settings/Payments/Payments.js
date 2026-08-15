import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Button, Badge, Modal, Table, OverlayTrigger } from 'react-bootstrap';
import { Popover } from '@wordpress/components';

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import DataTable from 'react-data-table-component';
import { useWindowWidth } from '../../../lib/Helpers';
import '../Logs/ResponsiveTable.css';
import { ToastControl } from "../../../components";

import PaymentCreateModal from './PaymentCreateModal'
import './Payments.css'

const timeFilterOptions = [
    { label: __('All Time', 'bill-manager'), value: 'any' },
    { label: __('Today', 'bill-manager'), value: 'today' },
    { label: __('This Week', 'bill-manager'), value: 'week' },
    { label: __('This Month', 'bill-manager'), value: 'month' },
];
const bulkActions = [
    { label: __('Bulk Action', 'bill-manager'), value: 'any' },
    { label: __('Delete', 'bill-manager'), value: 'delete' },
];

// 2. Define the Expanded Component to show hidden column data on mobile
const ExpandedComponent = ({ data }) => (
    <div className="expanded-row-container">
        <p><strong>{__('Notes:', 'bill-manager')}</strong> {data.notes}</p>
        <p><strong>{__('Reference No:', 'bill-manager')}</strong> {data.reference_no}</p>
        {/* <p><strong>User Name:</strong> <strong>{data.user_name}</strong>ID:({data.user_id})</p>
        <p><strong>User ID:</strong> ({data.user_id})</p>
        <p><strong>User Email:</strong> {data.user_email}</p>
        <p><strong>User Agent:</strong> {data.user_agent}</p>
        <p><strong>User IP:</strong> {data.ip}</p>
        
        <p className="show-on-lg"><strong>Company Address:</strong> {data.address}</p>
        <p className="show-on-md"><strong>Company Email :</strong> {data.email}</p>
        <p className="show-on-sm"><strong>Company Phone:</strong> {data.phone}</p>
        <p className="show-on-sm"><strong>Created Date:</strong> {data.created_at}</p> */}
    </div>
);

export default function Payments() {

    const { settings, settingsLoading, handleChange } = useOutletContext();
    // Add this inside your component
    const containerRef = useRef(null);

    const width = useWindowWidth();
    // const hasHiddenColumns = width <= 1279; 
    const hasHiddenColumns = true;

    // Toast configuration states
    const [showToast, setShowToast] = useState(false);
    const [dataToast, setDataToast] = useState({ title: '', content: '', type: 'success' });
    const toggleShowToast = () => setShowToast(!showToast);

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

    const [deleting, setDeletinging] = useState(false);

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
                path: `/bill-manager/v1/payments?${queryString}`,
            });
            setData(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Error fetching payments:', error);
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
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);


    const columns = [
        // { name: '#', id: 'id', selector: row => row.ID, sortable: true },
        { name: 'Company', id: 'company_title', selector: row => row.company_title, sortable: true, pinned: 'left' },
        { name: 'Bill No', id: 'bill_no', selector: row => row.bill_no, sortable: true, hide: 'sm' },
        { name: 'Bill Type', id: 'bill_type', selector: row => row.bill_type, sortable: true, hide: 'sm' },
        { name: 'Paid', id: 'paid_amount', selector: row => row.paid_amount, sortable: true, hide: 'md', },
        { name: 'Paid By', id: 'c.email', selector: row => row.paid_by, sortable: true, hide: 'md', },
        { name: 'Created At', id: 'c.address', selector: row => row.created_at, sortable: true, hide: 'lg', },

        // {
        //     name: 'User',
        //     id: 'user_id',
        //     // selector: row => row.user_id, 
        //     cell: (row) => <div><span class="fw-semibold">{row.user_login}</span>ID:({row.user_id})</div>,
        //     sortable: true,
        //     omit: true
        // },
        // { name: 'Email', id: 'user_email', selector: row => row.user_email, omit: true },
        // { name: 'IP Address', id: 'ip', selector: row => row.ip, sortable: true, omit: true },
        // // { name: 'Description', id: 'description', selector: row => row.description, sortable: true, omit: true },
        // { name: 'User Agent', id: 'user_agent', selector: row => row.user_agent, sortable: true, omit: true },
        // { name: 'Added', id: 'c.created_at', selector: row => row.created_at, sortable: true, hide: 'sm'},
        // {
        //     name: 'Action',
        //     cell: (row) => (
        //         <div className="d-flex gap-1 position-relative">
        //             {/* <Button variant="info" size="sm" onClick={() => modalDetailsShow(row)}><FaEye /></Button> */}
        //             {/* <Button
        //                 variant="info"
        //                 size="sm"
        //                 as={Link}
        //                 to={`/settings/companies/${row.ID}`}
        //                 target="_blank"
        //                 rel="noopener noreferrer"
        //                 >
        //                 <FaEye />
        //             </Button> */}
        //             <Button variant="info" size="sm" onClick={() => modalDetailsShow(row)}><FaEye /></Button>
        //             <Button variant="warning" size="sm" onClick={() => modalEditShow(row)}><FaEdit /></Button>
        //             <DeleteButton id={row.ID} onDelete={handleDelete} />
        //         </div>
        //     ),
        //     ignoreRowClick: true,
        //     pinned: 'right'
        // },
    ];
    /*
    | Payment ID | Bill No. | Company | Type | Amount | Method | Paid By | Date | Actions |
| ---------- | -------- | ------- | ---- | -----: | ------ | ------- | ---- | ------- |

    {
        "ID": 4,
        "user_id": "1",
        "ip": "::1",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        "bill_id": 2,
        "payment_date": "2026-08-20 00:00:00",
        "paid_amount": "3000.00",
        "paid_by": "Md. Mostak Shahid",
        "reference_no": "ABC 112",
        "notes": "Kono notes nai",
        "created_at": "2026-08-14 18:22:59",
        "updated_at": "2026-08-14 18:22:59",
        "company": {
            "id": 0,
            "title": "Toto Company"
        },
        "bill": {
            "id": 2,
            "no": "bill-xyz123toto",
            "type": "purchase"
        }
    }
    */
    const handleBulkAction = () => {
        // console.log('selectedRowIDs: ', selectedRowIDs, 'bulkAction: ', bulkAction);
        if (selectedRowKeys.length) {
            if (bulkAction == 'delete') {
                setShowDeleteModal(true);
            } else {
                setDataToast({
                    title: __("Error", "bill-manager"),
                    content: __("Please select an action.", "bill-manager"),
                    type: 'danger'
                });
                setShowToast(true);
            }
        } else {
            setDataToast({
                title: __("Error", "bill-manager"),
                content: __("Please select rows.", "bill-manager"),
                type: 'danger'
            });
            setShowToast(true);
        }
    }

    const conditionalRowStyles = [
        {
            when: row => row.balance_type === 'receivable',
            style: { backgroundColor: '#d4edda' }, // Light Green
        },
        {
            when: row => row.balance_type === 'payable',
            style: { backgroundColor: '#f8d7da' }, // Light Red
        },
        {
            when: row => row.balance_type === 'settled',
            style: { backgroundColor: '#ffffff' }, // Light Gray
        },
    ];
    return (
        <>

            <div className="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center gap-3">
                <div className="text-center text-lg-start order-1 order-lg-0" style={{ width: '100%', maxWidth: 350 }}>
                    <div className="mt-1 mt-lg-3">
                        <div className="d-flex justify-content-center justify-content-lg-start align-items-start gap-2" style={{ height: 38 }}>
                            {timeFilterOptions.map(({ value, label }) => (
                                <Badge
                                    bg={value == filter ? "dark" : "secondary"}
                                    // text={value == filter ? "light" : "dark"}
                                    onClick={() => setFilter(value)}
                                    role="button"
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-center text-lg-end order-0 order-lg-1" style={{ width: '100%', maxWidth: 350 }}>
                    <div className="mt-1 mt-lg-3">                        
                        <Button
                            variant="outline-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            {__('Add New', 'bill-manager')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center gap-3">
                <div className="text-center text-lg-start" style={{ width: '100%', maxWidth: 350 }}>
                    <Form.Group className="mt-1 mt-lg-3">
                        <div className="d-flex align-items-stretch gap-2">
                            <Form.Select
                                value={bulkAction}
                                onChange={(e) => setBulkAction(e.target.value)}
                            >
                                {
                                    bulkActions.map(({ value, label }) => (
                                        <option
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    ))}
                            </Form.Select>
                            <Button
                                variant="outline-secondary"
                                onClick={handleBulkAction}
                            >
                                {__('Apply', 'bill-manager')}
                            </Button>
                        </div>
                    </Form.Group>
                </div>
                <div className="text-center text-lg-end" style={{ width: '100%', maxWidth: 350 }}>
                    <Form.Group className="mt-1 mt-lg-3">
                        <div className="d-flex align-items-stretch gap-2">
                            <Form.Control
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button
                                variant="outline-secondary"
                            >
                                {__('Search', 'bill-manager')}
                            </Button>
                        </div>

                    </Form.Group>
                </div>
            </div>

            <div ref={containerRef} className="table-wrapper responsive-table-wrapper border mt-3">
                <DataTable
                    keyField="ID"
                    columns={columns}
                    data={data}
                    selectableRows
                    selectedRows={selectedRowKeys}
                    // onSelectedRowsChange={({ selectedRows }) => setSelectedRowKeys(selectedRows)}
                    onSelectedRowsChange={({ selectedRows }) => {
                        const rows = selectedRows;
                        const keys = selectedRows.map(row => row.ID);
                        setSelectedRowKeys(rows);
                        setSelectedRowIDs(keys);
                    }}
                    pagination
                    highlightOnHover
                    // dense

                    paginationServer
                    paginationTotalRows={total}
                    onChangePage={(page) => setPage(page)}
                    sortServer
                    onSort={(column, sortDirection) => {
                        // setSortField(column.id.toLowerCase().replace(' ', ''));
                        setSortField(column.id);
                        setSortOrder(sortDirection);
                    }}

                    expandableRows={hasHiddenColumns} // Turns off the expander logic entirely if on desktop
                    expandableRowDisabled={row => !hasHiddenColumns} // Hides the ">" arrow icon dynamically per row
                    expandableRowsComponent={ExpandedComponent}
                    responsive
                    resizable
                    conditionalRowStyles={conditionalRowStyles}
                // customStyles={customStyles}
                />

            </div>
            <PaymentCreateModal show={showCreateModal} setShow={setShowCreateModal} setReloadTable={setReloadTable} />

            <ToastControl
                show={showToast}
                onClose={toggleShowToast}
                data={dataToast}
            />
        </>
    )
}
