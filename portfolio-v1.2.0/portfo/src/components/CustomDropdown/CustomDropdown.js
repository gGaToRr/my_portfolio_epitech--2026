import React, { useState, useEffect, useRef } from 'react';
import './CustomDropdown.css';

export default function CustomDropdown({
    value,
    options = [],
    onChange,
    prefix = '',
    placeholder = 'Sélectionner…',
    align = 'right',
    className = '',
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const selectedOption = options.find((opt) => 
        (typeof opt === 'object' ? opt.value : opt) === value
    );

    const displayLabel = selectedOption
        ? (typeof selectedOption === 'object' ? (selectedOption.shortLabel || selectedOption.label) : selectedOption)
        : placeholder;

    return (
        <div 
            className={`custom-dropdown-container ${className} ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`} 
            ref={dropdownRef}
        >
            <button
                type="button"
                className={`custom-dropdown-trigger ${value && value !== 'ALL' ? 'is-active' : ''}`}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="custom-dropdown-label">
                    {prefix && <span className="custom-dropdown-prefix">{prefix}</span>}
                    {displayLabel}
                </span>
                <span className={`custom-dropdown-caret ${isOpen ? 'is-open' : ''}`}>▾</span>
            </button>

            {isOpen && (
                <div className={`custom-dropdown-menu align-${align}`} role="listbox">
                    {options.map((opt) => {
                        const optValue = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        const optTag = typeof opt === 'object' ? opt.tag : null;
                        const optTagClass = typeof opt === 'object' ? opt.tagClass : '';
                        const optDesc = typeof opt === 'object' ? opt.description : null;
                        const isSelected = optValue === value;

                        return (
                            <button
                                key={String(optValue)}
                                type="button"
                                className={`custom-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => {
                                    if (onChange) onChange(optValue);
                                    setIsOpen(false);
                                }}
                                role="option"
                                aria-selected={isSelected}
                            >
                                {optTag && (
                                    <span className={`custom-dropdown-tag ${optTagClass}`}>
                                        {optTag}
                                    </span>
                                )}
                                <div className="custom-dropdown-item-text">
                                    <span className="custom-dropdown-item-label">{optLabel}</span>
                                    {optDesc && <span className="custom-dropdown-item-desc">{optDesc}</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
