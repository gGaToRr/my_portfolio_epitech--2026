import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { EditableContentProvider, useEditableContent } from './EditableContentContext';
import { verifyAdminAuth } from '../services/api';

// react-router-dom v7 (ESM pur) n'est pas résoluble par le Jest 27 embarqué
// par react-scripts 5 : moduleNameMapper (package.json) redirige tout import
// de 'react-router-dom' vers __mocks__/react-router-dom.js.

// L'admin-gate est le correctif de sécurité central de cette passe : ?edit=true
// dans l'URL ne doit plus suffire à activer le mode édition, il faut en plus
// une session admin vérifiée côté serveur (cookie HttpOnly).
jest.mock('../services/api', () => ({
    verifyAdminAuth: jest.fn(),
}));

function Probe() {
    const { isEditMode } = useEditableContent();
    return <div data-testid="probe">{String(isEditMode)}</div>;
}

function renderAt(route) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <LanguageProvider>
                <EditableContentProvider>
                    <Probe />
                </EditableContentProvider>
            </LanguageProvider>
        </MemoryRouter>
    );
}

describe('EditableContentContext edit-mode auth gate', () => {
    beforeEach(() => {
        verifyAdminAuth.mockReset();
    });

    test('?edit=true alone does not enable edit mode without a verified session', async () => {
        verifyAdminAuth.mockResolvedValue(false);
        renderAt('/?edit=true');

        await waitFor(() => expect(verifyAdminAuth).toHaveBeenCalled());
        expect(screen.getByTestId('probe')).toHaveTextContent('false');
    });

    test('edit mode turns on once the admin session is verified', async () => {
        verifyAdminAuth.mockResolvedValue(true);
        renderAt('/?edit=true');

        await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('true'));
    });

    test('no verification is attempted without an edit query param', () => {
        renderAt('/');

        expect(screen.getByTestId('probe')).toHaveTextContent('false');
        expect(verifyAdminAuth).not.toHaveBeenCalled();
    });

    test('?mode=edit is accepted as an alias for ?edit=true', async () => {
        verifyAdminAuth.mockResolvedValue(true);
        renderAt('/?mode=edit');

        await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('true'));
    });
});
