import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

jest.mock('./api', () => ({
  getProjets: () => Promise.resolve({ data: [] }),
  addProjet: () => Promise.resolve({}),
}));

test('affiche le nom dans le header', () => {
  render(<App />);
  expect(screen.getAllByText(/Khady PENE/i).length).toBeGreaterThan(0);
});

test('navigation entre les onglets', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Contact'));
  expect(screen.getByText(/Me contacter/i)).toBeInTheDocument();
});

test('navigation vers Projets', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Projets'));
  expect(screen.getByText('Projets')).toBeInTheDocument();
});
