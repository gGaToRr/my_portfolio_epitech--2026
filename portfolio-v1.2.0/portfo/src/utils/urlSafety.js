const SAFE_SCHEME_RE = /^(https?:|mailto:|tel:)/i;

/**
 * Verifie qu'une URL saisie par un formulaire (lien social, bouton...) est
 * sure a poser dans un attribut href.
 *
 * Sans ce filtre, un champ "URL" en texte libre accepte aussi bien
 * javascript:alert(1) qu'une vraie adresse : le navigateur l'execute au clic
 * comme n'importe quel autre lien. Les espaces sont retires avant de lire le
 * schema car ils permettent de le deguiser (tabulation au milieu de
 * "javascript:") tout en restant valides pour le navigateur a la navigation.
 */
export function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;

    const withoutWhitespace = trimmed.replace(/\s/g, '');
    return SAFE_SCHEME_RE.test(withoutWhitespace);
}

export default isSafeUrl;
