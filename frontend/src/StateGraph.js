import Graph from "react-graph-vis"
import { v4 as uuidv4 } from 'uuid'

function StateGraph (props)  {
  const options =  {
        layout: {
           randomSeed: 10
        },
        edges: {
          color: "#000000",
          scaling: {
            label: {
              enabled: true,
            }
          },
          font: {
            align: 'top'
          },
          smooth: {
            enabled:true,
            type:'diagonalCross',
            roundness: 0.3
          },
          physics:false,
          length: 100
        },
        nodes: {
          color: "#ffffff",
          borderWidth: 2,
          shape: "circle",
          widthConstraint: {
            minimum: 50,
            maximum: 50
          },
          font: {
            size: 10
          }
        },
        physics: {
          enabled: true,
          repulsion: {
            nodeDistance: 0,
            springConstant: 0
          },
          solver: 'repulsion'
        },
        interaction: { 
          multiselect: true, 
          dragView: true,
          dragNodes: true
        }
      }

    return (
      <div id="graph" style={{ height: "38vh" }}>
        <Graph
          key={uuidv4()}
          graph={props.graph}
          options={options}
        />
        
      </div>
    );
  
}

export default StateGraph;
