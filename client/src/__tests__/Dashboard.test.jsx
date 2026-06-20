import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock Recharts to avoid ResizeObserver issues in JSDOM
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: '100%', height: 300 }}>{children}</div>
    ),
  };
});

describe('Dashboard Component', () => {
  it('should render the Quick Logging title', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('Quick Logging')).toBeInTheDocument();
  });

  it('should switch tabs when category icons are clicked', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    // Initial tab is transport
    expect(screen.getByLabelText(/Miles driven weekly/i)).toBeInTheDocument();
    
    // Click energy tab
    const energyBtn = screen.getByLabelText('Switch to Energy category');
    fireEvent.click(energyBtn);
    
    // Transport input should be fading out, Energy input should be present
    await waitFor(() => {
      expect(screen.getByLabelText(/Electricity/i)).toBeInTheDocument();
    });
  });
});
