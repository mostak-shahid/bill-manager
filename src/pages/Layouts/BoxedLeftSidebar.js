import { useState, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import {Card, Button, Nav, Badge} from 'react-bootstrap';

import { FaHome, FaColumns, FaCog, FaComment, FaCrown, FaHeadphones, FaQuestionCircle, FaUserCircle, FaStar } from "react-icons/fa";
import { Layout } from '../../layouts';
import {VerticalMultiLevelNavbar} from '../../components/Menu/Menu';
import menuItems from '../../data/menu.json';
import { getMenu } from '../../data/menu.js';
import Details from '../../data/details.json';
import { Logo } from '../../lib/Illustrations';
const BoxedLeftSidebar = () => {

    const [proItems, setProItems] = useState([]);
    const [remoteItems, setRemoteItems] = useState([]);
    useEffect(() => {
        // Check if the Pro version has loaded its global component hook
        if (window.BillManagerProComponents && window.BillManagerProComponents.menuItems) {
            setProItems(() => window.BillManagerProComponents.menuItems);
        }
        // console.log('Feedback component mounted. ProContactForm available:', !!window.BillManagerProComponents?.ContactForm);
    }, []);
    
    // Optional: load remote injected menu items
    useEffect(() => {
        if (bill_manager_ajax_obj?.extraMenuItems) {
            setRemoteItems(bill_manager_ajax_obj.extraMenuItems);
        }
    }, []);

    // Icon mapping
    const iconMap = {
        'page': <FaHome />,
        'layouts': <FaColumns />,
        'basic-inputs': <FaCog />,
        'array-inputs': <FaCrown />,
        'import-export': <FaCrown />,
        'more': <FaCrown />,
        'tools': <FaHome />,
        'feedback': <FaComment />,
        'support': <FaHeadphones />,
        'help': <FaQuestionCircle />,
    };

    // Get menu data from menu.js
    const menuData = getMenu({menuItems:menuItems, proItems: proItems, remoteItems:remoteItems});
    
    // Add icons to menu items
    const menuItemsWithIcons = menuData.map(item => ({
        ...item,
        icon: iconMap[item.itemKey] || <FaCog />
    }));

    const sidebar = (
        <>
            <VerticalMultiLevelNavbar
                headerContent={{
                    logo: <Logo width={36} height={36} />,
                    text: __("Bill Manager", "bill-manager"),
                }}
                MenuItems={menuItemsWithIcons}
                footerContent={(
                    <Nav className="flex-column">
                        <Nav.Link href="https://wordpress.org/support/plugin/bill-manager/" target='_blank' className="d-flex align-items-center gap-2" style={{paddingLeft: 16}}>
                            <FaHeadphones />
                            {__("VIP Priority Support", "bill-manager")} 
                        </Nav.Link>
                        <Nav.Link href="https://mostak-shahid.github.io/plugins/bill-manager.html" target='_blank' className="d-flex align-items-center gap-2" style={{paddingLeft: 16}}>
                            <FaQuestionCircle />
                            {__("Help Center", "bill-manager")}
                        </Nav.Link>
                        <Nav.Link href="https://www.facebook.com/mospressbd" target='_blank' className="d-flex align-items-center gap-2" style={{paddingLeft: 16}}>
                            <FaUserCircle />
                            {__("Community", "bill-manager")}
                        </Nav.Link>
                        <Nav.Link href="https://wordpress.org/support/plugin/bill-manager/reviews/" target='_blank' className="d-flex align-items-center gap-2" style={{paddingLeft: 16}}>
                            <FaStar />
                            {__("Rate Us", "bill-manager")}
                        </Nav.Link>
                    </Nav>
                )}
            />
        </>
    );
    return (
        <Layout sidebarPosition="left" sidebar={sidebar} className="border-start border-end ps-0 pe-0">     
            <Card>
                <Card.Header>Featured</Card.Header>
                <Card.Body>
                    <Card.Title>Special title treatment</Card.Title>
                    <Card.Text>
                    With supporting text below as a natural lead-in to additional content.
                    </Card.Text>
                    <Button variant="primary">Go somewhere</Button>
                </Card.Body>
            </Card>
        </Layout>
    );
};

export default BoxedLeftSidebar;