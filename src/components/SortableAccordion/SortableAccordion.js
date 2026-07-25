import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from '@wordpress/element';
import {Form, Button} from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { FaArrowsAlt, FaTimesCircle } from "react-icons/fa";
import {convertToSlug} from '../../lib/Helpers';
// import "./SortableAccordion.scss";
const ITEM_TYPE = "ACCORDION_ITEM";

const SortableAccordion = ({ 
    name, 
    options, 
    fields, 
    defaultValues = [], 
    onChange = () => {}, 
}) => {
    const sectionsFirstRender = useRef(true);

    const [sections, setSections] = useState(
        defaultValues.length > 0
            ? defaultValues.map((data, index) => ({ id: index + 1, values: data }))
            : [{ id: 1, values: initializeFields(fields) }]
    );


    function initializeFields(fields) {
        return fields.reduce((acc, field) => {
            acc[field.name] = field.type === "checkbox" ? false : "";
            return acc;
        }, {});
    }

    const moveSection = (dragIndex, hoverIndex) => {
        const updatedSections = [...sections];
        const [movedItem] = updatedSections.splice(dragIndex, 1);
        updatedSections.splice(hoverIndex, 0, movedItem);
        setSections(updatedSections);
    };

    const updateField = (sectionId, fieldName, value) => {
        console.log(sectionId, fieldName, value)
        setSections((prevSections) =>
            prevSections.map((section) =>
                section.id === sectionId
                    ? { ...section, values: { ...section.values, [fieldName]: value } }
                    : section
            )
        );
    };

    const addSection = () => {
        setSections([...sections, { id: Date.now(), values: initializeFields(fields) }]);
    };

    const removeSection = (id) => {
        setSections(sections.filter((section) => section.id !== id));
    };

    useEffect(() => {
        if (sectionsFirstRender.current) {
            sectionsFirstRender.current = false;
            return;
        }
        // Extract the `values` objects from the data
        const valuesArray = sections.map((item) => item.values);

        // console.log('sections', sections)
        // console.log('valuesArray', valuesArray)
        onChange(valuesArray)
    }, [sections])

    return (
        <DndProvider backend={HTML5Backend} context={window}>
            {/* {console.log('component-load:','SortableAccordion is rendered')} */}
            <div className="accordion-container">
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
                        index={index}
                        section={section}
                        fields={fields}
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

const DraggableAccordionItem = ({ index, section, fields, moveSection, updateField, removeSection, options }) => {
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

    return (
        <div ref={drop} className="accordion-item border rounded-2 mb-1" style={{ opacity: isDragging ? 0.5 : 1 }}>
            <div 
                ref={drag} 
                className="accordion-header p-2 d-flex align-items-center justify-content-between" 
                role="button"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="left-part fst-italic fw-semibold">
                    <span>{section.values['title'] || (options?.titlePrefix || __("Section", "bill-manager")) + ' ' + (index + 1)} </span>
                </div>
                <div className="right-part">
                    <span onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="remove-btn">
                        <FaTimesCircle />
                    </span>
                    <span className="drag-handle">
                        <FaArrowsAlt />
                    </span>
                </div>
            </div>
            {expanded && (
                <div className="accordion-content border-top p-2">
                    {
                        options?.enabler &&
                        <div className="d-none">
                            <DynamicField
                                field={{ type: "checkbox", name: "enabler", placeholder: "Enable", className: "checkbox-field", label: "Enable" }}
                                value={section.values['enabler'] || ""}
                                onChange={(value) => updateField(section.id, 'enabler', value)}
                            />
                        </div>
                    }
                    {fields.map((field, index) => (
                        <Form.Group className="unit-accordion mb-2" key={field.name} controlId={field.name}>
                            {
                                field.label && <Form.Label className="fw-semibold">{field.label}</Form.Label>
                            }
                            <DynamicField
                                field={field}
                                value={section.values[field.name] || ""}
                                onChange={(value) => updateField(section.id, field.name, value)}
                            />
                        </Form.Group>
                    ))}
                </div>
            )}
        </div>
    );
};

// DynamicField Component (Supports Select, Multi-Select, Checkbox Groups)
const DynamicField = ({ field, value, onChange }) => {
    switch (field.type) {
        case "input":
            return (
                <Form.Control 
                    type="text"
                    name={field.name}
                    placeholder={field.placeholder}
                    className={field.className}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "textarea":
            return (
                <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name={field.name}
                    placeholder={field.placeholder}
                    className={field.className}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "checkbox":
            return (
                <div>
                    <Form.Check
                        inline
                        label={field.placeholder}
                        type="checkbox"
                        name={field.name}
                        className={field.className}
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        id={convertToSlug(`${field.name}`)}
                    />
                </div>
            );
        case "radio":
            return (
                <div className={`checkbox-group-field ${field.className}`}>
                    {field.options.map((option, index) => (
                        <Form.Check
                            inline
                            label={option.value}
                            type="radio"
                            name={field.name}
                            value={option.key}
                            checked={value === option.key}
                            onChange={() => onChange(option.key)}
                            id={convertToSlug(`${field.name}-${option.key}`)}
                        />
                    ))}
                </div>
            );
        case "select":
            return (
                <Form.Select 
                    aria-label={field.label}
                    name={field.name}
                    className={field.className}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">{__('Select', 'bill-manager')}</option>
                    {field.options.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.value}
                        </option>
                    ))}
                </Form.Select>
            );
        case "multi-select":
            return (
                <Form.Select 
                    aria-label={field.label}
                    name={field.name}
                    className={field.className}
                    multiple
                    value={value || []}
                    onChange={(e) => onChange([...e.target.selectedOptions].map((o) => o.value))}
                >
                    {field.options.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.value}
                        </option>
                    ))}
                </Form.Select>
            );
        case "checkbox-group":
            return (
                <div className={`checkbox-group-field ${field.className}`}>
                    {field.options.map((option, index) => (
                        <Form.Check
                            inline
                            label={option.value}

                            type="checkbox"
                            name={field.name}
                            value={option.key}
                            checked={value.includes(option.key)}
                            onChange={(e) =>
                                onChange(
                                    e.target.checked
                                        ? [...value, option.key]
                                        : value.filter((v) => v !== option.key)
                                )
                            }

                            id={convertToSlug(`${field.name}-${option.key}-${index}`)}
                        />
                    ))}
                </div>
            );
        default:
            return null;
    }
};

