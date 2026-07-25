import { useState, useEffect } from '@wordpress/element';
import { GRADIENTS, COLORS } from '../../lib/Constants'
import { ColorIndicator, ColorPalette, GradientPicker, Popover, TabPanel, } from '@wordpress/components';

import { FaCheckCircle, FaRegCopy } from "react-icons/fa";

import './ColorPickerControl.css';

const DEFAULT_COLOR = '#ffffff';
const DEFAULT_GRADIENT =
    'linear-gradient(135deg, #ffffff 0%, #eaeaea 100%)';

const isGradient = (val) =>
    typeof val === 'string' && val.includes('gradient');

export default function ColorPickerControl({
    name='',
    defaultValue,
    onChange = () => {},
    mode = 'both',
    label = '',
    className = '',
}) {
    // Generate a random fallback name if none is provided
    const [colorPickerName] = useState(() => name || `color-selector-${Math.random().toString(36).substr(2, 9)}`);
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(DEFAULT_COLOR);
    const [activeTab, setActiveTab] = useState('color');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (!defaultValue) {
            const initial =
                mode === 'gradient' ? DEFAULT_GRADIENT : DEFAULT_COLOR;
            setValue(initial);
            setActiveTab(mode === 'gradient' ? 'gradient' : 'color');
            return;
        }

        setValue(defaultValue);
        setActiveTab(isGradient(defaultValue) ? 'gradient' : 'color');
    }, [defaultValue, mode]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);

        if (tabName === 'color' && isGradient(value)) {
            setValue(DEFAULT_COLOR);
            onChange(DEFAULT_COLOR);
        }

        if (tabName === 'gradient' && !isGradient(value)) {
            setValue(DEFAULT_GRADIENT);
            onChange(DEFAULT_GRADIENT);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy color code: ', err);
        }
    };

    const availableTabs = [];
    if (mode === 'color' || mode === 'both') {
        availableTabs.push({ name: 'color', title: 'Color' });
    }
    if (mode === 'gradient' || mode === 'both') {
        availableTabs.push({ name: 'gradient', title: 'Gradient' });
    }

    return (
        <div className={`color-picker-control ${className}`}>
            {label && (
                <label className="font-semibold block mb-1">
                    <span>{label}</span>
                </label>
            )}

            <div className='d-inline-flex align-items-center gap-2 text-bg-light p-2'>
                <ColorIndicator role="button" colorValue={value}  onClick={() => setIsOpen(!isOpen)}/>
                <span>
                    {value}
                </span>
                
                {isCopied ? (
                    <FaCheckCircle className="text-success" />
                ) : (
                    <FaRegCopy role="button" onClick={handleCopy} style={{ cursor: 'pointer' }} />
                )}
                
                <input type="hidden" name={colorPickerName} value={value} />
            </div>

            {isOpen && (
                <Popover
                    className="color-picker-popover"
                    onClose={() => setIsOpen(false)}
                >
                    <TabPanel
                        className="color-gradient-tabs"
                        tabs={availableTabs}
                        activeClass="active-tab"
                        initialTabName={activeTab}
                        onSelect={handleTabChange}
                    >
                        {(tab) => (
                            <>
                                {tab.name === 'color' && (
                                    <ColorPalette
                                        colors={COLORS}
                                        value={value}
                                        onChange={(color) => {
                                            setValue(color);
                                            onChange(color);
                                        }}
                                        enableAlpha
                                        asButtons
                                    />
                                )}

                                {tab.name === 'gradient' && (
                                    <GradientPicker
                                        value={value}
                                        gradients={GRADIENTS}
                                        onChange={(gradient) => {
                                            setValue(gradient);
                                            onChange(gradient);
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </TabPanel>
                </Popover>
            )}
        </div>
    );
}
