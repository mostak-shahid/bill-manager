import {Card, Button} from 'react-bootstrap';
import { FaHome, FaColumns, FaCog, FaComment, FaCrown } from "react-icons/fa";
import { Layout } from '../../layouts';
import {HorizontalMultiLevelNavbar, VerticalMultiLevelNavbar} from '../../components/Menu/Menu';
const MenuItems = [
    { itemKey: 'dashboard', text: 'Dashboard', icon: <FaHome />, url: '/' },
    { 
        itemKey: 'layouts', 
        text: 'Layouts', 
        icon: <FaColumns />,
        url: '/layouts',
        items: [
            { itemKey: 'about', text: 'About', url: '/about' },
            { itemKey: 'contact', text: 'Contact', url: '/contact' },
            { itemKey: 'layouts-boxed', text: 'Boxed Layouts', url: '/layouts/boxed',
                items: [
                    { itemKey: 'layouts-boxed-nosidebar', text: 'No Sidebar', url: '/layouts/boxed/nosidebar' },
                    { itemKey: 'layouts-boxed-left-sidebar', text: 'Left Sidebar', url: '/layouts/boxed/left-sidebar' },
                    { itemKey: 'layouts-boxed-right-sidebar', text: 'Right Sidebar', url: '/layouts/boxed/right-sidebar' },
                ] 
            },
            { itemKey: 'layouts-full', text: 'Full Layouts', url: '/layouts/full',
                items: [
                    { itemKey: 'layouts-full-nosidebar', text: 'No Sidebar', url: '/layouts/full/nosidebar' },
                    { itemKey: 'layouts-full-left-sidebar', text: 'Left Sidebar', url: '/layouts/full/left-sidebar' },
                    { itemKey: 'layouts-full-right-sidebar', text: 'Right Sidebar', url: '/layouts/full/right-sidebar' },
                ] 
            },
        ] 
    },
    { itemKey: 'settings', text: 'Settings', icon: <FaCog />, url: '/settings' },
    { itemKey: 'feedback', text: 'Feedback', icon: <FaComment />, url: '/feedback' },
    ...(!bill_manager_ajax_obj?.isPro ? [{ itemKey: 'free-vs-pro', text: 'Free vs Pro', icon: <FaCrown />, url: '/free-vs-pro' }] : []),
];
const FullWidthLeftSidebar = () => {
    const sidebar = (
        <>
            <VerticalMultiLevelNavbar
                MenuItems={MenuItems}
            />
        </>
    );
    return (
        <Layout sidebarPosition="left" sidebar={sidebar} fluid={true}>     
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

export default FullWidthLeftSidebar;