import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { TEST_API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { ApiStatus } from './api-status';

// Integration: the real component, hook and fetch client together, rendered
// in jsdom, with the network boundary mocked by MSW.
describe('ApiStatus (integration)', () => {
  it('shows the formatted uptime when the API is healthy', async () => {
    render(<ApiStatus />);

    expect(screen.getByRole('status')).toHaveTextContent('Checking…');
    expect(await screen.findByText('Online · up 1h 2m 5s')).toBeInTheDocument();
  });

  it('shows an unavailable state when the API fails', async () => {
    server.use(
      http.get(`${TEST_API_URL}/api/health`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 503 }),
      ),
    );

    render(<ApiStatus />);

    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
  });
});
