import { useState, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Alert, Button, Container, Row, Col, Badge, Modal, Form, FloatingLabel } from 'react-bootstrap';

import { FaHome, FaStar, FaCog, FaColumns, FaCrown, FaRegSun, FaRegMoon, FaComment, FaBell, FaSearch, FaHeadphones, FaQuestionCircle, FaUserCircle, FaSpinner } from "react-icons/fa";

import { useSettingsBodyHeight } from './lib/Helpers';
import { Logo } from './lib/Illustrations';
import Details from './data/details.json';
import { HorizontalMultiLevelNavbar } from './components/Menu/Menu';
import { useWindowWidth, setNestedValue } from './lib/Helpers'
import menuItems from './data/menu.json';
import { getMenu } from './data/menu.js';

import { Dashboard, Settings, ImportExport, Feedback, FreeVsPro, Tools, LogsTable } from './pages';
import NotFound from './NotFound'

import {
    BasicInputs,
    ArrayInputs,
    ComplexInputs,
    BoxedLeftSidebar,
    BoxedNoSidebar,
    BoxedRightSidebar,
    FullWidthLeftSidebar,
    FullWidthNoSidebar,
    FullWidthRightSidebar,
} from './pages';
import LogsCharts from './pages/Settings/Logs/LogsCharts.jsx';
import { ToastControl } from './components/index.js';
const year = new Date().getFullYear();

