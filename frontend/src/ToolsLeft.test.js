import { render, screen, fireEvent } from '@testing-library/react'
import ToolsLeft from './ToolsLeft.js'


test('tools left', () => {
  const module_ = {
        "name": "test",
        "open": true,
        "content": [
            {
                "name": "proc1WantsToEnter",
                "globalname": "proc1WantsToEnter",
                "graph": {
                    "nodes": [
                        {
                            "id": "TRUE",
                            "label": "TRUE"
                        },
                        {
                            "id": "FALSE",
                            "label": "FALSE"
                        }
                    ],
                    "edges": []
                }
            }
        ],
        "input": "(i)",
        "var": [
            {
                "name": "proc1WantsToEnter",
                "type": "boolean",
                "value": "",
                "assign": [
                    "init(proc1WantsToEnter) := FALSE"
                ]
            }
        ],
        "define": [],
        "constants": []
      }

  render(<ToolsLeft module={module_} /> )
  const container = document.querySelector('.module-title')
  expect(container).toBeInTheDocument()
  expect(screen.getByText(/test/)).toBeInTheDocument()

  const btns = document.querySelectorAll('.add-item')
  expect(screen.getByText(/VAR/)).toBeInTheDocument()
  expect(screen.getByText(/DEFINE/)).toBeInTheDocument()

  fireEvent.click(btns[1])
  expect(document.querySelector('#form-dialog-title')).toBeInTheDocument()
  fireEvent.click(screen.getByText(/Save/))

  const list = document.querySelectorAll('.list-tool.item.var')
  fireEvent.click(list[0])
  fireEvent.click(screen.getByText(/Save/))
  fireEvent.click(list[0])
  fireEvent.click(screen.getByText(/Delete/))

  fireEvent.click(btns[2])
  fireEvent.click(screen.getAllByText(/Save/)[1])
  const listDef = document.querySelectorAll('.list-tool.item.def')
  fireEvent.click(listDef[0])
  fireEvent.click(screen.getAllByText(/Save/)[1])
  fireEvent.click(listDef[0])
  fireEvent.click(screen.getAllByText(/Delete/)[1])

});

