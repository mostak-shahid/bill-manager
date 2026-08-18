import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Row, Col, Button, Modal, Spinner, Card } from 'react-bootstrap';
import Table from 'react-bootstrap/Table'; // This will be replaced with the DataTable component in the future
import CompanyBills from './CompanyBills'; // Import the CompanyBills component
import CompanyPayments from './CompanyPayments'; // Import the CompanyPayments component
export default function ComapnyDetailsModal({ show, setShow, id }) {
    // const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [dataDetailsModal, setDataDetailsModal] = useState([]);
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
    const customCardStyle = {
        width: '100%',
        padding: '0px',
        margin: '0px',
        maxWidth: 'unset',
        minHeight: '100%',
    };
    return (
        <>

            <Modal size="xl" show={show} onHide={handleClose}>
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
                            <Row className="align-items-stretch">
                                <Col lg={8} md={6} className="mb-3">
                                    <Card
                                        // bg={variant.toLowerCase()}
                                        bg='light'
                                        // key={variant}
                                        // text={variant.toLowerCase() === 'light' ? 'dark' : 'white'}
                                        text='dark'
                                        style={customCardStyle}
                                    // className="mb-2"
                                    >
                                        <Card.Header>{__('Company Information', 'bill-manager')}</Card.Header>
                                        <Card.Body>
                                            <Card.Title>{dataDetailsModal?.title}</Card.Title>
                                            <Card.Text>
                                                <ul className="list-unstyled">
                                                    {/* <li>{__('Title', 'bill-manager')}: {dataDetailsModal?.title}</li> */}
                                                    <li>{__('Phone', 'bill-manager')}: {dataDetailsModal?.phone}</li>
                                                    <li>{__('Email', 'bill-manager')}: {dataDetailsModal?.email}</li>
                                                    <li>{__('Address', 'bill-manager')}: {dataDetailsModal?.address}</li>
                                                    <li>{__('Note', 'bill-manager')}: {dataDetailsModal?.notes}</li>
                                                </ul>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='light'
                                        text='dark'
                                        style={customCardStyle}
                                    >
                                        <Card.Header>{__('Overview', 'bill-manager')}</Card.Header>
                                        <Card.Body>
                                            <Card.Title>{__('Receivable', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                <strong>{__('Purchases', 'bill-manager')}</strong> {dataDetailsModal?.purchase}<br />
                                                <strong>{__('Paid', 'bill-manager')}</strong> {dataDetailsModal?.purchase_paid}<br />
                                                <strong>{__('Payable', 'bill-manager')}</strong> {dataDetailsModal?.payable}<br />
                                                <strong>{__('Total Sales', 'bill-manager')}</strong> {dataDetailsModal?.sale}<br />
                                                <strong>{__('Received', 'bill-manager')}</strong> {dataDetailsModal?.sale_paid}<br />
                                                <strong>{__('Receivable', 'bill-manager')}</strong> {dataDetailsModal?.receivable}<br />
                                                <strong>{__('Balance', 'bill-manager')}</strong> {dataDetailsModal?.balance}<br />
                                                <strong>{__('Balance Type', 'bill-manager')}</strong> {dataDetailsModal?.balance_type}<br />
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <h6 className="h6">{__('Recent Bills', 'bill-manager')}</h6>
                            <CompanyBills id={id} />

                            <h6 className="h6">{__('Recent Payments', 'bill-manager')}</h6>
                            <CompanyPayments id={id} />
                            <Card
                                // bg={variant.toLowerCase()}
                                bg='light'
                                // key={variant}
                                // text={variant.toLowerCase() === 'light' ? 'dark' : 'white'}
                                text='dark'
                                style={customCardStyle}
                            // className="mb-2"
                            >
                                <Card.Header>{__('Added By', 'bill-manager')}</Card.Header>
                                <Card.Body>
                                    <Card.Title>{dataDetailsModal?.user_display_name} ({dataDetailsModal?.user_id})</Card.Title>
                                    <Card.Text>
                                        <ul className="list-unstyled">
                                            <li>{__('User Email', 'bill-manager')}: {dataDetailsModal?.user_email}</li>
                                            <li>{__('User IP', 'bill-manager')}: {dataDetailsModal?.ip}</li>
                                            <li>{__('User Details', 'bill-manager')}: {dataDetailsModal?.user_agent}</li>
                                            <li>{__('Added', 'bill-manager')}: {dataDetailsModal?.created_at}</li>
                                        </ul>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
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
