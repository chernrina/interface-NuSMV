import { render, screen } from '@testing-library/react';
import App from './App';

test('app', () => {
  render(<App />);
  const container = document.querySelector('.main-app')
  expect(container).toBeInTheDocument();
});

