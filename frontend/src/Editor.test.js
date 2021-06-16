import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent} from '@testing-library/user-event';
import Editor from './Editor.js';
import { createMemoryHistory } from "history";
import { Router, Route } from "react-router-dom";



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

test('editor', () => {
 const { getByText } = renderWithRouterMatch(Editor, {
    route: "/edit/user/project",
    path: "/edit/:username/:projectname"
  })
  const container = document.querySelector('.menu')
  expect(container).toBeInTheDocument()
  const name = screen.getByText(/Personal page/)
  expect(name).toBeInTheDocument()

  const btn_save = document.querySelectorAll('.btn-menu')
  fireEvent.click(btn_save[0])
  fireEvent.click(btn_save[1])
  fireEvent.click(btn_save[2])
  fireEvent.click(screen.getByText(/Cancel/))
  fireEvent.click(btn_save[3])

  expect(screen.getByText(/Specification/)).toBeInTheDocument()
  expect(screen.getByText(/Source file/)).toBeInTheDocument()

  fireEvent.click(screen.getByText(/Source file/))
  expect(document.querySelector('.editors')).toBeInTheDocument()

  const tabs = document.querySelectorAll('.tab-module')
  fireEvent.click(tabs[1])

  fireEvent.click(screen.getByText(/Show changes/))


})






