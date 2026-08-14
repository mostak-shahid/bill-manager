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

import BillCreateModal from './BillCreateModal'
import './Bills.css'
import PaymentCreateModal from "../Payments/PaymentCreateModal";

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

export default function Bills() {
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

    const [showBillCreateModal, setShowBillCreateModal] = useState(false);
    const [showPaymentCreateModal, setShowPaymentCreateModal] = useState(false);

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
    return (
        <>

                    <div className="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center gap-3">
                        <div className="text-center text-lg-start order-1 order-lg-0" style={{width: '100%', maxWidth: 350}}>
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
                        <div className="text-center text-lg-end order-0 order-lg-1" style={{width: '100%', maxWidth: 350}}>
                            <div className="mt-1 mt-lg-3">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setShowBillCreateModal(true)}
                                >
                                    {__('Add Bill', 'bill-manager')}
                                </Button>
                                <Button
                                    className="ms-2"
                                    variant="outline-primary"
                                    onClick={() => setShowPaymentCreateModal(true)}
                                >
                                    {__('Add Payment', 'bill-manager')}
                                </Button>                            
                            </div>
                        </div>
                    </div>
        
                    <div className="d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center gap-3">
                        <div className="text-center text-lg-start" style={{width: '100%', maxWidth: 350}}>                    
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
                        <div className="text-center text-lg-end" style={{width: '100%', maxWidth: 350}}>
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

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>{__('Bill No.', 'bill-manager')}</th>
                        <th>{__('Company', 'bill-manager')}</th>
                        <th>{__('Type', 'bill-manager')}</th>
                        <th>{__('Amount', 'bill-manager')}</th>
                        <th>{__('Paid', 'bill-manager')}</th>
                        <th>{__('Balance', 'bill-manager')}</th>
                        <th>{__('Status', 'bill-manager')}</th>
                        <th>{__('Date', 'bill-manager')}</th>
                        <th>{__('Actions', 'bill-manager')}</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{__('Bill No.', 'bill-manager')}</td>
                        <td>{__('Company', 'bill-manager')}</td>
                        <td>{__('Type', 'bill-manager')}</td>
                        <td>{__('Amount', 'bill-manager')}</td>
                        <td>{__('Paid', 'bill-manager')}</td>
                        <td>{__('Balance', 'bill-manager')}</td>
                        <td>{__('Status', 'bill-manager')}</td>
                        <td>{__('Date', 'bill-manager')}</td>
                        <td>{__('Actions', 'bill-manager')}</td>
                    </tr>
                </tbody>
            </Table>
            <BillCreateModal show={showBillCreateModal} setShow={setShowBillCreateModal} setReloadTable={setReloadTable} />
            <PaymentCreateModal show={showPaymentCreateModal} setShow={setShowPaymentCreateModal} setReloadTable={setReloadTable} />
        </>
    )
}
