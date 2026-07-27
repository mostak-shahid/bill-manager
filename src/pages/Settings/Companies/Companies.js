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
import CompanyCreateModal from "./CompanyCreateModal";
import ComapnyDetailsModal from "./ComapnyDetailsModal";
import ComapnyEditModal from "./ComapnyEditModal";

const pathPrefix = 'admin.php?page=bill-manager#'; // Adjust this if your app is served from a different base path
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
        {/* <p><strong>Description:</strong> {data.description}</p> */}
        <p><strong>User Email:</strong> {data.user_email}</p>
        <p><strong>User Agent:</strong> {data.user_agent}</p>
        <p><strong>IP:</strong> {data.ip}</p>
        <p className="show-on-lg"><strong>Category:</strong> {data.user_email}</p>
        <p className="show-on-md"><strong>IP Address :</strong> {data.ip}</p>
        <p className="show-on-sm"><strong>Date:</strong> {data.created_at}</p>
    </div>
);
const formatValue = (val) => {
    if (val === null || val === undefined || val === '' || val == 0) {
        return '';
    }
    if (Array.isArray(val)) {
        return val.join(', ');
    }
    if (typeof val === 'boolean') {
        return val ? 'true' : 'false';
    }
    return val;
};
const Companies = () => {
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
                path: `/bill-manager/v1/companies?${queryString}`,
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
    const handleDelete = async (id) => {
        setDeletinging(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/companies/${id}`,
                method: 'DELETE',
            });
            // console.log(response);
            if (response.success) {
                setDataToast({
                    title: __("Success", "bill-manager"),
                    content: __("Log deleted successfully", "bill-manager"),
                    type: 'success'
                });
                setShowToast(true);
                setReloadTable(Math.random());
            }
        } catch (error) {
            console.error('Error deleting company:', error);
            setDataToast({
                title: __("Error", "bill-manager"),
                content: __("Error deleting company.", "bill-manager"),
                type: 'danger'
            });
            setShowToast(true);
        } finally {
            setDeletinging(false);
        }
    };


    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dataDeleteModal, setDataDeleteModal] = useState([]);

    const modalDeleteClose = () => {
        setBulkAction('any');
        setSelectedRowKeys([]);
        setShowDeleteModal(false);
    }
    const modalDeleteShow = (data) => {
        setDataDeleteModal(data);
        setShowDeleteModal(true);
    }

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
                    path: `/bill-manager/v1/companies/bulk-delete?${queryString}`,
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


    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [dataDetailsModalID, setDataDetailsModalID] = useState(0);
    
    const modalDetailsShow = (data) => {
        setDataDetailsModalID(data?.ID);
        setShowDetailsModal(true);
    }

    const [showEditModal, setShowEditModal] = useState(false);
    const [dataEditModalID, setDataEditModalID] = useState(0);
    
    const modalEditShow = (data) => {
        setDataEditModalID(data?.ID);
        setShowEditModal(true);
    }
    const columns = [
        // { name: 'ID', id: 'ID', selector: row => row.ID, sortable: true },
        { name: 'Title', id: 'title', selector: row => row.title, sortable: true },
        { name: 'Phone', id: 'phone', selector: row => row.phone, sortable: true, omit: true },
        { name: 'Email', id: 'email', selector: row => row.email, sortable: true, hide: 'lg', },
        { name: 'Address', id: 'address', selector: row => row.address, sortable: true, hide: 'lg', },

        {
            name: 'User',
            id: 'user_id',
            // selector: row => row.user_id, 
            cell: (row) => <div><div class="fw-semibold">{row.user_login}</div>ID:({row.user_id})</div>,
            sortable: true
        },
        { name: 'Email', id: 'user_email', selector: row => row.user_email, omit: true },
        { name: 'IP Address', id: 'ip', selector: row => row.ip, sortable: true, omit: true },
        // { name: 'Description', id: 'description', selector: row => row.description, sortable: true, omit: true },
        { name: 'User Agent', id: 'user_agent', selector: row => row.user_agent, sortable: true, omit: true },
        { name: 'Date', id: 'created_at', selector: row => row.created_at, sortable: true, hide: 'sm', },
        {
            name: 'Action',
            cell: (row) => (
                <div className="d-flex gap-1 position-relative">
                    {/* <Button variant="info" size="sm" onClick={() => modalDetailsShow(row)}><FaEye /></Button> */}
                    <Button
                        variant="info"
                        size="sm"
                        as={Link}
                        to={`/settings/companies/${row.ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        <FaEye />
                    </Button>
                    <Button variant="warning" size="sm" onClick={() => modalDetailsShow(row)}><FaEdit /></Button>
                    <Button variant="warning" size="sm" onClick={() => modalEditShow(row)}><FaEdit /></Button>
                    <DeleteButton id={row.ID} onDelete={handleDelete} />
                </div>
            ),
            ignoreRowClick: true,
            pinned: 'right'
        },
    ];

    // Popover visibility state
    const [popoverVisible, setPopoverVisible] = useState(false);
    const toggleVisible = () => {
        if (!deleting) {
            setPopoverVisible((state) => !state);
        }
    };

    // New helper component
    const DeleteButton = ({ id, onDelete }) => {
        const [isVisible, setIsVisible] = useState(false);
        const anchorRef = useRef(null);

        return (
            <>
                <Button ref={anchorRef} variant="danger" size="sm" onClick={() => setIsVisible(true)}>
                    <FaTrash />
                </Button>
                {isVisible && (
                    <Popover anchor={anchorRef.current} onClose={() => setIsVisible(false)}>
                        <div className="p-2" style={{ minWidth: 150 }}>
                            <p className="mb-2">{__('Do you like to delete this row?', 'bill-manager')}</p>
                            <div className="d-flex gap-2">
                                <Button size="sm" variant="danger" onClick={() => { onDelete(id); setIsVisible(false); }}>
                                    {__('Yes', 'bill-manager')}
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsVisible(false)}>
                                    {__('No', 'bill-manager')}
                                </Button>
                            </div>
                        </div>
                    </Popover>
                )}
            </>
        );
    };
    return (
        <>

            <Row className="justify-content-between">
                <Col sm='6' lg='3' className="text-center text-lg-start">
                    <div className="d-flex gap-2 mt-3">
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
                    <Form.Group className="mt-3">
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
                </Col>
                <Col sm='6' lg='3' className="text-center text-lg-end">   
                    <div className="mt-3">
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        {__('Add New', 'bill-manager')}
                    </Button>

                    </div>
                    <Form.Group className="mt-3">
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
                </Col>
            </Row>
            <div ref={containerRef} className="table-wrapper responsive-table-wrapper border mt-3 w-100">
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
                />

            </div>
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
            {dataEditModalID ?
                <ComapnyEditModal show={showEditModal} setShow={setShowEditModal} id={dataEditModalID} setReloadTable={setReloadTable}/>: ''
            }
            {dataDetailsModalID ?
                <ComapnyDetailsModal show={showDetailsModal} setShow={setShowDetailsModal} id={dataDetailsModalID}/> : ''
            }
            <CompanyCreateModal show={showCreateModal} setShow={setShowCreateModal} setReloadTable={setReloadTable}/>

            <ToastControl
                show={showToast}
                onClose={toggleShowToast}
                data={dataToast}
            />
        </>
    );
};

export default Companies;