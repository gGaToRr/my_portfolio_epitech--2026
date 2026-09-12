import React from 'react';
import { render, screen } from '@testing-library/react';
import { parseMarkdown } from './markdownParser';

function renderMarkdown(text) {
    return render(<div data-testid="out">{parseMarkdown(text)}</div>);
}

describe('parseMarkdown', () => {
    test('returns the input unchanged when not a string', () => {
        expect(parseMarkdown(null)).toBeNull();
        expect(parseMarkdown(undefined)).toBeUndefined();
    });

    test('renders bold, italic and inline code', () => {
        renderMarkdown('**gras** et *italique* et `code`');
        expect(screen.getByText('gras').tagName).toBe('STRONG');
        expect(screen.getByText('italique').tagName).toBe('EM');
        expect(screen.getByText('code').tagName).toBe('CODE');
    });

    test('turns a newline into a line break', () => {
        const { container } = renderMarkdown('ligne 1\nligne 2');
        expect(container.querySelectorAll('br')).toHaveLength(1);
    });

    test('external links open in a new tab with rel=noopener', () => {
        renderMarkdown('[GitHub](https://github.com/x)');
        const link = screen.getByText('GitHub');
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href', 'https://github.com/x');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('internal links stay in-tab without rel/target', () => {
        renderMarkdown('[Contact](/contact)');
        const link = screen.getByText('Contact');
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href', '/contact');
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
    });

    // Un lien markdown vers un schéma non listé (javascript:, data:...) ne doit
    // jamais devenir un <a href> cliquable : c'est ce qui rend ce parseur sûr
    // par construction, sans avoir besoin d'un filtre séparé comme urlSafety.
    test('does not linkify unsupported url schemes', () => {
        const { container } = renderMarkdown('[x](javascript:alert(1))');
        expect(container.querySelector('a')).toBeNull();
        expect(container.textContent).toContain('[x](javascript:alert(1))');
    });
});
