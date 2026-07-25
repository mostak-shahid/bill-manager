import { useState, useEffect } from '@wordpress/element';
import { __ } from "@wordpress/i18n";
import { ToggleButton, Row, Col, Image, Alert } from 'react-bootstrap';

export default function ImageSelector({
    name = '',    
    defaultImages = [], 
    selectedValue = '',
    onChange = () => {}, 
    grid = '4',
    ratio = '4x3',
}) {
    // Generate a random fallback name if none is provided
    const [imageSelectorName] = useState(() => name || `img-selector-${Math.random().toString(36).substr(2, 9)}`);

    // Handle empty selectedValue by picking the first image ID
    useEffect(() => {
        if (!selectedValue && defaultImages && defaultImages.length > 0) {
            onChange(defaultImages[0].id);
        }
    }, [selectedValue, defaultImages, onChange]);

    // 1. Show error message if defaultImages is empty or invalid
    if (!defaultImages || defaultImages.length === 0) {
        return (
            <Alert variant="danger" className="my-3">
                {__('Error: No images provided for selection.', 'bill-manager')}
            </Alert>
        );
    }

    // 2. Prevent rendering until a valid selectedValue is set
    if (!selectedValue) {
        return null;
    }

    return (
        <div className='image-selector'>
            <Row>
                {defaultImages.map((image, idx) => (
                    <Col lg={grid} key={image.id || idx}>   
                        <div className="image-unit mb-4">
                            <ToggleButton
                                id={`image-${imageSelectorName}-${idx}`}
                                type="radio"
                                variant={selectedValue == image.id ? 'outline-success' : 'outline-secondary'}
                                name={imageSelectorName}
                                value={image.id}
                                checked={selectedValue == image.id}
                                onChange={(e) => onChange(e.currentTarget.value)}
                                className={`rounded-0 p-0 border-3 w-100 ${selectedValue == image.id ? 'active-image' : ''}`}
                            >
                                <div className={`image-preview ratio ratio-${ratio}`}>
                                    <Image className='object-fit-cover' src={image.src} fluid />
                                </div>                                
                                {
                                    image?.title && (
                                        <div className="image-title p-2">{image.title}</div>
                                    )
                                }                   
                            </ToggleButton>
                        </div>    
                    </Col>
                ))}
            </Row>
        </div>
    );
}

/*
Uses
const defaultImages = [
    { id: 1,  title: "Alpine Meadow",   src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
    { id: 2,  title: "Forest Path",     src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
    { id: 3,  title: "Ocean Waves",     src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80" },
    { id: 4,  title: "Desert Dunes",    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80" },
    { id: 5,  title: "Glass Tower",     src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
    { id: 6,  title: "Urban Bridge",    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80" },
    { id: 7,  title: "Old Cathedral",   src: "https://images.unsplash.com/photo-1543459176-4426b37223ba?w=400&q=80" },
    { id: 8,  title: "Neon Grid",       src: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80" },
    { id: 9,  title: "Color Burst",     src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80" },
    { id: 10, title: "Geometric Flow",  src: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&q=80" },
    { id: 11, title: "Silhouette",      src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
    { id: 12, title: "Candid Moment",   src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&q=80" },
];
<ImageSelector
    name='inputs.complex_inputs.imageselector'
    defaultImages={defaultImages}
    selectedValue={settings?.inputs?.complex_inputs?.imageselector}
    onChange={(value) => {
        // console.log(value);
        handleChange('inputs.complex_inputs.imageselector', value);
    }}
/>
*/