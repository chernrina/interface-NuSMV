import {React, useState} from "react";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';


function ToolsRight(props) {

	const [openConstants, setOpenConstants] = useState(false)
	const [elem,setElem] = useState({"name":"","value":""})
	const [name,setName] = useState("")
	const [value,setValue] = useState("")
	const [edit,setEdit] = useState(false)

	const [openState, setOpenState] = useState(false)
	const [state,setState] = useState({"name":""})
	var deleteElems = []

	const [openCondition, setOpenCondition] = useState(false)
	const [source,setSource] = useState("")
	const [target,setTarget] = useState("")
	const [condition, setCondition] = useState({"source":"","target":"","label":""})
	const [index,setIndex] = useState(0)

	const deleteElem = function() {
		const ind = props.module.constants.indexOf(elem)
		props.module.constants.splice(ind,1)
		setElem({"name":"","value":""})
	}

	const deleteElemState = function() {
		const ind = props.module.content.indexOf(state)
		props.module.content[ind].graph.nodes.splice(index,1)
		props.module.content[ind].graph.edges.map(p => {
			(p.from==name || p.to==name) && deleteElems.push(p)
		})
		deleteElems.map(p => {
			props.module.content[ind].graph.edges.splice(props.module.content[ind].graph.edges.indexOf(p),1)
		})
		if (props.module.content[ind].graph.nodes.length == 0 && props.module.content[ind].graph.edges.length == 0) {
			props.module.content.splice(ind,1)
		}
		setState("")
	}

	const deleteElemCond = function() {
		const ind = props.module.content.indexOf(condition)
		props.module.content[ind].graph.edges.splice(index,1)
		setCondition("")
	}

	const change = function() {
		const ind = props.module.constants.indexOf(elem)
		props.module.constants[ind].name = name
		props.module.constants[ind].value = value
		setElem("")
	}

	const changeState = function() {
		const ind = props.module.content.indexOf(state)
		props.module.content[ind].graph.nodes[index].id = name
		props.module.content[ind].graph.nodes[index].id = name
		setState("")
	}

	const changeCondition = function() {
		const ind = props.module.content.indexOf(condition)
		props.module.content[ind].graph.edges[index].source = source
		props.module.content[ind].graph.edges[index].target = target
		props.module.content[ind].graph.edges[index].label = value
		setCondition("")
	}

	const addState = function() {
		var find = false
		for (var i = 0; i < props.module.content.length; i++) {
			console.log(props.module.content[i].name)
			if (props.module.content[i].name == value) {
				find = true
				props.module.content[i].graph.nodes.push({
					"id":name,
					"label":name
					})
			}
				
		}
		if (!find) {
			props.module.content.push({
				    		"name":value,
				    		"graph": {
					    		"nodes": [{
					    			"id":name,"label":name
					    		}],
					    		"edges": []
					    	}
				    	})
		}
	}

	const addCondition = function() {
		var find = false
		for (var i = 0; i < props.module.content.length; i++) {
			if (props.module.content[i]["name"] == name) {
				props.module.content[i]["graph"]["edges"].push({
					"from":source,
					"to":target,
					"label":value
					})
				
				find = true
			}
		}
		if (!find) {

			props.module.content.push({
				    		"name":name,
				    		"graph": {
					    		"nodes": [{
					    			"id":source,"label":source
					    		}],
					    		"edges": [{
									"from":source,
									"to":target,
									"label":value
									}]
					    	}
				    	})
			if (source !== target) {
				var size = props.module.content.length - 1
				props.module.content[size].graph.nodes.push({
					"id":target,"label":target
				})
			}
		}
	}

	const clear = function() {
		setName("")
		setValue("")
		setState("")
		setCondition("")
		setSource("")
		setTarget("")
	}


	return (
		<div>
			<div class="module-name">
				<div class="module-title">
				CONSTANTS
				</div> 
				<button class="add-item" onClick={() => setOpenConstants(true)}>
					+
				</button>			      		
			</div>

			<Dialog open={openConstants} onClose={() => setOpenConstants(false)} aria-labelledby="form-dialog-title" fullWidth="true">
			<DialogContent>
				<DialogTitle id="form-dialog-title">{edit && "Variable change (constants) " + elem.name}
				{!edit && "Variable creation (constants)"}</DialogTitle>		
			    <TextField
			    	defaultValue={elem.name}
			        label="Var name"
			        type="text"
			        onChange={(e) => setName(e.target.value)}
			        fullWidth
			    /> 
			    
			    <TextField
			    	defaultValue={elem.value}
			        label="Value"
			        type="text"
			        onChange={(e) => setValue(e.target.value)}
			        fullWidth
			    /> 
			</DialogContent>

			<DialogActions>
				{edit && <Button onClick={() => (
						setOpenConstants(false),
						setEdit(false),
						deleteElem()
						)} 
						color="primary">
						    Delete
					</Button>}
			    <Button onClick={() => (
			    	setEdit(false),
			    	setOpenConstants(false),
			    	setElem("")
			    	)} 
			    	color="primary">
			        Cancel
			    </Button>
			    <Button onClick={() => (
			    	setEdit(false),
			    	setOpenConstants(false),
			    	edit && change(),
			    	!edit && props.module.constants.push({
			    		"name":name,
			    		"value":value
			    	}),
			    	setElem("")
			    	)}
			      	
			        color="primary">
			            Save
				</Button>
			</DialogActions>
			</Dialog>

			<div class="list-tools">
				{props.module.constants.map(elem => (
					<div class="list-tool item constants" onClick={() => (
						setEdit(true),
						setElem(elem),
						setName(elem.name),
						setValue(elem.value),
						setOpenConstants(true)

						)}>
						{elem.name + ' : ' + elem.value} 	      						
					</div>
				))}
			</div>


			 <div class="state">
				<div class="module-name">
					<div class="module-title">
					States
					</div> 
					<button class="add-item" onClick={() => (
						setOpenState(true),
						clear())}>
						+
					</button>
					
				</div>

				<Dialog open={openState} onClose={() => setOpenState(false)} aria-labelledby="form-dialog-title" fullWidth="true">
				<DialogContent>
					<DialogTitle id="form-dialog-title">{edit && "Сhanging state"}
					{!edit && "Creating state"}</DialogTitle>	
					<TextField
				    	defaultValue={state.name}
				        label="var name"
				        type="text"
				        onChange={(e) => setValue(e.target.value)}
				        fullWidth
				    /> 	
				    <TextField
				    	defaultValue={name}
				        label="state name"
				        type="text"
				        onChange={(e) => setName(e.target.value)}
				        fullWidth
				    /> 
				</DialogContent>

				<DialogActions>

					{edit && <Button onClick={() => (
						setOpenState(false),
						setEdit(false),
						deleteElemState()
						)} 
						color="primary">
						    Delete
					</Button>}

				    <Button onClick={() => (
				    	setOpenState(false),
				    	setEdit(false)
				    	)} color="primary">
				        Cancel
				    </Button>
				    <Button onClick={() => (
				    	edit && changeState(),
				    	!edit && addState(),
				    	setEdit(false),
				    	setOpenState(false)
				    	)}
				      	
				        color="primary">
				            Save
					</Button>
				</DialogActions>
				</Dialog>

				<div class="list-tools">
					{props.module.content.map(p => (
						p.graph.nodes.map((elem,index) => (
							<div class="list-tool item states" onClick={() => (
							setState(p),
							setEdit(true),
							setOpenState(true),
							setName(elem.id),
							setIndex(index),
							props.load
							)}>
							{elem.id} ({p.name})				
						</div>
							
							))
						
						))}

				</div>

			 </div>

			<div class="conditions">
				<div class="module-name">
					<div class="module-title">
					Conditions
					</div> 
					<button class="add-item" onClick={() => (
						setOpenCondition(true),
						clear())}>
						+
					</button>
					
				</div> 

				<Dialog open={openCondition} onClose={() => setOpenCondition(false)} aria-labelledby="form-dialog-title" fullWidth="true">
				<DialogContent>
					<DialogTitle id="form-dialog-title">{edit && "Сhanging condition"}
					{!edit && "Creating condition"}</DialogTitle>	
					<TextField
				        defaultValue={condition.name}
				        label="name var"
				        type="text"
				        onChange={(e) => setName(e.target.value)}
				        fullWidth
				    /> 	
				    <TextField
				        defaultValue={source}
				        label="name state from"
				        type="text"
				        onChange={(e) => setSource(e.target.value)}
				        fullWidth
				    /> 
				    
				    <TextField
				        defaultValue={target}
				        label="name state to"
				        type="text"
				        onChange={(e) => setTarget(e.target.value)}
				        fullWidth
				    /> 
				    <TextField
				        defaultValue={value}
				        label="condition"
				        type="text"
				        onChange={(e) => setValue(e.target.value)}
				        fullWidth
				    /> 
				</DialogContent>

				<DialogActions>

					{edit && <Button onClick={() => (
						setOpenCondition(false),
						setEdit(false),
						deleteElemCond()
						)} 
						color="primary">
						    Delete
					</Button>}
				    <Button onClick={() => (
				    	setOpenCondition(false),
				    	setEdit(false),
				    	setCondition("")
				    	)} color="primary">
				        Cancel
				    </Button>
				    <Button onClick={() => (
				    	edit && changeCondition(),
				    	!edit && addCondition() ,
				    	setEdit(false),
				    	setOpenCondition(false),
				    	setCondition("")
				    	)}
				      	
				        color="primary">
				            Save
					</Button>
				</DialogActions>
				</Dialog>

				<div class="list-tools">
					{props.module.content.map(p => (
						p.graph.edges.map((elem,index) => (
							<div class="list-tool item conds" onClick={() => (
							setOpenCondition(true),
							setEdit(true),
							setCondition(p),
							setSource(elem.from),
							setTarget(elem.to),
							setValue(elem.label),
							setIndex(index)
							)}>
							{elem.from + '->' + elem.to}
							{elem.label !== "" && ' : ' + elem.label}		
						</div>
						))
						
						))}

				</div>
			</div>
		</div>
	)
}


export default ToolsRight;