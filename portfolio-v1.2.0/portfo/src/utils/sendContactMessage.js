const API_ENDPOINT = process.env.REACT_APP_API_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5001/api/contact'
        : '/api/contact'
);
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_KEY = process.env.REACT_APP_WEB3FORMS_KEY;

export async function sendContactMessage({ name, email, phone, message }) {
    const payload = {
        name,
        email,
        phone: phone || '',
        message,
        botcheck: '',
    };

    try {
        const res = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
            return data;
        }

        if (!WEB3FORMS_KEY) {
            throw new Error(data.message || `Échec de l'envoi (HTTP ${res.status})`);
        }
    } catch (primaryErr) {
        // Fallback Web3Forms si le serveur local n'est pas démarré et que la clé est présente
        if (WEB3FORMS_KEY) {
            const fallbackRes = await fetch(WEB3FORMS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_KEY,
                    subject: `Nouveau message portfolio — ${name}`,
                    from_name: 'Portfolio Pierre Untersinger',
                    ...payload,
                }),
            });

            const fallbackData = await fallbackRes.json().catch(() => ({}));
            if (fallbackRes.ok && fallbackData.success) {
                return fallbackData;
            }
        }

        throw new Error(primaryErr.message || "Impossible d'envoyer le message.");
    }
}

