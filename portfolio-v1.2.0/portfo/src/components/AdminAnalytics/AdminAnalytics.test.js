import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminAnalytics from './AdminAnalytics';
import { fetchAnalyticsOverview, fetchAnalyticsChart } from '../../services/api';

jest.mock('../../services/api', () => ({
    fetchAnalyticsOverview: jest.fn(),
    fetchAnalyticsChart: jest.fn(),
}));

const OVERVIEW = {
    totaux: {
        pages_vues: 10,
        visiteurs_uniques: 5,
        telechargements_cv: 1,
        vues_admin: 2,
        moyenne_par_jour: 1,
        pages_par_visiteur: 2,
    },
    pages: [],
    sources: [],
    navigateurs: [],
    systemes: [],
    fuseaux: [],
    ecrans: [],
    evenements: [{ libelle: 'download_cv', valeur: 3 }],
    graphiques: ['trafic', 'heures', 'pages', 'sources', 'technologies', 'fuseaux', 'ecrans'],
};

beforeEach(() => {
    fetchAnalyticsOverview.mockReset().mockResolvedValue(OVERVIEW);
    fetchAnalyticsChart.mockReset().mockResolvedValue('data:image/svg+xml;utf8,%3Csvg%2F%3E');
});

test('the "all" filter badge counts every figure across sections, not just the section count', async () => {
    render(<AdminAnalytics />);
    await waitFor(() => expect(fetchAnalyticsOverview).toHaveBeenCalled());

    // 2 (trafic) + 2 (pages) + 3 (tech) + 1 (événements) = 8, dérivé de SECTIONS_CONFIG.
    const allButton = await screen.findByRole('button', { name: /toutes les sections/i });
    expect(within(allButton).getByText('8')).toBeInTheDocument();
});

test('filtering to "Pages & Provenance" hides the unrelated visitor-actions section', async () => {
    const user = userEvent.setup();
    render(<AdminAnalytics />);
    await waitFor(() => expect(fetchAnalyticsOverview).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /pages & provenance/i }));

    expect(screen.queryByText(/actions & événements des visiteurs/i)).not.toBeInTheDocument();
});

test('the "all" filter still shows the visitor-actions section', async () => {
    render(<AdminAnalytics />);
    await waitFor(() => expect(fetchAnalyticsOverview).toHaveBeenCalled());

    expect(screen.getByText(/actions & événements des visiteurs/i)).toBeInTheDocument();
});
