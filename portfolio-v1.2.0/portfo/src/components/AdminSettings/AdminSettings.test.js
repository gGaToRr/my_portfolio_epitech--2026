import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import AdminSettings from './AdminSettings';
import { fetchLogsFiles, triggerLogArchive, clearBugs, changePassword } from '../../services/api';

jest.mock('../../services/api', () => ({
    verifyAdminAuth: jest.fn(),
    fetchLogsFiles: jest.fn(),
    triggerLogArchive: jest.fn(),
    clearBugs: jest.fn(),
    changePassword: jest.fn(),
}));

beforeEach(() => {
    fetchLogsFiles.mockReset().mockResolvedValue({
        daily_logs: [], archives: [], total_daily_logs: 3, total_archives: 1,
    });
    triggerLogArchive.mockReset();
    clearBugs.mockReset();
    changePassword.mockReset();
    window.confirm = jest.fn(() => true);
});

test('shows account, content and maintenance sections', async () => {
    renderWithProviders(<AdminSettings />);
    expect(screen.getByText('Compte administrateur')).toBeInTheDocument();
    expect(screen.getByText('Contenu du portfolio (mode édition)')).toBeInTheDocument();
    expect(screen.getByText('Maintenance & Logs')).toBeInTheDocument();
    await waitFor(() => expect(fetchLogsFiles).toHaveBeenCalled());
});

test('archiving with nothing to archive shows a neutral (non-error) message', async () => {
    triggerLogArchive.mockResolvedValue({ status: 'empty', message: 'Aucun log trouvé pour 8/2026' });
    const user = userEvent.setup();
    renderWithProviders(<AdminSettings />);

    await user.click(screen.getByRole('button', { name: /archiver le mois précédent/i }));

    expect(window.confirm).toHaveBeenCalled();
    const status = await screen.findByText('Aucun log trouvé pour 8/2026');
    expect(status).toHaveClass('admin-settings-inline-status--neutral');
});

test('a successful archive reports the file count', async () => {
    triggerLogArchive.mockResolvedValue({
        status: 'ok', archive_name: 'logs-aout.2026.tar.gz', files_count: 5, archive_size_bytes: 2048,
    });
    const user = userEvent.setup();
    renderWithProviders(<AdminSettings />);

    await user.click(screen.getByRole('button', { name: /archiver le mois précédent/i }));

    const status = await screen.findByText(/logs-aout\.2026\.tar\.gz/);
    expect(status).toHaveClass('admin-settings-inline-status--ok');
});

test('clearing bug reports calls the API and confirms first', async () => {
    clearBugs.mockResolvedValue({ success: true, message: 'Historique des bugs réinitialisé' });
    const user = userEvent.setup();
    renderWithProviders(<AdminSettings />);

    await user.click(screen.getByRole('button', { name: /vider les signalements de bugs/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(clearBugs).toHaveBeenCalled();
    expect(await screen.findByText('Historique des bugs réinitialisé')).toBeInTheDocument();
});

test('does not call the archive/clear APIs when the confirmation is declined', async () => {
    window.confirm = jest.fn(() => false);
    const user = userEvent.setup();
    renderWithProviders(<AdminSettings />);

    await user.click(screen.getByRole('button', { name: /archiver le mois précédent/i }));
    await user.click(screen.getByRole('button', { name: /vider les signalements de bugs/i }));

    expect(triggerLogArchive).not.toHaveBeenCalled();
    expect(clearBugs).not.toHaveBeenCalled();
});

describe('password change form', () => {
    async function fillPasswordForm(user, { current = 'oldpassword1', next = 'newpassword2', confirm = next } = {}) {
        await user.type(screen.getByLabelText('Mot de passe actuel'), current);
        await user.type(screen.getByLabelText('Nouveau mot de passe'), next);
        await user.type(screen.getByLabelText('Confirmer le nouveau mot de passe'), confirm);
    }

    test('the submit button stays disabled until the form is valid', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminSettings />);
        const submit = screen.getByRole('button', { name: /^changer le mot de passe$/i });
        expect(submit).toBeDisabled();

        await fillPasswordForm(user);
        expect(submit).toBeEnabled();
    });

    test('rejects a new password that is too short before ever calling the API', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminSettings />);

        await fillPasswordForm(user, { next: 'short', confirm: 'short' });

        expect(screen.getByText(/au moins 8 caractères/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^changer le mot de passe$/i })).toBeDisabled();
    });

    test('rejects a confirmation that does not match', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminSettings />);

        await fillPasswordForm(user, { next: 'newpassword2', confirm: 'somethingelse' });

        expect(screen.getByText(/ne correspond pas/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^changer le mot de passe$/i })).toBeDisabled();
    });

    test('submits current/new password to the API and clears the form on success', async () => {
        changePassword.mockResolvedValue({ success: true, message: 'Mot de passe mis à jour.' });
        const user = userEvent.setup();
        renderWithProviders(<AdminSettings />);

        await fillPasswordForm(user, { current: 'oldpassword1', next: 'newpassword2' });
        await user.click(screen.getByRole('button', { name: /^changer le mot de passe$/i }));

        expect(changePassword).toHaveBeenCalledWith('oldpassword1', 'newpassword2');
        expect(await screen.findByText('Mot de passe mis à jour.')).toBeInTheDocument();
        expect(screen.getByLabelText('Mot de passe actuel')).toHaveValue('');
        expect(screen.getByLabelText('Nouveau mot de passe')).toHaveValue('');
    });

    test('shows the server error when the current password is wrong', async () => {
        changePassword.mockRejectedValue(new Error('Mot de passe actuel incorrect.'));
        const user = userEvent.setup();
        renderWithProviders(<AdminSettings />);

        await fillPasswordForm(user);
        await user.click(screen.getByRole('button', { name: /^changer le mot de passe$/i }));

        expect(await screen.findByText('Mot de passe actuel incorrect.')).toBeInTheDocument();
        // L'échec ne doit pas vider ce que la personne avait déjà saisi.
        expect(screen.getByLabelText('Mot de passe actuel')).toHaveValue('oldpassword1');
    });
});