export default SortableAccordion;

/*
// Uses
const defaultValues = [
    {
      "address-1": "123 Main St",
      note: "Leave at door",
      enable: true,
      gender: "male",
      country: "us",
      languages: ["en", "fr"],
      hobbies: ["reading", "sports"],
    },
];
  
const fields = [
    { type: "input", name: "address-1", placeholder: "Address 1", className: "input-field", label: "Address 1" },
    { type: "textarea", name: "note", placeholder: "Note", className: "textarea-field", label: "Note" },
    { type: "checkbox", name: "enable", placeholder: "Enable", className: "checkbox-field", label: "Enable" },
    { type: "radio", name: "gender", className: "radio-field", options: [{ key: "male", value: "Male" }, { key: "female", value: "Female" }] },
    { type: "select", name: "country", className: "select-field", options: [{ key: "us", value: "United States" }, { key: "ca", value: "Canada" }] },
    { type: "multi-select", name: "languages", className: "multi-select-field", options: [{ key: "en", value: "English" }, { key: "fr", value: "French" }] },
    { type: "checkbox-group", name: "hobbies", className: "checkbox-group-field", options: [{ key: "reading", value: "Reading" }, { key: "sports", value: "Sports" }] }
];
<SortableAccordion 
    name='elements.advanced.addresses'
    options={{
        addButton: 'Add New Field',
        titlePrefix: 'Address',
        enabler: true,
    }}
    fields={fields} 
    defaultValues={defaultValues} 
    onChange={onChange}
/>
*/