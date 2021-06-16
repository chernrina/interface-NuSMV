import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent} from '@testing-library/user-event';
import PersonalPage from './PersonalPage.js';
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from "history";
import axios from "axios"

export function renderWithRouterMatch(
  ui,
  {
    path = "/",
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  return {
    ...render(
      <Router history={history}>
        <Route path={path} component={ui} />
      </Router>
    )
  };
}

test('personal page', async () => {
 const { getByText } = renderWithRouterMatch(PersonalPage, {
    route: "/lk/user",
    path: "/lk/:username"
  })
  const container = document.querySelector('.projects-area')
  expect(container).toBeInTheDocument()
  const name = screen.getByText(/user/)
  expect(name).toBeInTheDocument()
  expect(document.querySelector('#form-dialog-title')).not.toBeInTheDocument()

  const button = screen.getByText(/Create project/)
  expect(button).toBeInTheDocument()
  fireEvent.click(button)

  expect(document.querySelector('#form-dialog-title')).toBeInTheDocument()
  const cancel = screen.getByText(/Cancel/)
  expect(cancel).toBeInTheDocument()
  fireEvent.click(cancel)

})


