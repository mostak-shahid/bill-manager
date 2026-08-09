import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button, Modal, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { ToastControl } from "../../../components";

export default function ComapnyEditModal({ show, setShow, id, setReloadTable }) {
    // const [show, setShow] = useState(false);
    const [dataDetailsModal, setDataDetailsModal] = useState([]);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('1');

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiFetch({
                    path: `/bill-manager/v1/company/${id}`,
                });
                setTitle(response?.data?.title);
                setAddress(response?.data?.address);
                setPhone(response?.data?.phone);
                setEmail(response?.data?.email);
                setNotes(response?.data?.notes);
                setStatus(response?.data?.status);
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);


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

        if (title && title.trim() !== '') {
            setProcessing(true);
            try {
                const result = await apiFetch({
                    path: `/bill-manager/v1/company/${id}`,
                    method: "PUT",
                    data: {
                        title, address, phone, email, notes, status
                    },
                    headers: {
                        'X-WP-Nonce': bill_manager_ajax_obj.api_nonce
                    }
                });
                // console.log(result);
                if (result.success) {
                    setValidated(false);
                    setTitle('');
                    setAddress('');
                    setPhone('');
                    setEmail('');
                    setNotes('');
                    setStatus('1');
                    setDataToast({
                        title: __("Success", "bill-manager"),
                        content: __("Company modified successfully!", "bill-manager"),
                        type: 'success'
                    });
                    setShowToast(true);
                    handleClose();
                    setReloadTable(Math.random());
                }

            } catch (error) {
                console.error("Company modifying Error:", error);
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
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{__('Edit Company')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            /> {__('Loading...', 'bill-manager')}
                        </>
                    ) : (
                        <>
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <FloatingLabel
                                    controlId="Title"
                                    label={__('Title', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder={__('Title', 'bill-manager')}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="phone"
                                    label={__('Phone', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="tel"
                                        placeholder={__('Phone', 'bill-manager')}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="email"
                                    label={__('Email address', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        type="email"
                                        placeholder={__('Email address', 'bill-manager')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="address"
                                    label={__('Address', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Control
                                        as="textarea"
                                        rows={15}
                                        placeholder={__('Address', 'bill-manager')}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="status"
                                    label={__('Status', 'bill-manager')}
                                    className="mb-3"
                                >
                                    <Form.Select
                                        // as="select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="1">{__('Active', 'bill-manager')}</option>
                                        <option value="0">{__('Inactive', 'bill-manager')}</option>
                                    </Form.Select>
                                </FloatingLabel>

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
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            /> {__('Modifying...', 'bill-manager')}
                                        </>
                                    ) : (
                                        <>
                                            <FaTelegramPlane /> {__('Modify', 'bill-manager')}
                                        </>
                                    )}
                                </Button>

                            </Form>
                        </>
                    )}
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
