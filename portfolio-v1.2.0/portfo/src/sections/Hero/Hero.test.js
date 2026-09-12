import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import Hero from './Hero';
import { verifyAdminAuth } from '../../services/api';

// react-router-dom v7 (ESM pur) n'est pas résoluble par le Jest 27 embarqué
// par react-scripts 5 : moduleNameMapper (package.json) redirige tout import
// de 'react-router-dom' vers __mocks__/react-router-dom.js.

// Vérifie de bout en bout, sur une vraie section publique, que le bouton
// d'édition n'apparaît qu'après vérification serveur de la session admin —
// et non plus dès que l'URL contient ?edit=true.
jest.mock('../../services/api', () => ({
    verifyAdminAuth: jest.fn(),
}));

describe('Hero edit trigger visibility', () => {
    beforeEach(() => {
        verifyAdminAuth.mockReset();
    });

    test('hides the edit trigger for an unauthenticated visitor even with ?edit=true', async () => {
        verifyAdminAuth.mockResolvedValue(false);
        renderWithProviders(<Hero />, { route: '/?edit=true' });

        await waitFor(() => expect(verifyAdminAuth).toHaveBeenCalled());
        expect(screen.queryByRole('button', { name: /modifier le hero/i })).not.toBeInTheDocument();
    });

    test('shows the edit trigger once the admin session is verified', async () => {
        verifyAdminAuth.mockResolvedValue(true);
        renderWithProviders(<Hero />, { route: '/?edit=true' });

        expect(await screen.findByRole('button', { name: /modifier le hero/i })).toBeInTheDocument();
    });

    test('never shows the edit trigger without the edit query param', () => {
        renderWithProviders(<Hero />, { route: '/' });
        expect(screen.queryByRole('button', { name: /modifier le hero/i })).not.toBeInTheDocument();
    });
});
