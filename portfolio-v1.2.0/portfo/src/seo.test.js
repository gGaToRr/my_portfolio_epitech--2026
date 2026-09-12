import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function readPublicFile(name) {
    return fs.readFileSync(path.join(PUBLIC_DIR, name), 'utf-8');
}

describe('robots.txt', () => {
    const content = readPublicFile('robots.txt');

    test('disallows the admin panel and admin API', () => {
        expect(content).toMatch(/Disallow:\s*\/panelAdmin/);
        expect(content).toMatch(/Disallow:\s*\/api\/admin\//);
    });

    test('points to the sitemap', () => {
        expect(content).toMatch(/Sitemap:\s*https:\/\/\S+\/sitemap\.xml/);
    });
});

describe('sitemap.xml', () => {
    const content = readPublicFile('sitemap.xml');

    test('is well-formed XML with at least one URL', () => {
        expect(content).toMatch(/^<\?xml/);
        const urlCount = (content.match(/<loc>/g) || []).length;
        expect(urlCount).toBeGreaterThan(0);
        // Compte grossier mais suffisant ici : autant d'ouvrantes que de fermantes.
        expect((content.match(/<url>/g) || []).length).toBe((content.match(/<\/url>/g) || []).length);
    });

    // Le seul vrai risque avec ce fichier : quelqu'un y recopie une route
    // d'admin en pensant l'indexer comme une page publique normale.
    test('never lists an admin route', () => {
        expect(content).not.toMatch(/panelAdmin/i);
        expect(content).not.toMatch(/\/api\//);
    });
});

describe('llms.txt', () => {
    const content = readPublicFile('llms.txt');

    test('exists and describes the site', () => {
        expect(content).toMatch(/^# /);
    });

    test('never mentions the admin panel', () => {
        expect(content).not.toMatch(/panelAdmin/i);
    });
});
