import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button } from 'react-bootstrap';
import BillCreateModal from './BillCreateModal'

export default function Bills() {
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
