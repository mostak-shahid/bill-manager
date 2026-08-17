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
import PersonCreateModal from "./PersonCreateModal";

const timeFilterOptions = [
    { label: __('All Time', 'bill-manager'), value: 'any' },
    { label: __('Today', 'bill-manager'), value: 'today' },
    { label: __('Last 7 Days', 'bill-manager'), value: 'week' },
    { label: __('This Month', 'bill-manager'), value: 'month' },
];
const bulkActions = [
    { label: __('Bulk Action', 'bill-manager'), value: 'any' },
    { label: __('Delete', 'bill-manager'), value: 'delete' },
];

// 2. Define the Expanded Component to show hidden column data on mobile
const ExpandedComponent = ({ data }) => (
    <div className="expanded-row-container">

        <p><strong>Notes:</strong>{data.notes}</p>
        {/* <p><strong>User ID:</strong> ({data.user_id})</p>
        <p><strong>User Email:</strong> {data.user_email}</p>
        <p><strong>User Agent:</strong> {data.user_agent}</p>
        <p><strong>User IP:</strong> {data.ip}</p>
        
        <p className="show-on-lg"><strong>Company Address:</strong> {data.address}</p>
        <p className="show-on-md"><strong>Company Email :</strong> {data.email}</p>
        <p className="show-on-sm"><strong>Company Phone:</strong> {data.phone}</p>
        <p className="show-on-sm"><strong>Created Date:</strong> {data.created_at}</p> */}
    </div>
);

export default function Persons() {
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
                path: `/bill-manager/v1/persons?${queryString}`,
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
    ]);

    const columns = [
        // { name: 'ID', id: 'id', selector: row => row.ID, sortable: true },
        { name: 'Name', id: 'title', selector: row => row.title, sortable: true, pinned: 'left' },
        { name: 'Designation', id: 'designation', selector: row => row.designation, sortable: true, hide: 'sm' },
        { name: 'Phone', id: 'phone', selector: row => row.phone, sortable: true, hide: 'sm' },
        { name: 'Email', id: 'email', selector: row => row.email, sortable: true, hide: 'sm' },
        { name: 'Company', id: 'company_title', selector: row => row.company_title, sortable: true, hide: 'sm' },
        {
            name: 'Action',
            cell: (row) => (
                <div className="d-flex gap-1 position-relative">
                    {/* <Button variant="info" size="sm" onClick={() => modalDetailsShow(row)}><FaEye /></Button> */}
                    {/* <Button
                        variant="info"
                        size="sm"
                        as={Link}
                        to={`/settings/companies/${row.ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        <FaEye />
                    </Button> */}
                    <Button
                        variant="info"
                        size="sm"
                        // onClick={() => modalDetailsShow(row)}
                    >
                        <FaEye />
                    </Button>
                    <Button
                        variant="warning"
                        // size="sm" onClick={() => modalEditShow(row)}
                    >
                        <FaEdit />
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
            pinned: 'right'
        },
    ];
    /*
{
  "ID": "1",
  "user_id": "1",
  "ip": "::1",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "company_id": "1",

  "title": "MR. Some one",
  "designation": "CEO",
  "phone": "0123456789",
  "email": "test@gmail.com",
  "notes": "",
  "created_at": "2026-08-17 12:38:02",
  "updated_at": "2026-08-17 12:38:02",
  "company_title": "Reprehenderit in voluptate velit"
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
    const [showPersonModal, setShowPersonModal] = useState(false);
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
                            className="ms-2"
                            variant="outline-primary"
                            onClick={() => setShowPersonModal(true)}
                        >
                            {__('Add Person', 'bill-manager')}
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
            <PersonCreateModal show={showPersonModal} setShow={setShowPersonModal} setReloadTable={setReloadTable} />
        </>
    )
}
