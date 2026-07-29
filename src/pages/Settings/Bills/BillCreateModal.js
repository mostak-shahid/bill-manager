import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button, Modal, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import { FaTelegramPlane } from "react-icons/fa";
import { SortableAccordion, ToastControl } from "../../../components";

export default function BillCreateModal({ show, setShow, setReloadTable }) {
    // const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [companyId, setCompanyId] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [billType, setBillType] = useState('purchase');/*purchase, sell*/
    const [billDate, setBillDate] = useState('');
    const [billItems, setBillItems] = useState([]);


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

        // if (title && title.trim() !== '') {
        //     setProcessing(true);
        //     try {
        //         const result = await apiFetch({
        //             path: "/bill-manager/v1/bills",
        //             method: "POST",
        //             data: {
        //                 title, address, phone, email
        //             },
        //             headers: {
        //                 'X-WP-Nonce': bill_manager_ajax_obj.api_nonce
        //             }
        //         });
        //         // console.log(result);
        //         if (result.success) {
        //             setValidated(false);
        //             setTitle('');
        //             setAddress('');
        //             setPhone('');
        //             setEmail('');
        //             setDataToast({
        //                 title: __("Success", "bill-manager"),
        //                 content: __("Company created successfully!", "bill-manager"),
        //                 type: 'success'
        //             });
        //             setShowToast(true);
        //             handleClose();
        //             setReloadTable(Math.random());
        //         }

        //     } catch (error) {
        //         console.error("Company creating Error:", error);
        //         setDataToast({
        //             title: __("Error", "bill-manager"),
        //             content: __("Please try again!", "bill-manager"),
        //             type: 'danger'
        //         });
        //         setShowToast(true);
        //     } finally {
        //         setProcessing(false);
        //     }
        // } else {
        //     setDataToast({
        //         title: __("Warning", "bill-manager"),
        //         content: __("Title is required", "bill-manager"),
        //         type: 'warning'
        //     });
        //     setShowToast(true);
        // }
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
                            controlId="company_id"
                            label={__('Company Name', 'bill-manager')}
                            className="mb-3"
                        >
                            <Form.Select
                                aria-label="Default select example"
                                value={companyId || ''}
                                onChange={(e) => setCompanyId(e.target.value)}
                                required
                            >
                                <option value="">Open this select menu</option>
                                {
                                    [
                                        { 'value': 'select-1', 'label': 'Select 1' },
                                        { 'value': 'select-2', 'label': 'Select 2' },
                                        { 'value': 'select-3', 'label': 'Select 3' },
                                        { 'value': 'select-4', 'label': 'Select 4' },
                                        { 'value': 'select-5', 'label': 'Select 5' },
                                        { 'value': 'select-6', 'label': 'Select 6' },
                                        { 'value': 'select-7', 'label': 'Select 7' },
                                        { 'value': 'select-8', 'label': 'Select 8' },
                                    ].map(({ value, label }) => (
                                        <option
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    ))}
                            </Form.Select>
                        </FloatingLabel>
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
                                        { 'value': 'sell', 'label': 'Sell' },
                                    ].map(({ value, label }) => (
                                        <option
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    ))}
                            </Form.Select>
                        </FloatingLabel>

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
                        <SortableAccordion 
                            name='bill_items'
                            options={{
                                addButton: 'Add New Field',
                                titlePrefix: 'Address',
                                enabler: true,
                            }}
                            fields={[
                            { type: "input", name: "title", placeholder: "Address 1", className: "input-field", label: "Address 1", attributes:{'required': true} },
                            { type: "textarea", name: "note", placeholder: "Note", className: "textarea-field", label: "Note" },
                            { type: "checkbox", name: "enable", placeholder: "Enable", className: "checkbox-field", label: "Enable" },
                            { type: "radio", name: "gender", className: "radio-field", options: [{ key: "male", value: "Male" }, { key: "female", value: "Female" }] },
                            { type: "select", name: "country", className: "select-field", options: [{ key: "us", value: "United States" }, { key: "ca", value: "Canada" }] },
                            { type: "multi-select", name: "languages", className: "multi-select-field", options: [{ key: "en", value: "English" }, { key: "fr", value: "French" }] },
                            { type: "checkbox-group", name: "hobbies", className: "checkbox-group-field", options: [{ key: "reading", value: "Reading" }, { key: "sports", value: "Sports" }] }
                        ]} 
                            defaultValues={billItems} 
                            onChange={(value) => setBillItems(value)}
                        />
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
