import { render, screen } from '@testing-library/react';
import HomePage from './HomePage.js';

test('home page', () => {
  render(<HomePage />);
  const container = document.querySelector('.btn-header')
  expect(container).toBeInTheDocument()
  expect(document.querySelector('.testing')).toBeNull() 
  expect(screen.getByText(/NuSMV web-interface/)).toBeInTheDocument()
});

