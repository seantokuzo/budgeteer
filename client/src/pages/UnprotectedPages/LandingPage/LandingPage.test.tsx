// TODO
import { render, screen } from '@testing-library/react';
import LandingPage from './LandingPage';

describe('LandingPage Test', () => {
  it('Renders landing page correctly', async () => {
    render(<LandingPage />);
    expect(screen.getAllByText('LandingPage').length).toEqual(1);
  });
});
