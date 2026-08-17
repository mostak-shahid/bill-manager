import { __ } from "@wordpress/i18n";
import { useState, useEffect, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Row, Col, Button, Modal, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { ToastControl } from "../../../components";

export default function EventCreateModal({ show, setShow, setReloadTable }) {
    // const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [companyId, setCompanyId] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('');
    const [details, setDetails] = useState('');

    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
            const response = await apiFetch({
                path: `/bill-manager/v1/all-companies`,
            });
            setCompanies(response.data || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoadingCompanies(false);
        }
    };
    useEffect(() => {
        fetchCompanies();
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
                    path: "/bill-manager/v1/event",
                    method: "POST",
                    data: {
                        company_id: companyId,
                        date: date,
                        type,
                        details,
                    },
                    headers: {
                        'X-WP-Nonce': bill_manager_ajax_obj.api_nonce
                    }
                });
                // console.log(result);
                if (result.success) {
                    setValidated(false);
                    setCompanyId('');
                    setDate('');
                    setType('');
                    setDetails('');

                    setDataToast({
                        title: __("Success", "bill-manager"),
                        content: __("Event created successfully!", "bill-manager"),
                        type: 'success'
                    });
                    setShowToast(true);
                    handleClose();
                    setReloadTable(Math.random());
                }

            } catch (error) {
                console.error("Event creating Error:", error);
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
                content: __("Company is required", "bill-manager"),
                type: 'warning'
            });
            setShowToast(true);
        }
    };

    return (
        <>
            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{__('Create Event', 'bill-manager')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                <FloatingLabel
                                    controlId="company_id"
                                    label={__('Company Name', 'bill-manager')}
                                    className="mb-3"
                                >
                                    {!loadingCompanies ? (
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
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="date"
                                    label={__('Date', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="date"
                                        placeholder={__('Date', 'bill-manager')}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md={6}>
                                <FloatingLabel
                                    controlId="type"
                                    label={__('Type', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="text"
                                        placeholder={__('Type', 'bill-manager')}
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <FloatingLabel
                                    controlId="details"
                                    label={__('Details', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="textarea"
                                        placeholder={__('Details', 'bill-manager')}
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
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
