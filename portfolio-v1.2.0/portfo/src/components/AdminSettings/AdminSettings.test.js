import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import AdminSettings from './AdminSettings';
import { fetchLogsFiles, triggerLogArchive, clearBugs } from '../../services/api';

jest.mock('../../services/api', () => ({
    verifyAdminAuth: jest.fn(),
    fetchLogsFiles: jest.fn(),
    triggerLogArchive: jest.fn(),
    clearBugs: jest.fn(),
}));

beforeEach(() => {
    fetchLogsFiles.mockReset().mockResolvedValue({
        daily_logs: [], archives: [], total_daily_logs: 3, total_archives: 1,
    });
    triggerLogArchive.mockReset();
    clearBugs.mockReset();
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
