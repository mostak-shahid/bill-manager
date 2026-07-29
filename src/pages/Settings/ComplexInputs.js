import { useState, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

import { useOutletContext } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import MultiSelect from "../../components/MultiSelect/MultiSelect";
import MediaUploader from "../../components/MediaUploader/MediaUploader";
import RepeatableField from "../../components/RepeatableField/RepeatableField";
import SortableAccordion from "../../components/SortableAccordion/SortableAccordion";
import ImageSelector from "../../components/ImageSelector/ImageSelector";
import ColorPickerControl from "../../components/ColorPickerControl/ColorPickerControl";
import BackgroundControl from "../../components/BackgroundControl/BackgroundControl";

const OPTIONS = [
    { 'value': 'option-1', 'label': 'Option 1' },
    { 'value': 'option-2', 'label': 'Option 2' },
    { 'value': 'option-3', 'label': 'Option 3' },
    { 'value': 'option-4', 'label': 'Option 4' },
    { 'value': 'option-5', 'label': 'Option 5' },
    { 'value': 'option-6', 'label': 'Option 6' },
    { 'value': 'option-7', 'label': 'Option 7' },
    { 'value': 'option-8', 'label': 'Option 8' },
];

const defaultImages = [
    { id: 1, title: "Alpine Meadow", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
    { id: 2, title: "Forest Path", src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
    { id: 3, title: "Ocean Waves", src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80" },
    { id: 4, title: "Desert Dunes", src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80" },
    { id: 5, title: "Glass Tower", src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
    { id: 6, title: "Urban Bridge", src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80" },
    { id: 7, title: "Old Cathedral", src: "https://images.unsplash.com/photo-1543459176-4426b37223ba?w=400&q=80" },
    { id: 8, title: "Neon Grid", src: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80" },
    { id: 9, title: "Color Burst", src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80" },
    { id: 10, title: "Geometric Flow", src: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&q=80" },
    { id: 11, title: "Silhouette", src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
    { id: 12, title: "Candid Moment", src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&q=80" },
];
const ComplexInputs = () => {
    const { settings, settingsLoading, handleChange } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    const fetchProducts = async () => {
        setPosts([]);
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                limit: 10
            });
            const result = await apiFetch({
                path: `/wp/v2/posts?${params.toString()}`,
                method: 'GET'
            });
            setPosts(result);
            // // Merge with existing posts to keep selected ones
            // setProducts(prevProducts => {
            //     const newProducts = [...prevProducts];
            //     result.forEach(newProduct => {
            //         if (!newProducts.find(p => p.id === newProduct.id)) {
            //             newProducts.push(newProduct);
            //         }
            //     });
            //     return newProducts;
            // });

        } catch (err) {
            console.error('API error:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchTerm]);

    return (
        <>
            {/* {console.log('settings', settings)} */}
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("Multi Select", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <MultiSelect
                                name="inputs.complex_inputs.multiselect"
                                options={OPTIONS}
                                defaultValues={settings?.inputs?.complex_inputs?.multiselect?.map(p => p.value) || []}
                                onChange={(optioned) => {
                                    // Filter the local OPTIONS array based on selected values
                                    const optionedItems = OPTIONS.filter(opt => optioned.includes(opt.value));
                                    handleChange('inputs.complex_inputs.multiselect', optionedItems);
                                }}
                                placeholder="Select multiselect"
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("Posts", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <MultiSelect
                                name="inputs.complex_inputs.multiselectposts"
                                options={posts.map(post => ({ value: post.id, label: post.title.rendered }))}
                                defaultValues={settings?.inputs?.complex_inputs?.multiselectposts?.map(p => p.value || p.id) || []}
                                onSearch={(term) => {
                                    setSearchTerm(term);
                                }}
                                onChange={(selected) => {
                                    const selectedPosts = posts.filter(post => selected.includes(post.id)).map(p => ({ value: p.id, label: p.name }));
                                    handleChange('inputs.complex_inputs.multiselectposts', selectedPosts);
                                }}
                                placeholder="Select post"
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("Post", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <MultiSelect
                                name="inputs.complex_inputs.multiselectpost"
                                options={posts.map(post => ({ value: post.id, label: post.title.rendered }))}
                                defaultValues={settings?.inputs?.complex_inputs?.multiselectpost?.map(p => p.value || p.id) || []}
                                onSearch={(term) => {
                                    setSearchTerm(term);
                                }}
                                onChange={(selected) => {
                                    const selectedPosts = posts.filter(post => selected.includes(post.id)).map(p => ({ value: p.id, label: p.name }));
                                    handleChange('inputs.complex_inputs.multiselectpost', selectedPosts);
                                }}
                                placeholder="Select post"
                                max={1}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("MediaUploader", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <MediaUploader
                                name="inputs.complex_inputs.media"
                                defaultValues={settings?.inputs?.complex_inputs?.media}
                                onChange={(value) => {
                                    // console.log(value);
                                    handleChange('inputs.complex_inputs.media', value);
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("RepeatableField", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <RepeatableField
                                name="inputs.complex_inputs.repeater"
                                defaultValues={settings?.inputs?.complex_inputs?.repeater}
                                onChange={(value) => {
                                    // console.log(value);
                                    handleChange('inputs.complex_inputs.repeater', value);
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("SortableAccordion", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <SortableAccordion
                                name='elements.advanced.addresses'
                                options={{
                                    addButton: 'Add New Field',
                                    titlePrefix: 'Address',
                                    enabler: true,
                                }}
                                fields={[
                                    { type: "input", name: "title", placeholder: "Address 1", className: "input-field", label: "Address 1", attributes:{'data-url': 'someurl', 'list': "browsers"} },
                                    { type: "textarea", name: "note", placeholder: "Note", className: "textarea-field", label: "Note" },
                                    { type: "checkbox", name: "enable", placeholder: "Enable", className: "checkbox-field", label: "Enable" },
                                    { type: "radio", name: "gender", className: "radio-field", label: "Gender", options: [{ key: "male", value: "Male" }, { key: "female", value: "Female" }] },
                                    { type: "select", name: "country", className: "select-field", options: [{ key: "us", value: "United States" }, { key: "ca", value: "Canada" }] },
                                    { type: "multi-select", name: "languages", className: "multi-select-field", options: [{ key: "en", value: "English" }, { key: "fr", value: "French" }] },
                                    { type: "checkbox-group", name: "hobbies", className: "checkbox-group-field", options: [{ key: "reading", value: "Reading" }, { key: "sports", value: "Sports" }] }
                                ]}
                                defaultValues={settings?.inputs?.complex_inputs?.sortableaccordion}
                                onChange={(value) => {
                                    // console.log(value);
                                    handleChange('inputs.complex_inputs.sortableaccordion', value);
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={12}>
                        <h6 className="h6">{__("ImageSelector", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={12}>
                            <ImageSelector
                                name='inputs.complex_inputs.imageselector'
                                defaultImages={defaultImages}
                                selectedValue={settings?.inputs?.complex_inputs?.imageselector}
                                onChange={(value) => {
                                    // console.log(value);
                                    handleChange('inputs.complex_inputs.imageselector', value);
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("ColorPickerControl", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <ColorPickerControl
                                name='inputs.complex_inputs.colorpicker'
                                defaultValue={settings?.inputs?.complex_inputs?.colorpicker}
                                onChange={(value) => {
                                    // console.log(value);
                                    handleChange('inputs.complex_inputs.colorpicker', value);
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        <h6 className="h6">{__("BackgroundControl", "bill-manager")}</h6>
                        <p>{__("Lorem", "bill-manager")}</p>
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>
                            <BackgroundControl
                                name='inputs.complex_inputs.background'
                                defaultValues={settings?.inputs?.complex_inputs?.background}
                                onChange={(value) => {
                                    // console.log(value);
                                    handleChange('inputs.complex_inputs.background', value);
                                }}
                            />
                        </Col>
                    }
                </Row>
            </div>
        </>
    );
};

export default ComplexInputs;