import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import './HorizontalMultiLevelNavbar.css';

const currentPath = '/layouts/boxed/right-sidebar';
/**
 * =========================================
 * Multi Level Dropdown Component
 * =========================================
 */

function MultiLevelDropdown({ item, depth = 0 }) {

    const [show, setShow] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

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
            <NavDropdown.Item href={item.url}>
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
            className={`multi-level-dropdown depth-${depth}`}

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
                        {item.icon && `${item.icon} `}
                        {item.text}
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

                className={
                    depth > 0
                        ? 'dropdown-submenu'
                        : ''
                }

            >

                {item.items.map((child) => (

                    <MultiLevelDropdown
                        key={child.itemKey}
                        item={child}
                        depth={depth + 1}
                    />

                ))}

            </NavDropdown>

        </div>

    );

}

/**
 * =========================================
 * Main Navbar Component
 * =========================================
 */

export default function HorizontalMultiLevelNavbar({ MenuItems }) {

    return (

        <>

            <Navbar
                className="bill-manager-horizontal-navbar"
                expand="lg"
                style={{ backgroundColor: 'var(--bs-body-bg)' }}
            >

                <div className="container-fluid">

                    <Navbar.Brand href="/">
                        My App
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="main-navbar" />

                    <Navbar.Collapse id="main-navbar">

                        <Nav className="me-auto">

                            {MenuItems.map((item) => {

                                /**
                                 * ---------------------------------
                                 * Normal Menu Item
                                 * ---------------------------------
                                 */

                                if (!item.items) {

                                    return (

                                        <Nav.Link
                                            key={item.itemKey}
                                            href={item.url}
                                        >

                                            {item.icon && `${item.icon} `}
                                            {item.text}

                                        </Nav.Link>

                                    );

                                }

                                /**
                                 * ---------------------------------
                                 * Dropdown Menu Item
                                 * ---------------------------------
                                 */

                                return (

                                    <MultiLevelDropdown
                                        key={item.itemKey}
                                        item={item}
                                    />

                                );

                            })}

                        </Nav>

                    </Navbar.Collapse>

                </div>

            </Navbar>

        </>

    );

}