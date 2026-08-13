import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table'; // This will be replaced with the DataTable component in the future
import BillCreateModal from './BillCreateModal'
import './Bills.css'
import PaymentCreateModal from "../Payments/PaymentCreateModal";

export default function Bills() {
    const [reloadTable, setReloadTable] = useState(0);

    const [showBillCreateModal, setShowBillCreateModal] = useState(false);
    const [showPaymentCreateModal, setShowPaymentCreateModal] = useState(false);
    return (
        <>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>{__('Bill No.', 'bill-manager')}</th>
                        <th>{__('Company', 'bill-manager')}</th>
                        <th>{__('Type', 'bill-manager')}</th>
                        <th>{__('Amount', 'bill-manager')}</th>
                        <th>{__('Paid', 'bill-manager')}</th>
                        <th>{__('Balance', 'bill-manager')}</th>
                        <th>{__('Status', 'bill-manager')}</th>
                        <th>{__('Date', 'bill-manager')}</th>
                        <th>{__('Actions', 'bill-manager')}</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{__('Bill No.', 'bill-manager')}</td>
                        <td>{__('Company', 'bill-manager')}</td>
                        <td>{__('Type', 'bill-manager')}</td>
                        <td>{__('Amount', 'bill-manager')}</td>
                        <td>{__('Paid', 'bill-manager')}</td>
                        <td>{__('Balance', 'bill-manager')}</td>
                        <td>{__('Status', 'bill-manager')}</td>
                        <td>{__('Date', 'bill-manager')}</td>
                        <td>{__('Actions', 'bill-manager')}</td>
                    </tr>
                </tbody>
            </Table>

            <Button
                variant="outline-primary"
                onClick={() => setShowBillCreateModal(true)}
            >
                {__('Add Bill', 'bill-manager')}
            </Button>
            <Button
                variant="outline-primary"
                onClick={() => setShowPaymentCreateModal(true)}
            >
                {__('Add Payment', 'bill-manager')}
            </Button>
            <BillCreateModal show={showBillCreateModal} setShow={setShowBillCreateModal} setReloadTable={setReloadTable} />
            <PaymentCreateModal show={showPaymentCreateModal} setShow={setShowPaymentCreateModal} setReloadTable={setReloadTable} />
        </>
    )
}