const pathPrefix = 'admin.php?page=bill-manager#'; // Adjust this if your app is served from a different base path
export default function App() {
    const location = useLocation();
    const currentPath = location.pathname;

    const width = useWindowWidth();
    const hasHiddenMenues = width <= 991;

    const [darkmode, setDarkmode] = useState(false);
    useEffect(() => {
        const fetchSettingTheme = async () => {
            try {
                const params = new URLSearchParams({
                    id: bill_manager_ajax_obj.get_current_user_id,
                });
                const theme = await apiFetch({
                    path: `/bill-manager/v1/get-settings-theme?${params.toString()}`,
                    method: 'GET'
                });
                const isDark = theme === 'dark' || (theme && theme.value === 'dark');
                setDarkmode(isDark);
                document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
            } catch (err) {
                console.error('API error:', err);
            }
        };
        fetchSettingTheme();
    }, []);

    const switchingMode = async () => {
        const switchMode = !darkmode;
        setDarkmode(switchMode);
        document.documentElement.setAttribute('data-bs-theme', switchMode ? 'dark' : 'light');
        try {
            const params = new URLSearchParams({
                id: bill_manager_ajax_obj.get_current_user_id,
                settings_theme: switchMode ? 'dark' : 'light',
            });
            await apiFetch({
                path: `/bill-manager/v1/set-settings-theme?${params.toString()}`,
            });
        } catch (error) {
            console.error("Error fetching settings data:", error);
        }
    };


    const [ProPluginNews, setProPluginNews] = useState(null);
    const [ProMore, setProMore] = useState(null);
    const [ProPropsPassing, setProPropsPassing] = useState(null);
    const [ProBridge, setProBridge] = useState(null);

    useEffect(() => {
        // Check if the Pro version has loaded its global component hook
        if (window.BillManagerProComponents && window.BillManagerProComponents.PluginNews) {
            setProPluginNews(() => window.BillManagerProComponents.PluginNews);
        }
        // console.log('Feedback component mounted. ProPluginNews available:', !!window.BillManagerProComponents?.PluginNews);

        // Check if the Pro version has loaded its global component hook
        if (window.BillManagerProComponents && window.BillManagerProComponents.More) {
            setProMore(() => window.BillManagerProComponents.More);
        }
        // console.log('Feedback component mounted. ProPluginNews available:', !!window.BillManagerProComponents?.More);

        // Check if the Pro version has loaded its global component hook
        if (window.BillManagerProComponents && window.BillManagerProComponents.PropsPassing) {
            setProPropsPassing(() => window.BillManagerProComponents.PropsPassing);
        }
        // console.log('Feedback component mounted. ProPluginNews available:', !!window.BillManagerProComponents?.PropsPassing);

        // Check if the Pro version has loaded its global component hook
        if (window.BillManagerProComponents && window.BillManagerProComponents.Bridge) {
            setProBridge(() => window.BillManagerProComponents.Bridge);
        }
        // console.log('Feedback component mounted. ProPluginNews available:', !!window.BillManagerProComponents?.Bridge);
    }, []);


    const [newsCount, setNewsCount] = useState([]);
    const [newsVisible, setNewsVisible] = useState(false);
    if (bill_manager_ajax_obj?.isPro === '1') {
        useEffect(() => {
            const fetchNews = async () => {
                try {
                    // Sends data directly to the native WordPress custom REST API endpoint
                    const response = await apiFetch({
                        path: '/bill-manager-pro/v1/news',
                        method: 'GET'
                    });
                    setNewsCount(response.count);
                } catch (error) {
                    console.error("Error fetching news:", error);
                }
            };
            fetchNews();
        }, []);
    }


    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState([]);
    const modalClose = () => {
        setShowModal(false);
        setSearch('');
        setSearchResult([]);
    }
    const modalShow = () => setShowModal(true);
    useEffect(() => {

        // 1. Don't search if the input is empty
        if (!search.trim()) {
            setSearchResult([]);
            return;
        }

        // 2. Create an AbortController to cancel this request if input changes again
        const controller = new AbortController();
        const { signal } = controller;

        // 3. Set up the debounce timer
        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            try {
                const params = new URLSearchParams({
                    search: search,
                });
                const result = await apiFetch({
                    path: `/bill-manager/v1/options-details?${params.toString()}`,
                    method: 'GET'
                });
                setSearchResult(result)
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Search error:', error);
                }
            } finally {
                setSearching(false);
            }
        }, 300); // 300ms wait time

        // 4. Cleanup function: runs when searchTerm changes or component unmounts
        return () => {
            clearTimeout(delayDebounceFn);
            controller.abort();
        };

        // const doSearch = async () => {
        //     try {
        //         const params = new URLSearchParams({
        //             search: search,
        //         });
        //         const result = await apiFetch({
        //             path: `/bill-manager/v1/options-details?${params.toString()}`,
        //             method: 'GET'
        //         });
        //         if (result) {
        //             setSearchResult(result)
        //         }
        //     } catch (err) {
        //         console.error('API error:', err);
        //     }
        // };
        // if (search.length > 3) doSearch();
    }, [search]);

    const [proItems, setProItems] = useState([]);
    const [remoteItems, setRemoteItems] = useState([]);

    useEffect(() => {
        // Check if the Pro version has loaded its global component hook
        if (window.BillManagerProComponents && window.BillManagerProComponents.menuItems) {
            setProItems(() => window.BillManagerProComponents.menuItems);
        }
    }, []);

    // Optional: load remote injected menu items
    useEffect(() => {
        if (bill_manager_ajax_obj?.extraMenuItems) {
            setRemoteItems(bill_manager_ajax_obj.extraMenuItems);
        }
    }, []);

    // Get dynamic settings menu items
    const settingsMenuData = getMenu({ baseMenu: menuItems, proItems, remoteItems });

    const HorizontalMenuItems = [
        { itemKey: 'dashboard', text: 'Dashboard', icon: <FaHome />, url: '/' },
        {
            itemKey: 'layouts',
            text: 'Layouts',
            icon: <FaColumns />,
            url: '/layouts',
            items: [
                { itemKey: 'about', text: 'About', url: '/about' },
                { itemKey: 'contact', text: 'Contact', url: '/contact' },
                {
                    itemKey: 'layouts-boxed', text: 'Boxed Layouts', url: '/layouts/boxed',
                    items: [
                        { itemKey: 'layouts-boxed-nosidebar', text: 'No Sidebar', url: '/layouts/boxed/nosidebar' },
                        { itemKey: 'layouts-boxed-left-sidebar', text: 'Left Sidebar', url: '/layouts/boxed/left-sidebar' },
                        { itemKey: 'layouts-boxed-right-sidebar', text: 'Right Sidebar', url: '/layouts/boxed/right-sidebar' },
                    ]
                },
                {
                    itemKey: 'layouts-full', text: 'Full Layouts', url: '/layouts/full',
                    items: [
                        { itemKey: 'layouts-full-nosidebar', text: 'No Sidebar', url: '/layouts/full/nosidebar' },
                        { itemKey: 'layouts-full-left-sidebar', text: 'Left Sidebar', url: '/layouts/full/left-sidebar' },
                        { itemKey: 'layouts-full-right-sidebar', text: 'Right Sidebar', url: '/layouts/full/right-sidebar' },
                    ]
                },
            ]
        },
        {
            itemKey: 'settings',
            text: 'Settings',
            icon: <FaCog />,
            url: '/settings',
            className: `${currentPath.startsWith('/settings/') ? 'current' : ''}`.trim(),
            // items: hasHiddenMenues?settingsMenuData:[] // <-- Bind the dynamic Settings menu items here!
            ...(hasHiddenMenues ? { items: settingsMenuData } : {}) // <-- Submenu only below 991px
            // ...(hasHiddenMenues && [{items: settingsMenuData}] )
        },
        { itemKey: 'feedback', text: 'Feedback', icon: <FaComment />, url: '/feedback' },
        ...(!bill_manager_ajax_obj?.isPro ? [{ itemKey: 'free-vs-pro', text: 'Free vs Pro', icon: <FaCrown />, url: '/free-vs-pro' }] : []),
    ];




    const [showToast, setShowToast] = useState(false);
    const [dataToast, setDataToast] = useState({ title: '', content: '', type: 'success' });
    const toggleShowToast = () => setShowToast(!showToast);

    const [settings, setSettings] = useState({});
    const [settingsDetails, setSettingsDetails] = useState({});
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsReload, setSettingsReload] = useState(0);

    useEffect(() => {
        const fetchSettings = async () => {
            setSettingsLoading(true);
            try {
                // Both requests start at the exact same time
                const [data, dataDetails] = await Promise.all([
                    apiFetch({ path: '/bill-manager/v1/options' }),
                    apiFetch({ path: '/bill-manager/v1/options-details' })
                ]);

                // Access the parsed JSON results instantly
                // console.log('data:', data);
                // console.log('dataDetails:', dataDetails);
                if (data && dataDetails) {
                    setSettings(data);
                    setSettingsDetails(dataDetails);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                setDataToast({
                    title: __("Error", "bill-manager"),
                    content: __("Error fetching settings", "bill-manager"),
                    type: 'danger'
                });
                setShowToast(true);
            } finally {
                setSettingsLoading(false);
            }
        };
        fetchSettings();
    }, [settingsReload]);

    const handleChange = (fieldPath, value) => {
        // console.log("Field changed:", fieldPath, "New value:", value);
        setSettings(prev => {
            const updatedOptions = setNestedValue(prev, fieldPath, value);
            return { ...updatedOptions }; // Ensure React detects the update
        });
    };

    //settings, settingsDetails, settingsLoading, handleChange, setSettingsReload

    return (
        <div className="bill-manager-settings-container">
            {!bill_manager_ajax_obj?.isPro &&
                <div className="bill-manager-promote-banner">
                    <Alert variant='info' className='rounded-0 mb-0'>
                        {__('You\'re currently using the Free plan. ', 'bill-manager')}
                        {__('Some settings and features are only available in ', 'bill-manager')}
                        <a className="link-underline link-underline-opacity-0" href={bill_manager_ajax_obj?.proURL} target="_blank" rel="noopener noreferrer">{__('the Pro version.', 'bill-manager')}</a>
                    </Alert>
                </div>
            }
            {/* Main Navigation Header */}
            <header className="bill-manager-header border-bottom">
                <HorizontalMultiLevelNavbar
                    MenuItems={HorizontalMenuItems}
                    headerContent={{
                        logo: <Logo width={36} height={36} />,
                        text: Details?.name,
                    }}
                    footerContent={(
                        <div className="header-icon-menu d-flex align-items-center gap-2 pe-2">
                            <Button
                                className='d-none d-lg-inline-block'
                                variant="outline-secondary"
                                size="sm"
                                aria-label={__("Seach", 'bill-manager')}
                                onClick={modalShow}
                            >
                                <FaSearch />
                            </Button>
                            <Button
                                className='d-none d-lg-inline-block'
                                variant="outline-secondary"
                                size="sm"
                                aria-label="Mode"
                                onClick={switchingMode}
                            >
                                {darkmode ? <FaRegSun /> : <FaRegMoon />}
                            </Button>
                            <Button
                                className='d-inline-block d-lg-none'
                                variant="outline-secondary"
                                size="sm"
                                aria-label={__("VIP Priority Support", 'bill-manager')}
                                onClick={() => window.open('https://wordpress.org/support/plugin/bill-manager/', '_blank')}
                            >
                                <FaHeadphones />
                            </Button>
                            <Button
                                className='d-inline-block d-lg-none'
                                variant="outline-secondary"
                                size="sm"
                                aria-label={__("Help Center", 'bill-manager')}
                                onClick={() => window.open('https://mostak-shahid.github.io/plugins/bill-manager.html', '_blank')}
                            >
                                <FaQuestionCircle />
                            </Button>
                            <Button
                                className='d-inline-block d-lg-none'
                                variant="outline-secondary"
                                size="sm"
                                aria-label={__("Community", 'bill-manager')}
                                onClick={() => window.open('https://www.facebook.com/mospressbd', '_blank')}
                            >
                                <FaUserCircle />
                            </Button>

                            <Button
                                className='d-inline-block d-lg-none'
                                variant="outline-secondary"
                                size="sm"
                                aria-label={__("Help Center", 'bill-manager')}
                                onClick={() => window.open('https://wordpress.org/support/plugin/bill-manager/reviews/', '_blank')}
                            >
                                <FaStar />
                            </Button>
                            {bill_manager_ajax_obj?.isPro &&
                                <div className="position-relative">
                                    <Button
                                        className='d-none d-lg-inline-block'
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => setNewsVisible(true)} aria-label="News"
                                    >
                                        <FaBell />
                                    </Button>
                                    {newsCount > 0 && (
                                        <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
                                            {newsCount > 99 ? '99+' : newsCount}
                                        </Badge>
                                    )}
                                </div>
                            }
                        </div>
                    )}
                    toggleContent={(
                        <div className="header-icon-menu d-flex align-items-center gap-2 pe-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                aria-label={__("Seach", 'bill-manager')}
                                onClick={modalShow}
                            >
                                <FaSearch />
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                aria-label="Mode"
                                onClick={switchingMode}
                            >
                                {darkmode ? <FaRegSun /> : <FaRegMoon />}
                            </Button>
                            {bill_manager_ajax_obj?.isPro &&
                                <div className="position-relative">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => setNewsVisible(true)} aria-label="News"
                                    >
                                        <FaBell />
                                    </Button>
                                    {newsCount > 0 && (
                                        <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle">
                                            {newsCount > 99 ? '99+' : newsCount}
                                        </Badge>
                                    )}
                                </div>
                            }
                        </div>
                    )}
                />
            </header>
            {/* Dynamic Dashboard Viewport */}
            <main className="bill-manager-content">
                {ProPluginNews && <ProPluginNews showOffcanvas={newsVisible} setShowOffcanvas={setNewsVisible} />}

                <Routes>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="/layouts">
                        <Route index element={<Navigate to="boxed/nosidebar" replace />} />
                        <Route path="boxed/nosidebar" element={<BoxedNoSidebar />} />
                        <Route path="boxed/left-sidebar" element={<BoxedLeftSidebar />} />
                        <Route path="boxed/right-sidebar" element={<BoxedRightSidebar />} />
                        <Route path="full/nosidebar" element={<FullWidthNoSidebar />} />
                        <Route path="full/left-sidebar" element={<FullWidthLeftSidebar />} />
                        <Route path="full/right-sidebar" element={<FullWidthRightSidebar />} />
                    </Route>
                    {/* <Route path="/settings" element={<Settings />} /> */}
                    <Route path="/settings" element={<Settings settings={settings} settingsDetails={settingsDetails} settingsLoading={settingsLoading} handleChange={handleChange} settingsReload={settingsReload} setSettingsReload={setSettingsReload} />}>
                        <Route index element={<Navigate to="inputs/basic_inputs" replace />} />
                        <Route path="inputs" element={<Navigate to="basic_inputs" replace />} />

                        <Route path="inputs/basic_inputs" element={<BasicInputs />} />
                        <Route path="inputs/array_inputs" element={<ArrayInputs />} />
                        <Route path="inputs/complex_inputs" element={<ComplexInputs />} />
                        {ProPropsPassing && <Route path="inputs/props_passing" element={<ProPropsPassing settings={settings} settingsDetails={settingsDetails} settingsLoading={settingsLoading} handleChange={handleChange} settingsReload={settingsReload} setSettingsReload={setSettingsReload} />} />}
                        {ProBridge && <Route path="inputs/bridge" element={<ProBridge />} />}

                        <Route path="utilities" element={<Navigate to="import_export" replace />} />
                        <Route path="utilities/import_export" element={<ImportExport />} />
                        <Route path="utilities/tools" element={<Tools />} />
                        <Route path="utilities/logs" element={<Navigate to="table" replace />} />
                        <Route path="utilities/logs/table" element={<LogsTable />} />
                        <Route path="utilities/logs/analytics" element={<LogsCharts />} />

                        {ProMore && <Route path="more" element={<ProMore />} />}
                    </Route>

                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/free-vs-pro" element={<FreeVsPro />} />
                    {/* <Route path="*" element={<Navigate replace to="/" />} /> */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <footer className="bill-manager-footer border-top" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <Container fluid={true}>
                    <Row className="align-items-center justify-content-between py-3">
                        <Col xs={12} lg={6} className="text-center text-lg-start mb-2 mb-lg-0">
                            <span>{__(`Copyright © ${year} `, 'bill-manager')}</span>
                            <a href={Details?.authorURI} target="_blank" rel="noopener noreferrer">{Details?.author}.</a>
                            <span>{__(` All Rights Reserved.`, 'bill-manager')}</span>
                        </Col>
                        <Col xs={12} lg={6} className="text-center text-lg-end">
                            <div className="d-flex align-items-center justify-content-center justify-content-lg-end gap-2 flex-wrap">
                                {bill_manager_ajax_obj?.isPro === '1' ? (
                                    <>
                                        <Badge bg="warning" text="dark">{__('Pro', "bill-manager")}</Badge>
                                        <Badge bg="info">{bill_manager_ajax_obj?.proVersion}</Badge>
                                    </>
                                ) : (
                                    <>
                                        <Badge bg="secondary">{__('Free', "bill-manager")}</Badge>
                                        <Badge bg="info">{Details?.version}</Badge>
                                    </>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
            <Modal show={showModal} onHide={modalClose}>
                <Modal.Body>
                    <FloatingLabel
                        controlId="settings-search"
                        label={__('Search Settings', 'bill-manager')}
                    // className="mb-3"
                    >
                        <Form.Control type="search" placeholder={__('Search Settings', 'bill-manager')} value={search} onChange={(e) => setSearch(e.target.value)} />
                    </FloatingLabel>
                    {
                        searching && <div className="text-center border rounded-2 mt-2 p-3"><FaSpinner className='fa-spin-pulse' /></div>
                    }
                    {searchResult.length ?
                        <div className='search-results border rounded-2 mt-2'>
                            {searchResult.map((item, index) => (
                                <a
                                    key={index}
                                    href={pathPrefix + item.url}
                                    className='btn d-block p-2 border-bottom text-start rounded-0'
                                    onClick={modalClose}
                                >
                                    <span className='link-title d-block fw-semibold'>{item.title}</span>
                                    <span className='link-url d-block'>{item.url}</span>
                                </a>
                            ))}
                        </div>
                        : ''}
                </Modal.Body>
            </Modal>

            <ToastControl
                show={showToast}
                onClose={toggleShowToast}
                data={dataToast}
            />
        </div>
    );
}
