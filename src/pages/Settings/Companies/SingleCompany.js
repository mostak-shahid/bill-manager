import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useParams } from "react-router-dom";
import { useWindowWidth } from '../../../lib/Helpers';
import '../Logs/ResponsiveTable.css';
import { ToastControl } from "../../../components";
export default function SingleCompany() {
    // The key names must match the route path parameter (:id)
    const { id } = useParams();
    // Add this inside your component
    const containerRef = useRef(null);

    const width = useWindowWidth();
    // const hasHiddenColumns = width <= 1279; 
    const hasHiddenColumns = true;
    const [company, setCompany] = useState([]);
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

    useEffect(() => {
        const fetchCompany = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    id
                });
                const result = await apiFetch({
                    // path: `/bill-manager/v1/company?${params.toString()}`,
                    path: `/bill-manager/v1/company/${id}`,
                    method: 'GET'
                });
                setCompany(result?.data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

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
        // fetchData();
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

    return (
        !loading &&  
        <div className="single-company">
            <div className="text-center">
                <h2 className="title">{company?.title}</h2>
                <div className="phone">{company.phone}</div>
                <div className="email">{company.email}</div>
                <div className="address">{company.address}</div>
            </div>
            Orders will be shown below
            <p>Now viewing details for Company ID: <strong>{id}</strong></p>
        </div>
    )
}
