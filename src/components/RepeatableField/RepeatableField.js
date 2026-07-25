import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from '@wordpress/element';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {Form, Button} from 'react-bootstrap';

import { FaArrowsAlt, FaTimesCircle } from "react-icons/fa";
// import "./RepeatableField.css";
const ITEM_TYPE = "REPEATABLE_ITEM";

const RepeatableField = ({ 
    name, 
    options, 
    defaultValues = [], 
    onChange = () => {}, 
}) => {
    const sectionsFirstRender = useRef(true);
    // Generate a random fallback name if none is provided
    const [RepeatableFieldName] = useState(() => name || `rf-${Math.random().toString(36).substr(2, 9)}`);

    const [sections, setSections] = useState(
        defaultValues.length > 0
            ? defaultValues.map((data, index) => ({ id: index + 1, values: data }))
            : [{ id: 1, values: {} }] // Initialize with empty object instead of empty string
    );

    const moveSection = (dragIndex, hoverIndex) => {
        const updatedSections = [...sections];
        const [movedItem] = updatedSections.splice(dragIndex, 1);
        updatedSections.splice(hoverIndex, 0, movedItem);
        setSections(updatedSections);
    };

    const updateField = (sectionId, fieldName, value) => {
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        values: fieldName
                            ? { ...section.values, [fieldName]: value }
                            : value // Handle both object values and direct string values
                    }
                    : section
            )
        );
    };

    const addSection = () => {
        setSections([...sections, { id: Date.now(), values: {} }]); // Initialize with empty object
    };

    const removeSection = (id) => {
        // Update sections and trigger the change handler
        const updatedSections = sections.filter((section) => section.id !== id);
        setSections(updatedSections);
    };

    useEffect(() => {
        if (sectionsFirstRender.current) {
            sectionsFirstRender.current = false;
            return;
        }

        // Extract the `values` objects from the data
        const valuesArray = sections.map((item) => item.values);

        // Call onChange with updated values
        onChange( valuesArray || []);
    }, [sections]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="repeatable-field-container">
                <span 
                    onClick={addSection} 
                    className="d-inline-block text-decoration-underline mb-3"
                    role="button"
                >
                    {options?.addButton || __("Add New Field", "bill-manager")}
                </span>
                {sections.map((section, index) => (
                    <DraggableAccordionItem
                        key={section.id}
                        name={RepeatableFieldName}
                        index={index}
                        section={section}
                        moveSection={moveSection}
                        updateField={updateField}
                        removeSection={removeSection}
                        options={options}
                    />
                ))}
            </div>
        </DndProvider>
    );
};

const DraggableAccordionItem = ({ name, index, section, moveSection, updateField, removeSection, options }) => {
    const [expanded, setExpanded] = useState(false);

    const [{ isDragging }, drag] = useDrag({
        type: ITEM_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const [, drop] = useDrop({
        accept: ITEM_TYPE,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveSection(draggedItem.index, index);
                draggedItem.index = index;
            }
        }
    });

    // Helper function to get display value
    const getDisplayValue = () => {
        if (typeof section.values === 'string') {
            return section.values;
        } else if (typeof section.values === 'object' && section.values !== null) {
            // If it's an empty object, return blank
            if (Object.keys(section.values).length === 0) {
                return '';
            }
            // Avoid returning '[object Object]' for plain objects with default toString
            if (section.values.toString && section.values.toString !== Object.prototype.toString) {
                return section.values.toString();
            }
            return '';
        }
        return '';
    };

    // Stop event propagation for delete button to prevent accordion toggle
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        removeSection(section.id);
    };

    return (
        <div ref={drop} className="accordion-item mb-1" style={{ opacity: isDragging ? 0.5 : 1 }}>
            <div ref={drag} className="accordion-header d-flex align-items-center gap-2" onClick={() => setExpanded(!expanded)}>
                <div className="left-part" style={{flex: 1}}>
                    <Form.Control 
                        name={name + '[]'}
                        placeholder={options?.placeholder}
                        type="text"
                        value={getDisplayValue()}
                        onChange={(e) => updateField(section.id, '', e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking input
                    />
                </div>
                <div className="right-part">
                    <span
                        onClick={handleDeleteClick}
                        className="remove-btn"
                    >
                        <FaTimesCircle />
                    </span>
                    <span className="drag-handle">
                        <FaArrowsAlt />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RepeatableField;
/*
Uses
<RepeatableField
    name="inputs.complex_inputs.repeater"
    defaultValues={settings?.inputs?.complex_inputs?.repeater}
    onChange={(value) => {
        console.log(value);
        handleChange('inputs.complex_inputs.repeater', value);
    }}
/>
*/