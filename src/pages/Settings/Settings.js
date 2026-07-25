import { useState, useEffect, useRef } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { Outlet, useLocation } from 'react-router-dom';
import { Card, Button, Nav } from 'react-bootstrap';
import { FaHome, FaCog, FaHeadphones, FaQuestionCircle, FaUserCircle, FaStar, } from "react-icons/fa";

import { Layout } from '../../layouts';
import { VerticalMultiLevelNavbar } from '../../components/Menu/Menu';
import menuItems from '../../data/menu.json';
import { getMenu } from '../../data/menu.js';
// import { setNestedValue } from '../../lib/Helpers.js';
import BreadcrumbControl from '../../components/BreadcrumbControl/BreadcrumbControl';
import ToastControl from '../../components/ToastControl/ToastControl.js';
import { PageInfo } from '../../components/index.js';
import './Settings.css'
const Settings = ({settings, settingsDetails, settingsLoading, handleChange, settingsReload, setSettingsReload}) => {
    // {console.log(settings)}
    // {console.log(settingsReload)}

    // const [settings, setSettings] = useState({});
    // const [settingsDetails, setSettingsDetails] = useState({});
    // const [settingsLoading, setSettingsLoading] = useState(false);
    // const [settingsReload, setSettingsReload] = useState(0);

    const location = useLocation();

    const [proItems, setProItems] = useState([]);
    const [remoteItems, setRemoteItems] = useState([]);


    const [saving, setSaving] = useState(false);
    const [reseating, setReseating] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [dataToast, setDataToast] = useState({ title: '', content: '', type: 'success' });
    const toggleShowToast = () => setShowToast(!showToast);

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
        // 'page': <FaHome />,
        'inputs': <FaHome />,
        // 'basic-inputs': <FaCog />,
    };

    // Get menu data from menu.js
    const menuData = getMenu({ menuItems: menuItems, proItems: proItems, remoteItems: remoteItems });

    // Add icons to menu items
    const menuItemsWithIcons = menuData.map(item => ({
        ...item,
        icon: iconMap[item.itemKey] || <FaCog />
    }));
    const sidebar = (
        <>
            <VerticalMultiLevelNavbar
                MenuItems={menuItemsWithIcons}
                footerContent={(
                    <Nav className="flex-column">
                        <Nav.Link href="https://wordpress.org/support/plugin/bill-manager/" target='_blank' className="d-flex align-items-center gap-2" style={{ paddingLeft: 16 }}>
                            <FaHeadphones />
                            {__("VIP Priority Support", "bill-manager")}
                        </Nav.Link>
                        <Nav.Link href="https://mostak-shahid.github.io/plugins/bill-manager.html" target='_blank' className="d-flex align-items-center gap-2" style={{ paddingLeft: 16 }}>
                            <FaQuestionCircle />
                            {__("Help Center", "bill-manager")}
                        </Nav.Link>
                        <Nav.Link href="https://www.facebook.com/mospressbd" target='_blank' className="d-flex align-items-center gap-2" style={{ paddingLeft: 16 }}>
                            <FaUserCircle />
                            {__("Community", "bill-manager")}
                        </Nav.Link>
                        <Nav.Link href="https://wordpress.org/support/plugin/bill-manager/reviews/" target='_blank' className="d-flex align-items-center gap-2" style={{ paddingLeft: 16 }}>
                            <FaStar />
                            {__("Rate Us", "bill-manager")}
                        </Nav.Link>
                    </Nav>
                )}
            />
        </>
    );


    // useEffect(() => {
    //     const fetchSettings = async () => {
    //         setSettingsLoading(true);
    //         try {
    //             // Both requests start at the exact same time
    //             const [data, dataDetails] = await Promise.all([
    //                 apiFetch({ path: '/bill-manager/v1/options' }),
    //                 apiFetch({ path: '/bill-manager/v1/options-details' })
    //             ]);

    //             // Access the parsed JSON results instantly
    //             // console.log('data:', data);
    //             // console.log('dataDetails:', dataDetails);
    //             if (data && dataDetails) {
    //                 setSettings(data);
    //                 setSettingsDetails(dataDetails);
    //             }
    //         } catch (error) {
    //             console.error("Error fetching settings:", error);
    //             setDataToast({
    //                 title: __("Error", "bill-manager"),
    //                 content: __("Error fetching settings", "bill-manager"),
    //                 type: 'danger'
    //             });
    //             setShowToast(true);
    //         } finally {
    //             setSettingsLoading(false);
    //         }
    //     };
    //     fetchSettings();
    // }, [settingsReload]);


    // const handleChange = (fieldPath, value) => {
    //     // console.log("Field changed:", fieldPath, "New value:", value);
    //     setSettings(prev => {
    //         const updatedOptions = setNestedValue(prev, fieldPath, value);
    //         return { ...updatedOptions }; // Ensure React detects the update
    //     });
    // };

    // const handleSubmit = async (section, values) => {
    const handleSubmit = async () => {
        const saveRoot = bill_manager_ajax_obj?.isPro ? 'bill-manager-pro' : 'bill-manager';
        try {
            setSaving(true);
            const result = await apiFetch({
                path: `/${saveRoot}/v1/options`,
                method: 'POST',
                // data: { bill_manager_options: { ...settings, [section]: values } }
                data: { bill_manager_options: settings }
            });
            if (result.success) {
                setSettingsReload(Math.random());
                setDataToast({
                    title: __("Success", "bill-manager"),
                    content: __("Settings saved successfully!!!", "bill-manager"),
                    type: 'success'
                });
                setShowToast(true);

            } else {
                setDataToast({
                    title: __("Error", "bill-manager"),
                    content: __("Error saving settings. Please try again.", "bill-manager"),
                    type: 'danger'
                });
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setDataToast({
                title: __("Error", "bill-manager"),
                content: __("Error saving settings. Please try again.", "bill-manager"),
                type: 'danger'
            });
            setShowToast(true);
        } finally {
            setSettingsReload(prev => prev + 1);
            setSaving(false);
        }
    };

    const handleReset = async (section) => {
        try {
            setReseating(true);
            const result = await apiFetch({
                path: "/bill-manager/v1/options/reset-settings",
                method: 'POST',
                data: { name: section }
            });
            if (result.success) {
                setSettingsReload(Math.random());
                setDataToast({
                    title: __("Success", "bill-manager"),
                    content: __("Settings reset successfully!", "bill-manager"),
                    type: 'success'
                });
                setShowToast(true);
            } else {
                setDataToast({
                    title: __("Error", "bill-manager"),
                    content: __("Error resetting settings. Please try again.", "bill-manager"),
                    type: 'danger'
                });
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error resetting settings:", error);
            setDataToast({
                title: __("Error", "bill-manager"),
                content: __("Error resetting settings. Please try again.", "bill-manager"),
                type: 'danger'
            });
            setShowToast(true);
        } finally {
            setSettingsReload(prev => prev + 1);
            setReseating(false)
        }
    };

    // Bridge + HOC setup, We will need a lib/Bridge.js too
    // 1. Add these to your imports
    // import { useRef } from '@wordpress/element';

    // 2. Add this inside your Settings component
    const listeners = useRef(new Set());
    const bridgeRef = useRef({ settings, settingsDetails, settingsLoading, handleChange, setSettingsReload });

    // 3. Update the bridge object whenever state changes
    useEffect(() => {
        bridgeRef.current = { settings, settingsDetails, settingsLoading, handleChange, setSettingsReload };
        // Notify all subscribers
        listeners.current.forEach(listener => listener(bridgeRef.current));
    }, [settings, settingsDetails, settingsLoading, handleChange, setSettingsReload]);

    // 4. Expose the subscribe method on the window object
    useEffect(() => {
        window.BillManagerBridge = {
            get: () => bridgeRef.current,
            subscribe: (listener) => {
                listeners.current.add(listener);
                return () => listeners.current.delete(listener);
            }
        };
    }, []);

    return (
        <Layout sidebarPosition="left" sidebar={sidebar} fluid={true} className='settings-page-layout'>
            {/* {console.log(settingsReload)} */}
            {/* {console.log('Current settings:', settings)} */}
            <BreadcrumbControl menu={menuData} url={location.pathname} className='mb-3 border rounded-0 py-2 px-3' />
            <div className='mb-3 border rounded-0 p-3'>
                <PageInfo menu={menuData} url={location.pathname} />
            </div>
            <div className='px-3 border'>
                <Outlet
                    context={{ settings, settingsDetails, settingsLoading, handleChange, setSettingsReload }}
                />
                {/* {console.log(location.pathname)} */}
                {
                    (
                        location.pathname !== '/settings/utilities/import_export'
                        && location.pathname !== '/settings/utilities/logs/table'
                        && location.pathname !== '/settings/utilities/logs/analytics'
                    )
                    &&
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? __('Saving', 'bill-manager') : __('Save', 'bill-manager')}
                        </Button>
                        <Button
                            variant="danger"
                            disabled={reseating}
                            onClick={() => handleReset(location.pathname.split('/').filter(Boolean).slice(1).join('.'))}
                        >
                            {reseating ? __('Reseting', 'bill-manager') : __('Reset', 'bill-manager')}
                            {/* {path.split('/').filter(Boolean).slice(1).join('.')} */}
                            {/* {result = path.replace(/^\/[^\/]+\//, '').replace(/\//g, '.');} */}
                            {/* {console.log(location.pathname.split('/').filter(Boolean).slice(1).join('.'))} */}
                        </Button>
                    </div>
                }
            </div>
            <ToastControl
                show={showToast}
                onClose={toggleShowToast}
                data={dataToast}
            />
        </Layout>
    );
};

export default Settings;