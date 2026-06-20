import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  it('renders the application name correctly', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('CarbonWise')).toBeDefined();
  });

  it('renders the primary navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('History')).toBeDefined();
  });

  it('contains proper accessibility labels', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByLabelText('Main Navigation')).toBeDefined();
    expect(screen.getByLabelText('CarbonWise Home')).toBeDefined();
    expect(screen.getByLabelText('User Profile')).toBeDefined();
  });
});
