import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button, Modal, Spinner } from 'react-bootstrap';

export default function ComapnyDetailsModal({ show, setShow, id }) {
    // const [show, setShow] = useState(false);
    const [dataDetailsModal, setDataDetailsModal] = useState([]);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await apiFetch({
                    path: `/bill-manager/v1/company/${id}`,
                });
                setDataDetailsModal(response.data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    return (
        <>

            <Modal size="lg" show={show} onHide={handleClose}>
                {/* {console.log(dataDetailsModal)} */}
                <Modal.Header closeButton>
                    <Modal.Title>{__('Company details', 'bill-manager')}</Modal.Title>
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
                            <ul className="list-unstyled">
                                <li>{__('Title', 'bill-manager')}: {dataDetailsModal?.title}</li>
                                <li>{__('Phone', 'bill-manager')}: {dataDetailsModal?.phone}</li>
                                <li>{__('Email', 'bill-manager')}: {dataDetailsModal?.email}</li>
                                <li>{__('Address', 'bill-manager')}: {dataDetailsModal?.address}</li>
                            </ul>
                            <hr />
                            <h6 className="h6">{__('User Details', 'bill-manager')}</h6>
                            <ul className="list-unstyled">
                                <li>{__('User Name', 'bill-manager')}: {dataDetailsModal?.user_name}</li>
                                <li>{__('User ID', 'bill-manager')}: {dataDetailsModal?.user_id}</li>
                                <li>{__('User Email', 'bill-manager')}: {dataDetailsModal?.user_email}</li>
                                <li>{__('User IP', 'bill-manager')}: {dataDetailsModal?.ip}</li>
                                <li>{__('User Details', 'bill-manager')}: {dataDetailsModal?.user_agent}</li>
                                <li>{__('Category', 'bill-manager')}: {dataDetailsModal?.category}</li>
                                <li>{__('Date', 'bill-manager')}: {dataDetailsModal?.created_at}</li>
                            </ul>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>{__('Close', 'bill-manager')}</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
