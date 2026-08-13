import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Row, Col, Button, Modal, Spinner, Card } from 'react-bootstrap';
import Table from 'react-bootstrap/Table'; // This will be replaced with the DataTable component in the future

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
                                                </ul>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Header>{__('Balance', 'bill-manager')}</Card.Header>
                                        <Card.Body>
                                            <Card.Title>{__('Receivable', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <h6 className="h6">{__('Financial Summary', 'bill-manager')}</h6>
                            <Row className="align-items-stretch">

                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Body>
                                            <Card.Title>{__('Total Sales ', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Body>
                                            <Card.Title>{__('Received', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Body>
                                            <Card.Title>{__('Receivable', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Row className="align-items-stretch">

                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Body>
                                            <Card.Title>{__('Purchases', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Body>
                                            <Card.Title>{__('Paid', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} md={6} className="mb-3">
                                    <Card
                                        bg='success'
                                        text='light'
                                        style={customCardStyle}
                                    >
                                        <Card.Body>
                                            <Card.Title>{__('Payable', 'bill-manager')}</Card.Title>
                                            <Card.Text>
                                                ৳60,000
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <h6 className="h6">{__('Recent Bills', 'bill-manager')}</h6>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{__('Bill', 'bill-manager')}</th>
                                        <th>{__('Type', 'bill-manager')}</th>
                                        <th>{__('Amount', 'bill-manager')}</th>
                                        <th>{__('Paid', 'bill-manager')}</th>
                                        <th>{__('Balance', 'bill-manager')}</th>
                                        <th>{__('Status', 'bill-manager')}</th>
                                        <th>{__('Date', 'bill-manager')}</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>{__('Bill', 'bill-manager')}</td>
                                        <td>{__('Type', 'bill-manager')}</td>
                                        <td>{__('Amount', 'bill-manager')}</td>
                                        <td>{__('Paid', 'bill-manager')}</td>
                                        <td>{__('Balance', 'bill-manager')}</td>
                                        <td>{__('Status', 'bill-manager')}</td>
                                        <th>{__('Date', 'bill-manager')}</th>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>{__('Bill 2', 'bill-manager')}</td>
                                        <td>{__('Type 2', 'bill-manager')}</td>
                                        <td>{__('Amount 2', 'bill-manager')}</td>
                                        <td>{__('Paid 2', 'bill-manager')}</td>
                                        <td>{__('Balance 2', 'bill-manager')}</td>
                                        <td>{__('Status 2', 'bill-manager')}</td>
                                        <th>{__('Date 2', 'bill-manager')}</th>
                                    </tr>
                                </tbody>
                            </Table>

                            <h6 className="h6">{__('Recent Payments', 'bill-manager')}</h6>

                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{__('Bill', 'bill-manager')}</th>
                                        <th>{__('Type', 'bill-manager')}</th>
                                        <th>{__('Amount', 'bill-manager')}</th>
                                        <th>{__('Paid By', 'bill-manager')}</th>
                                        <th>{__('Date', 'bill-manager')}</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>{__('Bill', 'bill-manager')}</td>
                                        <td>{__('Type', 'bill-manager')}</td>
                                        <td>{__('Amount', 'bill-manager')}</td>
                                        <td>{__('Paid By', 'bill-manager')}</td>
                                        <th>{__('Date', 'bill-manager')}</th>
                                    </tr>
                                </tbody>
                            </Table>
                            {
                                dataDetailsModal?.notes && (
                                    <>
                                        <h6 className="h6">{__('Notes', 'bill-manager')}</h6>
                                        <Card className="mb-3" style={customCardStyle}>
                                            <Card.Body>
                                                <Card.Text>
                                                    {dataDetailsModal?.notes}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </>
                                )
                            }


                            <h6 className="h6">{__('Added By', 'bill-manager')}</h6>
                            <ul className="list-unstyled">
                                <li>{__('User Name', 'bill-manager')}: {dataDetailsModal?.user_name}</li>
                                <li>{__('User ID', 'bill-manager')}: {dataDetailsModal?.user_id}</li>
                                <li>{__('User Email', 'bill-manager')}: {dataDetailsModal?.user_email}</li>
                                <li>{__('User IP', 'bill-manager')}: {dataDetailsModal?.ip}</li>
                                <li>{__('User Details', 'bill-manager')}: {dataDetailsModal?.user_agent}</li>
                                <li>{__('Added', 'bill-manager')}: {dataDetailsModal?.created_at}</li>
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
