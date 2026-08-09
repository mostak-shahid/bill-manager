import { __ } from "@wordpress/i18n";
import { useState, useEffect, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Row, Col, Button, Modal, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { SortableAccordion, ToastControl } from "../../../components";

export default function PaymentCreateModal({ show, setShow, setReloadTable }) {
    // const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const [billID, setBillID] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);
    const [referenceNo, setReferenceNo] = useState('');
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);

    const [bills, setBills] = useState([]);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/all-bills`,
            });
            setBills(response.data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBills();
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

        if (billID && billID.trim() !== '') {
            setProcessing(true);
            try {
                const result = await apiFetch({
                    path: "/bill-manager/v1/bill",
                    method: "POST",
                    data: {
                        bill_id: billID,
                        payment_date: paymentDate,
                        paid_amount: paidAmount,
                        reference_no: referenceNo,
                        notes: notes,

                    },
                    headers: {
                        'X-WP-Nonce': bill_manager_ajax_obj.api_nonce
                    }
                });
                // console.log(result);
                if (result.success) {
                    setValidated(false);
                    setBillID('');
                    setPaymentDate('');
                    setPaidAmount('');
                    setReferenceNo('');
                    setNotes('');

                    setDataToast({
                        title: __("Success", "bill-manager"),
                        content: __("Payment created successfully!", "bill-manager"),
                        type: 'success'
                    });
                    setShowToast(true);
                    handleClose();
                    setReloadTable(Math.random());
                }

            } catch (error) {
                console.error("Payment creating Error:", error);
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
                content: __("Bill ID is required", "bill-manager"),
                type: 'warning'
            });
            setShowToast(true);
        }
    };


    return (
        <>
            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{__('Create Payment', 'bill-manager')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="bill_id"
                                    label={__('Bill ID', 'bill-manager')}
                                    className="mb-3"
                                >
                                    {!loading ? (
                                        <Form.Select
                                            aria-label="Default select example"
                                            value={billID || ''}
                                            onChange={(e) => setBillID(e.target.value)}
                                            required
                                        >
                                            <option value="">Open this select menu</option>
                                            {
                                                bills.map((bill) => (
                                                    <option key={bill.ID} value={bill.ID}>
                                                        {bill.bill_no}
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
                                    controlId="payment_date"
                                    label={__('Payment Date', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="date"
                                        placeholder={__('Payment Date', 'bill-manager')}
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="paid_amount"
                                    label={__('Paid Amount', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="number"
                                        placeholder={__('Paid Amount', 'bill-manager')}
                                        value={paidAmount}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>

                                <FloatingLabel
                                    controlId="reference_no"
                                    label={__('Reference No', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="text"
                                        placeholder={__('Reference No', 'bill-manager')}
                                        value={referenceNo}
                                        onChange={(e) => setReferenceNo(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                
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
