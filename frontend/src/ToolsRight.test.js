import { render, screen, fireEvent } from '@testing-library/react'
import ToolsRight from './ToolsRight.js'


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
  render(<ToolsRight module={module_} /> )
  const container = document.querySelector('.module-title')
  expect(container).toBeInTheDocument()

  const btns = document.querySelectorAll('.add-item')
  expect(screen.getByText(/CONSTANTS/)).toBeInTheDocument()
  expect(screen.getByText(/States/)).toBeInTheDocument()
  expect(screen.getByText(/Conditions/)).toBeInTheDocument()

  fireEvent.click(btns[0])
  expect(document.querySelector('#form-dialog-title')).toBeInTheDocument()
  fireEvent.click(screen.getByText(/Save/))

  const list = document.querySelectorAll('.list-tool.item.constants')
  fireEvent.click(list[0])
  fireEvent.click(screen.getByText(/Delete/))

  fireEvent.click(btns[1])
  fireEvent.click(screen.getAllByText(/Save/)[1])
  const listStates = document.querySelectorAll('.list-tool.item.states')
  fireEvent.click(listStates[0])
  fireEvent.click(screen.getAllByText(/Save/)[1])
  fireEvent.click(listStates[0])
  fireEvent.click(screen.getAllByText(/Delete/)[1])

  fireEvent.click(btns[2])
  fireEvent.click(screen.getAllByText(/Save/)[2])
  const listCond = document.querySelectorAll('.list-tool.item.conds')
  fireEvent.click(listCond[0])
  fireEvent.click(screen.getAllByText(/Save/)[2])
  fireEvent.click(listCond[0])
  fireEvent.click(screen.getAllByText(/Delete/)[2])

});

