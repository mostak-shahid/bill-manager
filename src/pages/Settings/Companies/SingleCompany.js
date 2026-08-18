import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useParams } from "react-router-dom";
import { Nav, Tabs, Tab, Row, Col, Card, Spinner, Table } from 'react-bootstrap';
import CompanyBills from "./CompanyBills";
import CompanyPayments from "./CompanyPayments";
import CompanyPersons from "./CompanyPersons";
export default function SingleCompany() {
    // The key names must match the route path parameter (:id)
    const { id } = useParams();
    const [company, setCompany] = useState([]);
    const [bills, setBills] = useState([]);
    const [payments, setPayments] = useState([]);
    const [persons, setPersons] = useState([]);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState('home');

    // useEffect(() => {
    //     const fetchAllData = async () => {
    //         setLoading(true);
    //         try {
    //             const params = new URLSearchParams({
    //                 id
    //             });
    //             const result = await apiFetch({
    //                 path: `/bill-manager/v1/company/${id}`,
    //                 // /bill-manager/v1/company/${id}/bills?page=1&per_page=10&search=&filter=any&sort_field=created_at&sort_order=DESC
    //                 // /bill-manager/v1/company/${id}/payments?page=1&per_page=10&search=&filter=any&sort_field=created_at&sort_order=DESC
    //                 method: 'GET'
    //             });
    //             setCompany(result?.data);
    //             setBills(result?.data);
    //             setPayments(result?.data);
    //         } catch (error) {
    //             console.error('Error fetching companies:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchAllData();
    // }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Execute all API requests concurrently
                const [companyRes, billsRes, paymentsRes, personsRes, eventsRes] = await Promise.all([
                    apiFetch({
                        path: `/bill-manager/v1/company/${id}`,
                        method: 'GET'
                    }),
                    apiFetch({
                        path: `/bill-manager/v1/company/${id}/bills?page=1&per_page=10&search=&filter=any&sort_field=created_at&sort_order=DESC`,
                        method: 'GET'
                    }),
                    apiFetch({
                        path: `/bill-manager/v1/company/${id}/payments?page=1&per_page=10&search=&filter=any&sort_field=created_at&sort_order=DESC`,
                        method: 'GET'
                    }),
                    apiFetch({
                        path: `/bill-manager/v1/company/${id}/persons?page=1&per_page=10&search=&filter=any&sort_field=created_at&sort_order=DESC`,
                        method: 'GET'
                    }),
                    apiFetch({
                        path: `/bill-manager/v1/company/${id}/events?page=1&per_page=10&search=&filter=any&sort_field=created_at&sort_order=DESC`,
                        method: 'GET'
                    })
                ]);

                // Assign the correct specific response data to each state
                setCompany(companyRes?.data);
                setBills(billsRes?.data);
                setPayments(paymentsRes?.data);
                setPersons(personsRes?.data);
                setEvents(eventsRes?.data);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        // Add id to dependencies if it's dynamic
        fetchAllData();
    }, [id]);



    const customCardStyle = {
        width: '100%',
        padding: '0px',
        margin: '0px',
        maxWidth: 'unset',
        minHeight: '100%',
    };
    return (
        loading ? (
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
                <Tabs
                    id="controlled-tab-example"
                    activeKey={key}
                    onSelect={(k) => setKey(k)}
                    className="mt-3"
                >
                    <Tab eventKey="home" title="Home">
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
                                            <Card.Title>{company?.title}</Card.Title>
                                            <Card.Text>
                                                <ul className="list-unstyled">
                                                    {/* <li>{__('Title', 'bill-manager')}: {company?.title}</li> */}
                                                    <li>{__('Phone', 'bill-manager')}: {company?.phone}</li>
                                                    <li>{__('Email', 'bill-manager')}: {company?.email}</li>
                                                    <li>{__('Address', 'bill-manager')}: {company?.address}</li>
                                                    <li>{__('Note', 'bill-manager')}: {company?.notes}</li>
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
                                                <strong>{__('Purchases', 'bill-manager')}</strong> {company?.purchase}<br />
                                                <strong>{__('Paid', 'bill-manager')}</strong> {company?.purchase_paid}<br />
                                                <strong>{__('Payable', 'bill-manager')}</strong> {company?.payable}<br />
                                                <strong>{__('Total Sales', 'bill-manager')}</strong> {company?.sale}<br />
                                                <strong>{__('Received', 'bill-manager')}</strong> {company?.sale_paid}<br />
                                                <strong>{__('Receivable', 'bill-manager')}</strong> {company?.receivable}<br />
                                                <strong>{__('Balance', 'bill-manager')}</strong> {company?.balance}<br />
                                                <strong>{__('Balance Type', 'bill-manager')}</strong> {company?.balance_type}<br />
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            {bills.length ?
                                <>
                                    <h6 className="h6">{__('Recent Bills', 'bill-manager')} (<small><span role="button" onClick={() => setKey('bills')}>{__('View All', 'bill-manager')}</span></small>)</h6>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{__('Bill No', 'bill-manager')}</th>
                                                <th>{__('Amount', 'bill-manager')}</th>
                                                <th>{__('Type', 'bill-manager')}</th>
                                                <th>{__('Paid', 'bill-manager')}</th>                                                
                                                <th>{__('Status', 'bill-manager')}</th>                                                
                                                <th>{__('Date', 'bill-manager')}</th>                                                
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bills.map((bill, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{bill.bill_no}</td>
                                                    <td>{bill.amount}</td>
                                                    <td>{bill.type}</td>
                                                    <td>{bill.paid}</td>
                                                    <td>{bill.status}</td>
                                                    <td>{bill.date}</td>
                                                </tr>
                                            
                                            )}
                                        </tbody>
                                    </Table>
                                </>: ''
                            }
                            {payments.length ?
                                <>
                                    <h6 className="h6">{__('Recent Payments', 'bill-manager')} (<small><span role="button" onClick={() => setKey('payments')}>{__('View All', 'bill-manager')}</span></small>)</h6>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{__('Bill No', 'bill-manager')}</th>
                                                <th>{__('Type', 'bill-manager')}</th>
                                                <th>{__('Paid', 'bill-manager')}</th>                                                
                                                <th>{__('Paid By', 'bill-manager')}</th>
                                                <th>{__('Date', 'bill-manager')}</th>                                                        
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((payment, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{payment.bill_no}</td>
                                                    <td>{payment.type}</td>
                                                    <td>{payment.amount}</td>
                                                    <td>{payment.paid_by}</td>
                                                    <td>{payment.date}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </>: ''
                            }
                            {persons.length ?
                                <>
                                    <h6 className="h6">{__('Contact Persons', 'bill-manager')} (<small><span role="button" onClick={() => setKey('persons')}>{__('View All', 'bill-manager')}</span></small>)</h6>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{__('Name', 'bill-manager')}</th>
                                                <th>{__('Designation', 'bill-manager')}</th>
                                                <th>{__('Phone', 'bill-manager')}</th>                                                
                                                <th>{__('Email', 'bill-manager')}</th>
                                                <th>{__('Added', 'bill-manager')}</th>                                                        
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {persons.map((person, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{person.title}</td>
                                                    <td>{person.designation}</td>
                                                    <td>{person.phone}</td>
                                                    <td>{person.email}</td>
                                                    <td>{person.created_at}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </>: ''
                            }
                            {events.length ?
                                <>
                                    <h6 className="h6">{__('Events', 'bill-manager')} (<small><span role="button" onClick={() => setKey('events')}>{__('View All', 'bill-manager')}</span></small>)</h6>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{__('Date', 'bill-manager')}</th>
                                                <th>{__('Type', 'bill-manager')}</th>
                                                <th>{__('details', 'bill-manager')}</th>                                                                
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map((event, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{event.date}</td>
                                                    <td>{event.type}</td>
                                                    <td>{event.details}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </>: ''
                            }
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
                                    <Card.Title>{company?.user_display_name} ({company?.user_id})</Card.Title>
                                    <Card.Text>
                                        <ul className="list-unstyled">
                                            <li>{__('User Email', 'bill-manager')}: {company?.user_email}</li>
                                            <li>{__('User IP', 'bill-manager')}: {company?.ip}</li>
                                            <li>{__('User Details', 'bill-manager')}: {company?.user_agent}</li>
                                            <li>{__('Added', 'bill-manager')}: {company?.created_at}</li>
                                        </ul>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </>
                    </Tab>
                    <Tab eventKey="bills" title="Bills">
                        <CompanyBills id={id} />
                    </Tab>
                    <Tab eventKey="payments" title="Payments">
                        <CompanyPayments id={id} />
                    </Tab>
                    <Tab eventKey="persons" title="Contact Persons">
                        <CompanyPersons id={id} />
                    </Tab>
                    <Tab eventKey="events" title="Events">
                        Company contact events
                    </Tab>
                </Tabs>
            </>
        )
    )
}
