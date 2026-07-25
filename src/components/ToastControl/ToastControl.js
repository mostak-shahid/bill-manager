import { ToastContainer, Toast } from 'react-bootstrap';

export default function ToastControl({ show, onClose, data }) {
    if (!data) return null;

    const isDanger = data.type === 'danger';
    // const bodyClass = isDanger ? 'text-white' : 'text-dark';
    const bodyClass = 'text-white';
    const headerClass = isDanger ? 'text-dark' : '';

    return (
        <ToastContainer
            className="position-fixed p-3"
            style={{ zIndex: 9999, top: 32, right: 0 }}
        >
            <Toast 
                bg={data.type || 'success'}
                show={show} 
                onClose={onClose}
                delay={3000}
                autohide
            >
                <Toast.Header closeButton={true} className={headerClass}>
                    <strong className="me-auto">{data.title}</strong>
                </Toast.Header>
                <Toast.Body className={bodyClass}>{data.content}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
}