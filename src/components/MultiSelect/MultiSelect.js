import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from '@wordpress/element';
import './MultiSelect.css';
const MultiSelect = ({
    options = [],
    defaultValues = [],
    name = "",
    placeholder = "Select options...",
    onChange = () => {},
    onSearch = () => {},
    max = 0,
}) => {

    // Generate a random fallback name if none is provided
    const [MultiSelectName] = useState(() => name || `multi-selector-${Math.random().toString(36).substr(2, 9)}`);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState(defaultValues);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Sync selectedValues when defaultValues prop changes
    useEffect(() => {
        setSelectedValues(defaultValues);
    }, [defaultValues]);

    // Get selected option objects for display
    const selectedOptions = options.filter(option =>
        selectedValues.includes(option.value)
    );

    // Filter options based on search term
    // const filteredOptions = options.filter(option =>
    //     option.label.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    const filteredOptions = options.filter(option =>
        option?.label?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
    );
    
    // Handle selecting/deselecting an option
    const handleOptionClick = (optionValue) => {
        let newSelectedValues;

        if (selectedValues.includes(optionValue)) {
            // Remove the value if already selected
            newSelectedValues = selectedValues.filter(value => value !== optionValue);
        } else {
            // Add the value if not already selected
            if (max > 0 && selectedValues.length >= max) {
                // If max limit is reached, do not add more values
                return;
            }
            newSelectedValues = [...selectedValues, optionValue];
        }

        setSelectedValues(newSelectedValues);
        onChange(newSelectedValues);
    };

    // Handle removing a selected option
    const handleRemoveOption = (optionValue, e) => {
        e.stopPropagation();
        const newSelectedValues = selectedValues.filter(value => value !== optionValue);
        setSelectedValues(newSelectedValues);
        onChange(newSelectedValues);
    };

    const onSearchHandle = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div className="multi-select-container" ref={dropdownRef}>

            {/* {console.log('MultiSelect options:', options)} */}
            {/* {console.log('MultiSelect defaultValues:', defaultValues)} */}
            {/* {console.log('MultiSelect selectedOptions:', selectedOptions)} */}
            <div
                className={`multi-select-input ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOptions.length > 0 ? (
                    <div className="selected-options">
                        {selectedOptions.map(option => (
                            <span className="selected-option-badge" key={option.value}>
                                {option.label}
                                <button
                                    className="remove-option"
                                    onClick={(e) => handleRemoveOption(option.value, e)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="placeholder bg-transparent">{placeholder}</div>
                )}
                <div className="dropdown-arrow">▼</div>
            </div>

            {isOpen && (
                <div className="options-dropdown">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder={__("Search...", 'bill-manager')}
                            value={searchTerm}
                            onChange={onSearchHandle}
                            onClick={(e) => e.stopPropagation()}
                            className="search-input"
                        />
                    </div>
                    <div className="options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option.value}
                                    className={`option ${defaultValues.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleOptionClick(option.value)}
                                >
                                    <div className="option-content">
                                        <input
                                            name={MultiSelectName}
                                            type="checkbox"
                                            id={`${MultiSelectName}-${option.value}`}
                                            checked={defaultValues.includes(option.value)}
                                            onChange={() => handleOptionClick(option.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <label
                                            htmlFor={`${MultiSelectName}-${option.value}`}
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent default label behavior
                                                handleOptionClick(option.value);
                                            }}
                                        >
                                            {option.label}
                                        </label>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-options">{__('No options found', 'bill-manager')}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
/*
uses
<MultiSelect
    name="checkout_product_placement_enable_for_products"
    options={products.map(product => ({ value: product.id, label: product.name }))}
    defaultValues={settings?.checkout?.product_placement?.enable_for_products?.map(p => p.value || p.id) || []}
    onSearch={(term) => {
        setSearchTerm(term);
        fetchProducts();
    }}
    onChange={(selected) => {
        const selectedProducts = products.filter(product => selected.includes(product.id)).map(p => ({ value: p.id, label: p.name }));
        handleChange('checkout.product_placement.enable_for_products', selectedProducts);
    }}
    placeholder="Select products"
/>
*/