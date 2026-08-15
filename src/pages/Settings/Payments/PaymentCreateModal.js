import { __ } from "@wordpress/i18n";
import { useState, useEffect, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Row, Col, Button, Modal, Form, FloatingLabel, Spinner, Table } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { SortableAccordion, ToastControl } from "../../../components";

export default function PaymentCreateModal({ show, setShow, setReloadTable }) {
    // const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [billID, setBillID] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);
    const [paidBy, setPaidBy] = useState('');
    const [referenceNo, setReferenceNo] = useState('');
    const [notes, setNotes] = useState('');
    /*
    bill_id bigint(20) unsigned NOT NULL,
    payment_date datetime NOT NULL,
    paid_amount decimal(12,2) NOT NULL,
    paid_by varchar(255) NULL,

    reference_no varchar(100) NULL,

    notes text NULL,
    */

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


    const [loadingInfo, setLoadingInfo] = useState(false);
    const [billInfo, setBillInfo] = useState(null);
    const fetchBillInfo = async () => {
        setLoadingInfo(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/bill/${billID}`,
            });
            setBillInfo(response.data || []);
        } catch (error) {
            console.error('Error fetching bill:', error);
        } finally {
            setLoadingInfo(false);
        }
    };
    useEffect(() => {
        if (billID) fetchBillInfo();
    }, [billID]);


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
                    path: "/bill-manager/v1/payment",
                    method: "POST",
                    data: {
                        bill_id: billID,
                        payment_date: paymentDate,
                        paid_amount: paidAmount,
                        paid_by: paidBy,
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
                    setPaidBy('');
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
                    <Row>
                        <Col lg={6}>
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Row>
                                    <Col lg={12}>
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
                                    <Col lg={12}>
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
                                    <Col lg={12}>
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
                                    <Col lg={12}>
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

                                    <Col lg={12}>
                                        <FloatingLabel
                                            controlId="paid_by"
                                            label={__('Paid By', 'bill-manager')}
                                            className="mb-3"
                                        >
                                            <Form.Control
                                                type="text"
                                                placeholder={__('Paid By', 'bill-manager')}
                                                value={paidBy}
                                                onChange={(e) => setPaidBy(e.target.value)}
                                            />
                                        </FloatingLabel>
                                    </Col>
                                    <Col lg={12}>
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
                        </Col>
                        <Col lg={6}>
                            {
                                !loadingInfo && (
                                    <>
                                        {billInfo?.created_at && <div className="company-name"><strong>{__('Date: ', 'bill-manager')}</strong>{billInfo.created_at}</div>}
                                        {billInfo?.company_name && <div className="company-name"><strong>{__('Company Name: ', 'bill-manager')}</strong>{billInfo.company_name}</div>}
                                        {billInfo?.bill_type && <div className="company-name"><strong>{__('Bill Type: ', 'bill-manager')}</strong>{billInfo.bill_type}</div>}
                                        {billInfo?.amount && <div className="company-name"><strong>{__('Amount: ', 'bill-manager')}</strong>{billInfo.amount}</div>}
                                        {
                                            billInfo?.payments.length ?
                                                <Table striped bordered hover>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Date</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            billInfo.payments.map(({id, date, amount}, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{date}</td>
                                                                <td>{amount}</td>
                                                            </tr>
                                                            ))
                                                        }
                                                        <tr>
                                                            <td colSpan={2}>Paid</td>
                                                            <td>{billInfo?.paid}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>Balance</td>
                                                            <td>{billInfo?.balance}</td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                                
                                        :
                                        ''
                                        }
                                    </>
                                )
                                /*
                                {
    "ID": "1",
    "user_id": "1",
    "ip": "::1",
    "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "company_id": "1",
    "bill_no": "bill-xyz123abc",
    "bill_type": "purchase",
    "bill_date": "2026-08-10 00:00:00",
    "discount": "100.00",
    "ait": "10.00",
    "tax": "20.00",
    "vat": "30.00",
    "shipping": "40.00",
    "notes": "nothing",
    "status": "1",
    "created_at": "2026-08-09 18:57:10",
    "updated_at": "2026-08-09 18:57:10",
    "company": {
        "id": 1,
        "title": "ABC Company"
    },
    "amount": "-40.00",
    "paid": "50000.00",
    "balance": "50040.00",
    "payment_status": "over_paid",
    "payments": [
        {
            "id": 1,
            "date": "2026-08-10 00:00:00",
            "amount": "50000.00"
        }
    ],
    "items": []
}
                                */
                            }
                        </Col>
                    </Row>

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
