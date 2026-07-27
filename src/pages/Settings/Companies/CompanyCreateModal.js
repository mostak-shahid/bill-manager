import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button, Modal, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { ToastControl } from "../../../components";

export default function CompanyCreateModal({show, setShow, setReloadTable}) {
    // const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');


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
                    path: "/bill-manager/v1/companies",
                    method: "POST",
                    data: {
                        title, address, phone, email
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
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{__('Create Company')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

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
