import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import apiFetch from '@wordpress/api-fetch';
import { useOutletContext } from 'react-router-dom';
import {Row, Col, Button, Form} from 'react-bootstrap';
import { FaDownload, FaUpload, FaSync, FaTrash, FaEyeSlash, FaEye } from "react-icons/fa";

import ToastControl from '../../components/ToastControl/ToastControl';

const ImportExport = () => {
    const { settings, settingsLoading, handleChange, setSettingsReload } = useOutletContext();    
    const [processingExport, setProcessingExport] = useState(false);
    
    
    const [processingImport, setProcessingImport] = useState(false);
    const [fileInfo, setFileInfo] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [showContent, setShowContent] = useState(false);

    const fileInputRef = useRef(null);
    const [apiStatus, setApiStatus] = useState({ type: '', message: '' });



    const [showToast, setShowToast] = useState(false);
    const [dataToast, setDataToast] = useState({title: '', content: '', type: 'success'});
    const toggleShowToast = () => setShowToast(!showToast);


    const handleExport = async() => {
        setProcessingExport(true);
        try {
            const data = await apiFetch({
                path: "/bill-manager/v1/options",
                method: 'GET'
            });
            if (data) {
                // setSettings(data);
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'bill-manager-settings.json';
                link.click();
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setProcessingExport(false);
        }        
        // toast.success(__('Settings exported successfully', 'bill-manager'));
    };

    // Handle file selection and reading
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Save metadata
        setFileInfo({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type,
        });

        // Read file content
        const reader = new FileReader();
        reader.onload = (event) => {
            setFileContent(event.target.result);
        };
        reader.readAsText(file);
        setApiStatus({ type: '', message: '' }); // Clear previous alerts
    };

    // Trigger hidden file input
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };


    // Reset state to initial upload button only
    const handleRemoveFile = () => {
        setFileInfo(null);
        setFileContent('');
        setApiStatus({ type: '', message: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Submit imported JSON
    const handleImport = async () => {
        setProcessingImport(true);
        // console.log(fileContent);
        try {
            const parsed = JSON.parse(fileContent);
            const response = await apiFetch({
                path: '/bill-manager/v1/options/import-settings',
                method: 'POST',
                data: parsed,
            });

            if (response.success) {
                setProcessingImport(false);
                setDataToast({
                    title: __("Success", "bill-manager"),
                    content: __("Settings imported successfully!", "bill-manager"),
                    type: 'success'
                });
                setShowToast(true);
                setSettingsReload(Math.random());
                
            } else {
                // toast.error(__('Import failed', 'bill-manager'));
                setProcessingImport(false);
            }
        } catch (e) {
            // toast.error(__('Invalid JSON content', 'bill-manager'));
            console.log(e);
            setProcessingImport(false);
        } finally {
            setProcessingImport(false);
        }
    };
    return (
        <>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("Export Settings", "bill-manager")}</h6>
                        <p>{__("Export your current settings", "bill-manager")}</p>
                        
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <Button 
                                variant="outline-secondary"
                                onClick={handleExport}
                                disabled={processingExport}
                            >
                                
                                {processingExport
                                    ? <FaSync className='fa-spin' /> 
                                    : <FaUpload />     
                                }
                                <span className='ms-2'>{processingExport?__( "Exporting...", "bill-manager" ):__( "Export Settings", "bill-manager" )}</span>        
                            </Button>
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("Import Settings", "bill-manager")}</h6>
                        <p>{__("Import your old settings", "bill-manager")}</p>
                        
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <Form.Group className="mb-3">
                                {/* Hidden native input restricted to JSON */}
                                <input
                                    type="file"
                                    accept=".json,application/json"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
            
                                {fileInfo 
                                    ? (
                                        <div className="d-flex gap-2">
                                            <Button 
                                                variant="outline-secondary"
                                                onClick={handleImport}
                                                disabled={processingImport}
                                            >                                                
                                                {processingImport
                                                    ? <FaSync className='fa-spin' /> 
                                                    : <FaDownload />     
                                                }
                                                <span className='ms-2'>{processingImport?__( "Importing...", "bill-manager" ):__( "Import Settings", "bill-manager" )}</span>        
                                            </Button>
                                            <Button 
                                                variant="outline-info" 
                                                onClick={() => setShowContent(!showContent)}
                                                disabled={processingImport}
                                            >
                                                { showContent?<FaEyeSlash />:<FaEye />} 
                                                <span className='ms-2'>
                                                    { showContent?__('Hide Data', 'bill-manager'):__('Show Data', 'bill-manager')}
                                                </span>
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                onClick={handleRemoveFile}
                                                disabled={processingImport}
                                            >
                                                <FaTrash /> 
                                                <span className='ms-2'>{__('Remove File', 'bill-manager')}</span>
                                            </Button>

                                        </div>
                                    )
                                    : (
                                        <Button 
                                            variant="outline-secondary"
                                            onClick={handleButtonClick}
                                        >                                     
                                            {processingImport
                                                ? <FaSync className='fa-spin' /> 
                                                : <FaDownload />     
                                            }
                                            <span className='ms-2'>{__( "Select JSON File", "bill-manager" )}</span>
                                        </Button>
                                    )
                                } 
                            </Form.Group>


                            
                            {/* Conditionally rendered elements after upload */}
                            {fileInfo && (
                                <>
                                    <div className="mb-3 text-muted small">
                                        <strong>File Name:</strong> {fileInfo.name} <br />
                                        <strong>File Size:</strong> {fileInfo.size}
                                    </div>
                                    {showContent && 
                                        <Form.Group className="mb-3">
                                            <Form.Label><strong>File Content Preview</strong></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={10}
                                                value={fileContent}
                                                onChange={(e) => setFileContent(e.target.value)}
                                                style={{ fontFamily: 'monospace', fontSize: '14px' }}
                                                readOnly
                                            />
                                        </Form.Group>
                                    }
                                </>
                            )}
                        </Col>
                    }
                </Row>
            </div>
            <ToastControl
                show={showToast}
                onClose={toggleShowToast}
                data={dataToast}
            />
        </>
    );
};

export default ImportExport;