import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CmsRoute from './cms';

function renderWithRouter(path = '/cms/home') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/cms/:slug" element={<CmsRoute />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('UI route /cms/:slug', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it('shows loading initially', () => {
    (global.fetch).mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    renderWithRouter('/cms/home');
    expect(screen.getByText(/Loading CMS page…/i)).toBeInTheDocument();
  });

  it('renders page tree on success', async () => {
    const page = {
      version: '1.0.0',
      meta: { slug: 'home', title: 'Home' },
      root: {
        type: 'Container',
        params: { class: 'container' },
        children: [
          { type: 'TextBlock', params: { text: 'Welcome!' } },
          { type: 'List', params: { items: ['One', 'Two', 'Three'] } },
        ],
      },
    };
    (global.fetch).mockResolvedValue({ ok: true, status: 200, json: async () => page });

    renderWithRouter('/cms/home');

    await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    const root = screen.getByTestId('cms-root');
    expect(within(root).getByText('Welcome!')).toBeInTheDocument();
    const list = within(root).getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['One', 'Two', 'Three']);
  });

  it('shows Not Found when API returns 404', async () => {
    (global.fetch).mockResolvedValue({ ok: false, status: 404 });
    renderWithRouter('/cms/missing');
    await waitFor(() => expect(screen.getByText(/Page not found/i)).toBeInTheDocument());
  });

  it('shows error when API fails', async () => {
    (global.fetch).mockResolvedValue({ ok: false, status: 500 });
    renderWithRouter('/cms/home');
    await waitFor(() => expect(screen.getByText(/Error:/i)).toBeInTheDocument());
  });
});
