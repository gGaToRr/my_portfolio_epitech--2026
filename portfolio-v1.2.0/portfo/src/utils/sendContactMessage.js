const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = process.env.REACT_APP_WEB3FORMS_KEY;

export async function sendContactMessage({ name, email, phone, message }) {
    const payload = {
        access_key: ACCESS_KEY,
        subject: `Nouveau message portfolio — ${name}`,
        from_name: 'Portfolio Pierre Untersinger',
        name,
        email,
        phone: phone || '(non renseigné)',
        message,
        botcheck: '',
    };

    const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
        throw new Error(data.message || `Échec de l'envoi (HTTP ${res.status})`);
    }

    return data;
}
