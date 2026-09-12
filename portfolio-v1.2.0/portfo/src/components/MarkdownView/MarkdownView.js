import React from 'react';
import { parseMarkdown } from '../../utils/markdownParser';

export default function MarkdownView({ text, as: Component = 'span', className = '', ...props }) {
    if (!text) return null;
    return (
        <Component className={`md-content ${className}`.trim()} {...props}>
            {parseMarkdown(text)}
        </Component>
    );
}
