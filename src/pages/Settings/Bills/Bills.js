import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button } from 'react-bootstrap';
import BillCreateModal from './BillCreateModal'
import './Bills.css'
import PaymentCreateModal from "../Payments/PaymentCreateModal";

export default function Bills() {
    const [reloadTable, setReloadTable] = useState(0);

    const [showBillCreateModal, setShowBillCreateModal] = useState(false);
    const [showPaymentCreateModal, setShowPaymentCreateModal] = useState(false);
    return (
        <>

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
            <BillCreateModal show={showBillCreateModal} setShow={setShowBillCreateModal} setReloadTable={setReloadTable}/>
            <PaymentCreateModal show={showPaymentCreateModal} setShow={setShowPaymentCreateModal} setReloadTable={setReloadTable} />
        </>
    )
}
