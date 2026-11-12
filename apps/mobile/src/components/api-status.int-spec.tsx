import { render, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { TEST_API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

import { ApiStatus } from './api-status';

// Integration: the real component, hook and fetch client together, rendered
// with React Native Testing Library, with the network boundary mocked by MSW.
describe('ApiStatus (integration)', () => {
  it('shows the uptime when the API is healthy', async () => {
    await render(<ApiStatus />);

    expect(await screen.findByText('Online · up 42s')).toBeOnTheScreen();
  });

  it('shows an unavailable state when the API fails', async () => {
    server.use(
      http.get(`${TEST_API_URL}/api/health`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 503 }),
      ),
    );

    await render(<ApiStatus />);

    expect(await screen.findByText('Unavailable')).toBeOnTheScreen();
  });
});
