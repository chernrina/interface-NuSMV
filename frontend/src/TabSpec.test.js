import { render, screen, fireEvent } from '@testing-library/react'
import TabSpec from './TabSpec.js'


test('tab spec', () => {
  const spec = [
            {
                "type": "LTLSPEC",
                "content": "first"
            }
        ]
  render(<TabSpec spec={spec} result={false} structure={[]} /> )
  const container = document.querySelector('.list-spec')
  expect(container).toBeInTheDocument()
  const btn_add = document.querySelector('.add-spec')
  expect(btn_add).toBeInTheDocument()
  fireEvent.click(btn_add)

  expect(document.querySelector('#content-spec')).toBeInTheDocument()
  expect(screen.getByText(/Cancel/)).toBeInTheDocument()

  const save = screen.getByText(/Save/)
  fireEvent.click(save)

  const item = document.querySelector('.item')
  expect(item).toBeInTheDocument()
  fireEvent.click(item)

  fireEvent.click(screen.getByText(/Save/))
  fireEvent.click(item)
  fireEvent.click(screen.getByText(/Cancel/))

  fireEvent.click(item)
  fireEvent.click(screen.getByText(/Delete/))
  fireEvent.click(document.querySelector('.item'))
  fireEvent.click(screen.getByText(/Delete/))

  expect(document.querySelector('.item')).not.toBeInTheDocument()
});

test('tab spec result', () => {
  const structure = [
            {
                "spec": "first",
                "res": "true",

            }
        ]
  render(<TabSpec spec={[]} result={true} structure={structure} /> )
  const container = document.querySelector('.list-spec')
  expect(container).toBeInTheDocument()
  const btn_add = document.querySelector('.add-spec')
  expect(btn_add).not.toBeInTheDocument()
  expect(document.querySelector('.spec')).toBeInTheDocument()
})

