import React, { useState } from 'react';
import { Navbar, Nav, Collapse } from 'react-bootstrap';
import './VerticalMultiLevelNavbar.css';
/**
 * =========================================
 * Vertical Multi Level Sidebar
 * Click to open submenu
 * =========================================
 */


function VerticalMenuItem({ item, depth = 0 }) {
    const [open, setOpen] = useState(false);

    if (!item.items) {
        return (
            <Nav.Link
                href={item.url}
                className="vertical-menu-link"
                style={{
                    paddingLeft: `${depth * 20 + 16}px`,
                }}
            >
                {item.icon && `${item.icon} `}
                {item.text}
            </Nav.Link>
        );
    }

    return (
        <>
            <div
                className="vertical-menu-parent"
                onClick={() => setOpen(!open)}
                style={{
                    paddingLeft: `${depth * 20 + 16}px`,
                }}
            >
                <span>
                    {item.icon && `${item.icon} `}
                    {item.text}
                </span>

                <span>{open ? '−' : '+'}</span>
            </div>

            <Collapse in={open}>
                <div>
                    {item.items.map((child) => (
                        <VerticalMenuItem
                            key={child.itemKey}
                            item={child}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            </Collapse>
        </>
    );
}

export default function VerticalMultiLevelNavbar({MenuItems}) {
    return (
        <>
            <Navbar
                className="bill-manager-vertical-navbar flex-column align-items-start vertical-navbar"
                style={{ backgroundColor: 'var(--bs-body-bg)' }}
            >
                <Navbar.Brand className="px-3 py-3">
                    My App
                </Navbar.Brand>

                <Nav className="flex-column w-100">
                    {MenuItems.map((item) => (
                        <VerticalMenuItem
                            key={item.itemKey}
                            item={item}
                        />
                    ))}
                </Nav>
            </Navbar>
        </>
    );
}