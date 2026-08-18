import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Popover } from '@wordpress/components';
import { Row, Col, Form, Button, Badge, Modal, Table, OverlayTrigger, Dropdown } from 'react-bootstrap';

import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import DataTable from 'react-data-table-component';
import { useWindowWidth } from '../../../lib/Helpers';
import '../Logs/ResponsiveTable.css';
import { ToastControl } from "../../../components";

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
const ExpandedComponent = ({ data }) => (
    <div className="expanded-row-container">

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
export default function CompanyBills({ id = 0 }) {

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
                path: `/bill-manager/v1/company/${id}/bills?${queryString}`,
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
        { name: '#', id: 'ID', selector: row => row.ID, sortable: true },
        // { name: 'Company', id: 'c.title', selector: row => row.company, sortable: false, pinned: 'left' },
        { name: 'Bill No', id: 'bill_no', selector: row => row.bill_no, sortable: true, hide: 'sm' },
        { name: 'Amount', id: 'amount', selector: row => row.amount, sortable: true, hide: 'sm' },
        { name: 'Type', id: 'type', selector: row => row.type, sortable: true, hide: 'sm' },
        { name: 'Paid', id: 'paid', selector: row => row.paid, sortable: true, hide: 'md', },
        { name: 'Status', id: 'status', selector: row => row.status, sortable: true, hide: 'md', },
        { name: 'Date', id: 'date', selector: row => row.date, sortable: true, hide: 'md', },
    ];


    const handleBulkAction = () => {
        console.log('selectedRowIDs: ', selectedRowIDs, 'bulkAction: ', bulkAction);
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const modalDeleteClose = () => {
        setBulkAction('any');
        setSelectedRowKeys([]);
        setSelectedRowIDs([]);
        setShowDeleteModal(false);
    }
    const modalDeleteShow = (data) => {
        setDataDeleteModal(data);
        setShowDeleteModal(true);
    }

    const [deleting, setDeletinging] = useState(false);
    const deleteRows = async () => {
        // console.log(selectedRowKeys);
        if (selectedRowKeys.length) {
            const ids = selectedRowKeys.map(row => row.ID);
            console.log(ids);
            setDeletinging(true);
            try {
                const params = new URLSearchParams({
                    ids: ids,
                    // action: bulkAction,
                });
                const queryString = params.toString();
                const response = await apiFetch({
                    path: `/bill-manager/v1/bills/bulk-delete?${queryString}`,
                    method: 'DELETE',
                });
                if (response.success) {
                    setDataToast({
                        title: __("Success", "bill-manager"),
                        content: __("Logs deleted successfully", "bill-manager"),
                        type: 'success'
                    });
                    setShowDeleteModal(false);
                    setShowToast(true);
                    setReloadTable(Math.random());
                }

            } catch (error) {
                console.error('Error deleting companies:', error);
                setDataToast({
                    title: __("Error", "bill-manager"),
                    content: __("Error deleting companies.", "bill-manager"),
                    type: 'danger'
                });
                setShowToast(true);
            } finally {
                setDeletinging(false);
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
    return (
        <>
            {!loading && (
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
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                                        {__('Actions', 'bill-manager')}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => setShowCreateModal(true)}>{__('Add Company', 'bill-manager')}</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setShowPersonModal(true)}>{__('Add Persion', 'bill-manager')}</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setShowEventModal(true)}>{__('Add Event', 'bill-manager')}</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setShowBillModal(true)}>{__('Add Bill', 'bill-manager')}</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setShowPaymentModal(true)}>{__('Add Payment', 'bill-manager')}</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
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
                </>
            )}

            <Modal size="sm" centered show={showDeleteModal} onHide={modalDeleteClose}>
                <Modal.Body>
                    <p className="mb-2">{__('Are you sure you want to delete these rows? This action cannot be undone.', 'bill-manager')}</p>
                    <div className="d-flex gap-2">
                        <Button size="sm" variant="danger" onClick={deleteRows}>
                            {__('Yes', 'bill-manager')}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={modalDeleteClose}>
                            {__('No', 'bill-manager')}
                        </Button>
                    </div>

                </Modal.Body>
            </Modal>
            <ToastControl
                show={showToast}
                onClose={toggleShowToast}
                data={dataToast}
            />

        </>
    )
}
