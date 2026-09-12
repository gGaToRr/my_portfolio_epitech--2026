import React from 'react';

/**
 * Parse un texte simple contenant du Markdown de base :
 * - **gras** -> <strong>gras</strong>
 * - *italique* -> <em>italique</em>
 * - [texte](url) -> <a href="url" target="_blank" rel="noopener noreferrer">texte</a>
 * - `code` -> <code>code</code>
 * - \n -> <br />
 */
export function parseMarkdown(text) {
    if (!text || typeof text !== 'string') return text;

    // Découpage par sauts de ligne
    const lines = text.split('\n');

    const renderLine = (line, lineIdx) => {
        // Regex pour capturer les éléments markdown
        // 1. Liens: [texte](url)
        // 2. Gras: **texte**
        // 3. Italique: *texte*
        // 4. Code: `code`
        const regex = /(\[(.*?)\]\((https?:\/\/[^\s)]+|\/[^\s)]+|mailto:[^\s)]+|#[^\s)]+)\))|(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)/g;

        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            // Texte brut avant le match
            if (match.index > lastIndex) {
                parts.push(line.substring(lastIndex, match.index));
            }

            if (match[1]) {
                // Lien [texte](url)
                const linkText = match[2];
                const linkUrl = match[3];
                const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#');
                parts.push(
                    <a
                        key={`link-${match.index}`}
                        href={linkUrl}
                        target={isInternal ? undefined : '_blank'}
                        rel={isInternal ? undefined : 'noopener noreferrer'}
                        className="parsed-md-link"
                    >
                        {linkText}
                    </a>
                );
            } else if (match[4]) {
                // Gras **texte**
                parts.push(<strong key={`bold-${match.index}`}>{match[5]}</strong>);
            } else if (match[6]) {
                // Italique *texte*
                parts.push(<em key={`italic-${match.index}`}>{match[7]}</em>);
            } else if (match[8]) {
                // Code `code`
                parts.push(<code key={`code-${match.index}`} className="parsed-md-code">{match[9]}</code>);
            }

            lastIndex = regex.lastIndex;
        }

        // Reste de la ligne
        if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
        }

        return (
            <React.Fragment key={`line-${lineIdx}`}>
                {parts.length > 0 ? parts : line}
                {lineIdx < lines.length - 1 && <br />}
            </React.Fragment>
        );
    };

    return lines.map((line, idx) => renderLine(line, idx));
}

export default parseMarkdown;
