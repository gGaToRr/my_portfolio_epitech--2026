import { isSafeUrl } from './urlSafety';

describe('isSafeUrl', () => {
    test.each([
        ['https://github.com/x'],
        ['http://example.com'],
        ['mailto:me@example.com'],
        ['tel:+33612345678'],
        ['/internal-path'],
        ['#anchor'],
    ])('accepts %s', (url) => {
        expect(isSafeUrl(url)).toBe(true);
    });

    test.each([
        ['javascript:alert(1)'],
        ['JaVaScRiPt:alert(1)'],
        ['java\tscript:alert(1)'],
        [' javascript:alert(1)'],
        ['data:text/html;base64,PHNjcmlwdD4='],
        ['vbscript:msgbox(1)'],
        [''],
        ['   '],
        [null],
        [undefined],
    ])('rejects %s', (url) => {
        expect(isSafeUrl(url)).toBe(false);
    });
});
