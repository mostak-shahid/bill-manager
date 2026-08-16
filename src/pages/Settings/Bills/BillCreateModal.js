import { __ } from "@wordpress/i18n";
import { useState, useEffect, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Row, Col, Button, Modal, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { SortableAccordion, ToastControl } from "../../../components";

export default function BillCreateModal({ show, setShow, setReloadTable }) {
    // const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [companyId, setCompanyId] = useState('');

    const [billNo, setBillNo] = useState('');
    const [billType, setBillType] = useState('purchase');/*purchase, sell*/
    const [billDate, setBillDate] = useState('');

    const [discount, setDiscount] = useState(0);
    const [ait, setAit] = useState(0);
    const [tax, setTax] = useState(0);
    const [vat, setVat] = useState(0);
    const [shipping, setShipping] = useState(0);

    const [status, setStatus] = useState(1);
    const [notes, setNotes] = useState('');

    const [billItems, setBillItems] = useState([]);
    const billTotal = useMemo(() => {
        const subtotal = (billItems || []).reduce((acc, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unit_price) || 0;
            return acc + (qty * price);
        }, 0);

        const total = subtotal +
            parseFloat(shipping || 0) +
            parseFloat(tax || 0) +
            parseFloat(vat || 0) +
            parseFloat(ait || 0) -
            parseFloat(discount || 0);

        return Math.max(0, total);
    }, [billItems, discount, ait, tax, vat, shipping]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/all-companies`,
            });
            setCompanies(response.data || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCompanies();
    }, []);

    const [products, setProducts] = useState({});
    const [loadingProducts, setLoadingProducts] = useState(false);
    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/products`,
            });
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };
    useEffect(() => {
        fetchProducts();
    }, []);

    const [units, setUnits] = useState({});
    const [loadingUnits, setLoadingUnits] = useState(false);
    const fetchUnits = async () => {
        setLoadingUnits(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/units`,
            });
            setUnits(response.data || []);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoadingUnits(false);
        }
    };
    useEffect(() => {
        fetchUnits();
    }, []);


    const [showToast, setShowToast] = useState(false);
    const [dataToast, setDataToast] = useState({ title: '', content: '', type: 'success' });
    const toggleShowToast = () => setShowToast(!showToast);

    const [processing, setProcessing] = useState(false);
    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        const form = event.currentTarget;

        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        setValidated(true);
        handleForm();
    };
    const handleForm = async () => {

        if (companyId && companyId.trim() !== '') {
            setProcessing(true);
            try {
                const result = await apiFetch({
                    path: "/bill-manager/v1/bill",
                    method: "POST",
                    data: {
                        company_id: companyId,
                        bill_no: billNo,
                        bill_type: billType,
                        bill_date: billDate,

                        discount: discount,
                        ait: ait,
                        tax: tax,
                        vat: vat,
                        shipping: shipping,
                        status: status,
                        notes: notes,
                        bill_items: billItems,
                    },
                    headers: {
                        'X-WP-Nonce': bill_manager_ajax_obj.api_nonce
                    }
                });
                // console.log(result);
                if (result.success) {
                    setValidated(false);
                    setCompanyId('');
                    setBillNo('');
                    setBillType('purchase');
                    setBillDate('');
                    setDiscount(0);
                    setAit(0);
                    setTax(0);
                    setVat(0);
                    setShipping(0);
                    setStatus(1);
                    setNotes('');
                    setBillItems([]);
                    setDataToast({
                        title: __("Success", "bill-manager"),
                        content: __("Company created successfully!", "bill-manager"),
                        type: 'success'
                    });
                    setShowToast(true);
                    handleClose();
                    setReloadTable(Math.random());
                }

            } catch (error) {
                console.error("Company creating Error:", error);
                setDataToast({
                    title: __("Error", "bill-manager"),
                    content: __("Please try again!", "bill-manager"),
                    type: 'danger'
                });
                setShowToast(true);
            } finally {
                setProcessing(false);
            }
        } else {
            setDataToast({
                title: __("Warning", "bill-manager"),
                content: __("Title is required", "bill-manager"),
                type: 'warning'
            });
            setShowToast(true);
        }
    };


    return (
        <>
            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{__('Create Bill', 'bill-manager')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="company_id"
                                    label={__('Company Name', 'bill-manager')}
                                    className="mb-3"
                                >
                                    {!loading ? (
                                        <Form.Select
                                            aria-label="Default select example"
                                            value={companyId || ''}
                                            onChange={(e) => setCompanyId(e.target.value)}
                                            required
                                        >
                                            <option value="">Open this select menu</option>
                                            {
                                                companies.map((company) => (
                                                    <option key={company.ID} value={company.ID}>
                                                        {company.title}
                                                    </option>
                                                ))
                                            }
                                        </Form.Select>
                                    ) : (
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    )}


                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="bill_no"
                                    label={__('Bill No', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="text"
                                        placeholder={__('Bill No', 'bill-manager')}
                                        value={billNo}
                                        onChange={(e) => setBillNo(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="bill_type"
                                    label={__('Bill Type', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Select
                                        aria-label="Default select example"
                                        value={billType || ''}
                                        onChange={(e) => setBillType(e.target.value)}
                                    >
                                        <option value="">Open this select menu</option>
                                        {
                                            [
                                                { 'value': 'purchase', 'label': 'Purchase' },
                                                { 'value': 'sale', 'label': 'Sale' },
                                            ].map(({ value, label }) => (
                                                <option
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>

                                <FloatingLabel
                                    controlId="bill_date"
                                    label={__('Bill Date', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="date"
                                        placeholder={__('Bill Date', 'bill-manager')}
                                        value={billDate}
                                        onChange={(e) => setBillDate(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="discount"
                                    label={__('Discount', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="number"
                                        placeholder={__('Discount', 'bill-manager')}
                                        value={discount}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => setDiscount(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>

                                <FloatingLabel
                                    controlId="ait"
                                    label={__('AIT', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="number"
                                        placeholder={__('AIT', 'bill-manager')}
                                        value={ait}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => setAit(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="tax"
                                    label={__('Tax', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="number"
                                        placeholder={__('Tax', 'bill-manager')}
                                        value={tax}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => setTax(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="vat"
                                    label={__('VAT', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="number"
                                        placeholder={__('VAT', 'bill-manager')}
                                        value={vat}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => setVat(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="shipping"
                                    label={__('Shipping', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="number"
                                        placeholder={__('Shipping', 'bill-manager')}
                                        value={shipping}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => setShipping(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="notes"
                                    label={__('Notes', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder={__('Notes', 'bill-manager')}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <datalist id="products">
                            {
                                products.length > 0 && products.map((title, index) =>                                
                                    <option key={index} value={title}/>
                                )
                            }
                        </datalist>
                        <datalist id="units">
                            {
                                units.length > 0 && units.map((title, index) =>                                
                                    <option key={index} value={title}/>
                                )
                            }
                        </datalist>
                        <SortableAccordion
                            name='bill_items'
                            options={{
                                addButton: __('Add New Item', 'bill-manager'),
                                titlePrefix: __('Item', 'bill-manager'),
                                enabler: true,
                            }}
                            fields={[
                                { type: "input", name: "title", placeholder: __('Title', 'bill-manager'), className: "input-field", label: __('Title', 'bill-manager'), attributes: { 'required': true, 'list': "products" } },
                                { type: "input", name: "quantity", placeholder: __('Quantity', 'bill-manager'), className: "input-field", label: __('Quantity', 'bill-manager'), attributes: { 'type': 'number', min: 1, 'required': true } },
                                { type: "input", name: "unit", placeholder: __('Unit', 'bill-manager'), className: "input-field", label: __('Unit', 'bill-manager'), attributes: { 'required': true, 'list': "units"  } },
                                { type: "input", name: "unit_price", placeholder: __('Unit Price', 'bill-manager'), className: "input-field", label: __('Unit Price', 'bill-manager'), attributes: { 'type': 'number', min: 1, 'required': true } },
                            ]}
                            defaultValues={billItems}
                            onChange={(value) => setBillItems(value)}
                            className="bills-accordion"
                        />
                        <div className="d-flex justify-content-between align-items-center p-3 border rounded-2 mb-3">
                            <strong>{__('Total', 'bill-manager')}:</strong>
                            <span>{billTotal.toFixed(2)}</span>
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    /> {__('Creating...', 'bill-manager')}
                                </>
                            ) : (
                                <>
                                    <FaTelegramPlane /> {__('Create', 'bill-manager')}
                                </>
                            )}
                        </Button>

                    </Form>
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
