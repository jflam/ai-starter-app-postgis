import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../src/client/components/Header';

describe('Header component', () => {
  it('renders the title text', () => {
    render(<Header />);
    const heading = screen.getByText('Top Asian Noodles');
    expect(heading).toBeDefined();
  });
});