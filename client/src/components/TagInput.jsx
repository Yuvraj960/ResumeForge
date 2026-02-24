import React, { useState, useRef } from 'react';

/**
 * TagInput component — type and press Enter or comma to add a tag.
 */
export default function TagInput({ tags = [], onChange, placeholder }) {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const addTag = (value) => {
        const trimmed = value.trim().replace(/,$/, '');
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (idx) => {
        onChange(tags.filter((_, i) => i !== idx));
    };

    return (
        <div className="tag-input-wrapper" onClick={() => inputRef.current?.focus()}>
            {tags.map((tag, i) => (
                <span className="tag" key={i}>
                    {tag}
                    <button type="button" className="tag-remove" onClick={(e) => { e.stopPropagation(); removeTag(i); }}>
                        ×
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                className="tag-inner-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => input && addTag(input)}
                placeholder={tags.length === 0 ? placeholder : ''}
            />
        </div>
    );
}
