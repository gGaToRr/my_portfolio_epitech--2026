import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { EditableContentProvider } from '../context/EditableContentContext';

/**
 * Rend un composant sous la même pile de providers que l'application réelle
 * (Router > Language > EditableContent), pour que useSearchParams et
 * useEditableContent fonctionnent dans les tests comme en production.
 */
export function renderWithProviders(ui, { route = '/' } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <LanguageProvider>
                <EditableContentProvider>{ui}</EditableContentProvider>
            </LanguageProvider>
        </MemoryRouter>
    );
}

export default renderWithProviders;
