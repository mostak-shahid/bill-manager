import { __ } from "@wordpress/i18n";
import { useState, useEffect } from '@wordpress/element';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Offcanvas, Button, NavDropdown } from 'react-bootstrap';
import './HorizontalMenuControl.css';

export default function HorizontalMenuControl({ items, breakpoint, headerContent = {}, footerContent = {} }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [isCollapse, setIsCollapse] = useState(window.innerWidth <= breakpoint);
    const [menuVisible, setMenuVisible] = useState(false);

    const [selectedKeys, setSelectedKeys] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            setIsCollapse(window.innerWidth <= breakpoint);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const path = location.pathname;
        const active = findActiveKeys(items, path);
        setSelectedKeys([active.selected]);
    }, [location.pathname]);

    const findActiveKeys = (menuItems, path, parents = []) => {
        for (const item of menuItems) {
            if (item.url && (item.url === path || path.startsWith(item.url + '/'))) {
                return { selected: item.itemKey, openKeys: parents };
            }
            if (item.items) {
                const result = findActiveKeys(item.items, path, [...parents, item.itemKey]);
                if (result.selected) return result;
            }
        }
        return { selected: '', openKeys: [] };
    };

    const findItemByKey = (menuItems, key) => {
        for (const item of menuItems) {
            if (item.itemKey === key) return item;
            if (item.items) {
                const result = findItemByKey(item.items, key);
                if (result) return result;
            }
        }
        return null;
    };

    const handleSelect = (itemKey) => {
        if (!itemKey) return;
        const found = findItemByKey(items, itemKey);
        if (found?.url) {
            navigate(found.url);
        }
        setSelectedKeys([itemKey]);
        setMenuVisible(false);
    };

    const renderMenuItems = (menuItems) => {
        return menuItems.map((item) => {
            if (item.items) {
                return (
                    <NavDropdown
                        key={item.itemKey}
                        title={<><span>{item.icon}</span> <span>{item.text}</span></>}
                        id={`nav-dropdown-${item.itemKey}`}
                    >
                        {renderMenuItems(item.items)}
                    </NavDropdown>
                );
            }
            return (
                <Nav.Item key={item.itemKey}>
                    <Nav.Link
                        eventKey={item.itemKey}
                        onClick={() => handleSelect(item.itemKey)}
                        className="d-flex align-items-center gap-2"
                    >
                        <span>{item.icon}</span>
                        <span>{item.text}</span>
                    </Nav.Link>
                </Nav.Item>
            );
        });
    };

    return (
        <>
            <Navbar expand="lg" className="bill-manager-navbar" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <Container fluid>
                    <Navbar.Brand onClick={() => navigate('/')} className="d-flex align-items-center gap-2 cursor-pointer">
                        {headerContent.logo}
                        <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                            {headerContent.text}
                        </span>
                    </Navbar.Brand>
                    
                    <div className="d-flex align-items-center gap-2 d-lg-none">
                        {footerContent}
                        <Navbar.Toggle aria-controls="offcanvas-nav" onClick={() => setMenuVisible(true)} />
                    </div>

                    <Navbar.Collapse className="d-none d-lg-flex justify-content-between">
                        <Nav className="me-auto" activeKey={selectedKeys[0]} onSelect={handleSelect}>
                            {renderMenuItems(items)}
                        </Nav>
                        <Nav>
                            {footerContent}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Offcanvas
                show={menuVisible}
                onHide={() => setMenuVisible(false)}
                placement="end"
                id="offcanvas-nav"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{headerContent.text}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav
                        className="flex-column"
                        activeKey={selectedKeys[0]}
                        onSelect={handleSelect}
                    >
                        {renderMenuItems(items)}
                    </Nav>
                    <hr />
                    <div className="d-flex flex-column gap-2">
                        {footerContent}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
