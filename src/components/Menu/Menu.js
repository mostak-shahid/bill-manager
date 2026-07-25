import { useState, useEffect } from '@wordpress/element';
import {
    Navbar,
    Nav,
    NavDropdown,
    Collapse
} from 'react-bootstrap';

import { useLocation } from 'react-router-dom';
import './Menu.css';

const pathPrefix = 'admin.php?page=bill-manager#'; // Adjust this if your app is served from a different base path

/**
 * =========================================================
 * Helper Functions
 * =========================================================
 */

function isMenuActive(item, currentPath) {

    return item.url === currentPath;

}

function hasActiveChild(item, currentPath) {

    if (!item.items) {
        return false;
    }

    return item.items.some((child) => {

        if (child.url === currentPath) {
            return true;
        }

        return hasActiveChild(child, currentPath);

    });

}

/**
 * =========================================================
 * Horizontal Dropdown Component
 * =========================================================
 */

function HorizontalDropdown({
    item,
    depth = 0,
    currentPath
}) {

    const [show, setShow] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    const active = isMenuActive(item, currentPath);

    const hasActive = hasActiveChild(item, currentPath);

    useEffect(() => {

        const handleResize = () => {

            setIsMobile(window.innerWidth < 992);

        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {

            window.removeEventListener('resize', handleResize);

        };

    }, []);

    /**
     * -----------------------------------------
     * Simple Item
     * -----------------------------------------
     */

    if (!item.items) {

        return (

            <NavDropdown.Item
                href={pathPrefix + item.url}
                className={`${item?.className || ''} ${active ? 'current' : ''}`.trim()}
            >

                {item.icon && `${item.icon} `}
                {item.text}

            </NavDropdown.Item>

        );

    }

    /**
     * -----------------------------------------
     * Dropdown Item
     * -----------------------------------------
     */

    return (

        <div
            className={`
                multi-level-dropdown
                depth-${depth}
                ${hasActive ? 'wp-has-current-submenu' : ''}
            `}

            onMouseEnter={() => {

                if (!isMobile) {
                    setShow(true);
                }

            }}

            onMouseLeave={() => {

                if (!isMobile) {
                    setShow(false);
                }

            }}
        >

            <NavDropdown

                title={
                    <>
                        {item.icon && <span className='nav-icon'>{item.icon}</span>}
                        <span className='nav-text'>{item.text}</span>
                    </>
                }

                show={show}

                onToggle={(nextShow) => {

                    if (isMobile) {
                        setShow(nextShow);
                    }

                }}

                drop={
                    isMobile
                        ? 'down'
                        : depth > 0
                            ? 'end'
                            : 'down'
                }

                className={`
                    ${item?.className}
                    ${depth > 0 ? 'dropdown-submenu' : ''}
                    ${active ? 'current' : ''}
                `}
            >

                {item.items.map((child) => (

                    <HorizontalDropdown
                        key={child.itemKey}
                        item={child}
                        depth={depth + 1}
                        currentPath={currentPath}
                    />

                ))}

            </NavDropdown>

        </div>

    );

}

/**
 * =========================================================
 * Horizontal Multi Level Navbar
 * =========================================================
 */

export function HorizontalMultiLevelNavbar({MenuItems, headerContent = {}, footerContent = {}, toggleContent = {}, className = ''}) {

    const location = useLocation();

    const currentPath = location.pathname;

    return (

        <>

            <Navbar
                expand="lg"
                className={`bill-manager-navbar bill-manager-horizontal-navbar ${className}`}
                style={{ backgroundColor: 'var(--bs-body-bg)' }}
            >

                <div className="container-fluid">

                    <Navbar.Brand onClick={() => navigate('/')} className="d-flex align-items-center gap-2 cursor-pointer">
                        {headerContent.logo}
                        <span className='d-none d-lg-inline fw-semibold'>
                            {headerContent.text}
                        </span>
                    </Navbar.Brand>
                    <div className='d-flex d-lg-none gap-1'>
                        {toggleContent}
                        <Navbar.Toggle aria-controls="main-navbar" />
                    </div>
                    <Navbar.Collapse id="main-navbar">

                        <Nav className="me-auto">

                            {MenuItems.map((item) => {

                                const active = isMenuActive(
                                    item,
                                    currentPath
                                );

                                const hasActive = hasActiveChild(
                                    item,
                                    currentPath
                                );

                                /**
                                 * ---------------------------------
                                 * Normal Menu Item
                                 * ---------------------------------
                                 */

                                if (!item.items) {

                                    return (

                                        <Nav.Link
                                            key={item.itemKey}
                                            href={pathPrefix + item.url}
                                            // className={active ? 'current' : ''}
                                            className={`${item?.className || ''} ${active ? 'current' : ''}`.trim()}
                                        >

                                            {item.icon && <span className='nav-icon'>{item.icon}</span> }
                                            <span className='nav-text'>{item.text}</span>

                                        </Nav.Link>

                                    );

                                }

                                /**
                                 * ---------------------------------
                                 * Dropdown Menu Item
                                 * ---------------------------------
                                 */

                                return (

                                    <HorizontalDropdown
                                        key={item.itemKey}
                                        item={item}
                                        currentPath={currentPath}
                                    />

                                );

                            })}

                        </Nav>
                        <div className="horizontal-navbar-footer mt-2 mt-lg-0">
                            {footerContent}
                        </div>

                    </Navbar.Collapse>

                </div>

            </Navbar>

        </>

    );

}

/**
 * =========================================================
 * Vertical Menu Item
 * =========================================================
 */

function VerticalMenuItem({
    item,
    depth = 0,
    currentPath,
    openMenus,
    setOpenMenus,
    parentKey = '',
}) {

    const active = isMenuActive(item, currentPath);

    const hasActive = hasActiveChild(item, currentPath);

    /**
     * Unique Menu Key
     */

    const menuKey = parentKey
        ? `${parentKey}-${item.itemKey}`
        : item.itemKey;

    /**
     * Open State
     */

    const open = openMenus[depth] === menuKey;

    /**
     * Auto open active parent/grandparent
     */

    useEffect(() => {

        if (hasActive) {

            setOpenMenus((prev) => ({
                ...prev,
                [depth]: menuKey,
            }));

        }

    }, [hasActive]);

    /**
     * Toggle Accordion
     */

    const handleToggle = () => {

        setOpenMenus((prev) => {

            /**
             * Close current level if already open
             */

            if (prev[depth] === menuKey) {

                const updated = { ...prev };

                delete updated[depth];

                /**
                 * Remove child levels
                 */

                Object.keys(updated).forEach((key) => {

                    if (Number(key) > depth) {
                        delete updated[key];
                    }

                });

                return updated;

            }

            /**
             * Open current menu
             * Close sibling menus
             */

            const updated = {
                ...prev,
                [depth]: menuKey,
            };

            /**
             * Remove child levels
             */

            Object.keys(updated).forEach((key) => {

                if (Number(key) > depth) {
                    delete updated[key];
                }

            });

            return updated;

        });

    };

    /**
     * -----------------------------------------
     * Simple Item
     * -----------------------------------------
     */

    if (!item.items) {

        return (

            <Nav.Link
                href={pathPrefix + item.url}
                className={`                    
                    vertical-menu-link
                    ${item?.className}
                    ${active ? 'current' : ''}
                `}
                style={{
                    paddingLeft: `${depth * 20 + 16}px`,
                }}
            >

                {item.icon && <span className="nav-icon">{item.icon}</span> }
                <span className="nav-text">{item.text}</span>

            </Nav.Link>

        );

    }

    /**
     * -----------------------------------------
     * Parent Item
     * -----------------------------------------
     */

    return (

        <div
            className={`
                vertical-menu-wrapper
                ${open || hasActive
                    ? 'wp-has-current-submenu wp-menu-open'
                    : ''
                }
            `}
        >

            <div
                className="vertical-menu-parent nav-link"
                onClick={handleToggle}
                style={{
                    paddingLeft: `${depth * 20 + 16}px`,
                }}
            >

                <span>
                    {item.icon && <span className="nav-icon">{item.icon}</span> }
                    <span className="nav-text">{item.text}</span>
                </span>

                <span>
                    {open ? '−' : '+'}
                </span>

            </div>

            <Collapse in={open}>

                <div>

                    {item.items.map((child) => (

                        <VerticalMenuItem
                            key={child.itemKey}
                            item={child}
                            depth={depth + 1}
                            currentPath={currentPath}
                            openMenus={openMenus}
                            setOpenMenus={setOpenMenus}
                            parentKey={menuKey}
                        />

                    ))}

                </div>

            </Collapse>

        </div>

    );

}

/**
 * =========================================================
 * Vertical Multi Level Navbar
 * =========================================================
 */

export function VerticalMultiLevelNavbar({ MenuItems, headerContent = {}, footerContent = {}, className = '' }) {

    const location = useLocation();

    const currentPath = location.pathname;

    /**
     * Accordion State
     */

    const [openMenus, setOpenMenus] = useState({});

    return (

        <Navbar
            className={`bill-manager-navbar bill-manager-vertical-navbar flex-column align-items-start vertical-navbar h-100 ${className}`}
            style={{ backgroundColor: 'var(--bs-body-bg)' }}
        >

            <Navbar.Brand onClick={() => navigate('/')} className="d-flex align-items-center gap-2 cursor-pointer">
                {headerContent.logo}
                <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    {headerContent.text}
                </span>
            </Navbar.Brand>
            <>
                <Nav className="flex-column w-100 mb-auto">

                    {MenuItems.map((item) => (

                        <VerticalMenuItem
                            key={item.itemKey}
                            item={item}
                            currentPath={currentPath}
                            openMenus={openMenus}
                            setOpenMenus={setOpenMenus}
                        />

                    ))}

                </Nav>
                {Object.keys(footerContent).length > 0 && (
                    <div className="vertical-navbar-footer w-100">
                        {footerContent}
                    </div>
                )}
             </>
        </Navbar>

    );

}