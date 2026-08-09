import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button } from 'react-bootstrap';
import BillCreateModal from './PaymentCreateModal'
import './Payments.css'

export default function Payments() {
    const [reloadTable, setReloadTable] = useState(0);

    const [showCreateModal, setShowCreateModal] = useState(false);
    return (
        <>

            <Button
                variant="outline-primary"
                onClick={() => setShowCreateModal(true)}
            >
                {__('Add New', 'bill-manager')}
            </Button>
            <BillCreateModal show={showCreateModal} setShow={setShowCreateModal} setReloadTable={setReloadTable}/>
        </>
    )
}
