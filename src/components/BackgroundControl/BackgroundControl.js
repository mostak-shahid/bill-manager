import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ColorPickerControl, MediaUploader } from '../../components';
import { Form, Row, Col, Button } from 'react-bootstrap';

import { capitalizeWords } from '../../lib/Helpers';
const SELECT_OPTIONS = {
    position: ["left top", "left center", "left bottom", "center top", "center", "center bottom", "right top", "right center", "right bottom"],
    size: ["auto", "cover", "contain"],
    repeat: ["repeat", "repeat-x", "repeat-y", "no-repeat"],
    origin: ["padding-box", "border-box", "content-box"],
    clip: ["border-box", "padding-box", "content-box", "text"],
    attachment: ["scroll", "fixed", "local"],
};

const BackgroundControl = ({
    name = '',
    defaultValues = {},
    onChange = () => { },
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleUpdate = (option, newValue) => {
        // Create a copy of the current values to avoid mutating props
        const updatedValues = { ...(defaultValues || {}) };

        // Update the specific option with the new value
        updatedValues[option] = newValue;

        // Propagate the updated object to the parent
        onChange(updatedValues);
    };

    const options = Array.isArray(defaultValues?.options) && defaultValues.options.length > 0
        ? defaultValues.options
        : ["color", "image", "position", "size", "repeat", "origin", "clip", "attachment"];
    return (
        <>
            {/* {console.log('defaultValues: ', defaultValues)} */}
            <div className={`background-wrapper ${className}`}>
                <Row>
                    {options.map((option) => (
                        <Col lg={option === "color" || option === "image" ? 12 : 6} key={option}>
                            {/* color → color picker */}
                            {option === "color" && (
                                <div className='d-flex justify-content-between align-items-center'>
                                    {/* {console.log('option: ', defaultValues[option])} */}
                                    <ColorPickerControl
                                        defaultValue={defaultValues[option]}
                                        onChange={(value) => handleUpdate(option, value)} // <-- Updated
                                        mode='both'
                                        // label={__("Background Color", "authguard")}
                                        label=''
                                    />
                                    <Button
                                        theme='outline'
                                        type='primary'
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        {__("More +", "authguard")}
                                    </Button>
                                </div>

                            )}
                            {isOpen && (
                                <>
                                    {/* image → external component */}
                                    {option === "image" && (
                                        <MediaUploader
                                            name={`${name}.image`}
                                            defaultValues={defaultValues[option]}
                                            onChange={(value) => handleUpdate(option, value)} // <-- Updated
                                            options={{
                                                frame: {
                                                    title: __("Select or Upload Image", "authguard"),
                                                },
                                                library: { type: 'image' },
                                                buttons: {
                                                    upload: __("Upload Image", "authguard"),
                                                    remove: __("Remove", "authguard"),
                                                    select: __("Use this image", "authguard")
                                                }
                                            }}
                                        />
                                    )}
                                    {/* rest → select dropdown */}
                                    {option !== "color" && option !== "image" && (
                                        <>
                                            <label className='font-semibold block mb-1'><span>{capitalizeWords(option)}</span></label>
                                            <Form.Select
                                                placeholder={option.toUpperCase()}
                                                value={defaultValues[option] || ""}
                                                onChange={(e) => handleUpdate(option, e.target.value)} // <-- Updated

                                            >
                                                {SELECT_OPTIONS[option]?.map((val) => (
                                                    <option value={val} key={val}>{val}</option>
                                                ))}
                                            </Form.Select>
                                        </>
                                    )}
                                </>
                            )}
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}
export default BackgroundControl;