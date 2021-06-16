import {React, useState} from "react";
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';

const useStyles = makeStyles((theme) => ({
	  root: {
	    '& > *': {
	      margin: theme.spacing(1),
	      width: '20ch'
	    },
	  },
	  btn: {
	    '& > *': {
	      margin: theme.spacing(2),
	      width: '20ch'
	    },
	  },
	}));

function ToolsLeft(props) {

	const [open, setOpen] = useState(false)
	const [openDefine, setOpenDefine] = useState(false)
	const [elem,setElem] = useState({"name":"","type":"boolean","value":""})
	const [name,setName] = useState("")
	const [type,setType] = useState("boolean")
	const [typeArray,setTypeArray] = useState("boolean")
	const [value,setValue] = useState("")
	const [edit,setEdit] = useState(false)
	const [indexes,setIndexes] = useState("")
	const [index,setIndex] = useState("")
	const [initValue,setInitValue] = useState("")

	const classes = useStyles();

	const deleteElem = function() {
		const ind = props.module.var.indexOf(elem)
		props.module.var.splice(ind,1)
		setElem({"name":"","type":"boolean","value":"","indexes":""})
		clear()
	}

	const change = function() {
		const ind = props.module.var.indexOf(elem)
		props.module.var[ind].name = name
		props.module.var[ind].type = type
		props.module.var[ind].value = value
		props.module.var[ind].indexes = indexes
		props.module.var[ind].typeArray = typeArray
		if (initValue !== "")
			if (index != "")
				props.module.var[ind].assign.push('init(' + elem.name + '[' + index + ']) := ' + initValue)
			else
				props.module.var[ind].assign.push('init(' + elem.name + ') := ' + initValue)
		setElem({"name":"","type":"boolean","value":""})
		clear()
	}

	const deleteElemDef = function() {
		const ind = props.module.define.indexOf(elem)
		props.module.define.splice(ind,1)
		setElem({"name":"","type":"boolean","value":""})
		clear()
	}

	const changeDef = function() {
		const ind = props.module.define.indexOf(elem)
		props.module.define[ind].name = name
		props.module.define[ind].value = value
		setName("")
		setValue("")
		setElem({"name":"","type":"boolean","value":""})
		clear()
	}

	const clear = function() {
		setType("boolean")
		setTypeArray("boolean")
		setName("")
		setValue("")
		setInitValue("")
	}


	const addInit = function() {
		const ind = props.module.var.indexOf(elem)
		if (index != "")
			props.module.var[ind].assign.push('init(' + elem.name + '[' + index + ']) := ' + initValue)
		else
			props.module.var[ind].assign.push('init(' + elem.name + ') := ' + initValue)
		setIndex("")
		
	}

	const listInit = function() {
		const ind = props.module.var.indexOf(elem)
		return (<div>
			{ind !== -1 && props.module.var[ind].assign.map(p => (
				<div class="list-tool item">
					{p}
				</div>
				))}
			</div>)
		
	}
	

	return (
		<div>
			<div class="module-name">
				<div class="module-title">
					Module {props.module.name}
				</div> 
				{props.module.name !== "main" && <button class="add-item" onClick={() => (
				    props.delete()
				    )}>
				    -
				</button>}			      		
			</div>

			{props.module.name !== "main" && <div class="list-tools">			      			
				<div class="list-tool item" >
				    <TextField		      			
						label="(input params)"
						defaultValue={props.module.input}
						onChange={(e) => props.module.input=e.target.value}
						type="text"
						fullWidth="true"
						size="small"
					/> 			      						
				</div>
			</div>}

			<div class="module-name">
				<div class="module-title">
				    VAR
				</div> 
				<button class="add-item" onClick={() => (
				    setOpen(true),
				    setElem("")
				    )}>
				    +
				</button>			      		
			</div>

			<Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title" fullWidth="true">
				<DialogContent>
					<DialogTitle id="form-dialog-title">{edit && "Variable change (var) " + elem.name}
					{!edit && "Variable creation(var)"}</DialogTitle>		
						<TextField
							label="Var name"
							type="text"
							defaultValue={elem.name}
							onChange={(e) => setName(e.target.value)}
							fullWidth
						/> 
								        
						<FormControl >
							<InputLabel htmlFor="uncontrolled-native">Type</InputLabel>
							<NativeSelect
								defaultValue={elem.type}
								onChange={(e) => {
								setType(e.target.value)
							}}>
								<option value="boolean">boolean</option>
								<option value="integer">integer</option>
								<option value="array">array</option>
								<option value="process">process</option>
								<option value="state">state</option>
							</NativeSelect>
						</FormControl>
						{type=="array" && <div> <TextField
							label="size"
							type="number"
							defaultValue={elem.indexes}
							onChange={(e) => (
								setIndexes(e.target.value))}
							/>
							<FormControl >
							<InputLabel htmlFor="uncontrolled-native">Type of elems</InputLabel>
							<NativeSelect
								defaultValue={typeArray}
								onChange={(e) => {
								setTypeArray(e.target.value)
							}}>
								<option value="boolean">boolean</option>
								<option value="integer">integer</option>
								<option value="state">state</option>
							</NativeSelect>
						</FormControl> </div>}
						
						<TextField
							label="Value"
							type="text"
							defaultValue={elem.value}
							onChange={(e) => setValue(e.target.value)}
							fullWidth
						/> 
						{type=="array" && 
						<form className={classes.root} > 
							<TextField
								label="Init index"
								type="text"
								onChange={(e) => setIndex(e.target.value)}

							/> 
							<TextField
								label="Init value"
								type="text"
								onChange={(e) => setInitValue(e.target.value)}
							/> 
							<Button onClick={() => (
								addInit()
								
								)}
								color="defualt" className={classes.btn}>
								    Add
							</Button>
						</form>}
						{type!=="array" && type !== "process" && 
						<form className={classes.root} > 
							<TextField
								label="Init value"
								type="text"
								onChange={(e) => setInitValue(e.target.value)}
								
							/> 
							
						</form>}
						{listInit()}
						

						


				</DialogContent>

				<DialogActions>
							    
					{edit && <Button onClick={() => (
						setOpen(false),
						setEdit(false),
						deleteElem()
						)} 
						color="primary">
						    Delete
					</Button>}
						        
					<Button onClick={() => (
				       	setOpen(false),
				       	setEdit(false),
				       	setType(""),
				       	clear(),
				       	setElem("")
				       	)} 
						color="primary">
						    Cancel
					</Button>
						        
					<Button onClick={() => (
						setOpen(false),
						edit && change(),
						  	!edit && initValue !== "" && props.module.var.push({
								"name":name,
						        "type":type,
						        "value":value,
						        "indexes":indexes,
						        "typeArray":typeArray,
						        "assign":['init(' + name + ') := ' + initValue]
						    }),
						    !edit && initValue == "" && props.module.var.push({
								"name":name,
						        "type":type,
						        "value":value,
						        "indexes":indexes,
						        "typeArray":typeArray,
						        "assign":[]
						    }),

						    setEdit(false),
						    setElem(""),
						    clear()
						    )}
						color="primary">
						    Save
					</Button>
				</DialogActions>
			</Dialog> 

			<div class="list-tools">	
				{props.module.var.map(elem => (
				    <div class="list-tool item var" onClick={() => (
				      	setOpen(true),
				      	setName(elem.name),
				      	setType(elem.type),
				      	setValue(elem.value),
				      	setElem(elem),
				      	setEdit(true)
						)}>
				    	{elem.type == "array" && elem.name + ' : array of ' + elem.typeArray + ' size ' + elem.indexes }
				    	{elem.type !== "array" && elem.name + ' : ' + elem.value + ' (' + elem.type + ')'} 					
					</div>
				))}		      			
			</div>

			<div class="module-name">
				<div class="module-title">
				DEFINE
				</div> 
				<button class="add-item"  onClick={() => setOpenDefine(true)}>
					+
				</button>			      		
			</div> 

			<Dialog open={openDefine} onClose={() => setOpenDefine(false)} aria-labelledby="form-dialog-title" fullWidth="true">
			<DialogContent>
				<DialogTitle id="form-dialog-title">{edit && "Variable change (define) " + elem.name}
				{!edit && "Variable creation (define)"}</DialogTitle>		
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
						setOpenDefine(false),
						setEdit(false),
						deleteElemDef()
						)} 
						color="primary">
						    Delete
					</Button>}
			    <Button onClick={() => (
			    	setOpenDefine(false),
			    	setEdit(false),
			    	setName(""),
			    	setValue("")
			    	)} color="primary">
			        Cancel
			    </Button>
			    <Button onClick={() => (
			    	edit && changeDef(),
			    	!edit && props.module.define.push({
								"name":name,
						        "value":value
						    }),
			    	setOpenDefine(false),
			    	setEdit(false)
			    	)}
			      	
			        color="primary">
			            Save
				</Button>
			</DialogActions>
			</Dialog>

			<div class="list-tools">
				{props.module.define.map(elem => (
					<div class="list-tool item def" onClick={() => (
						setEdit(true),
						setOpenDefine(true),
						setElem(elem),
						setName(elem.name),
						setValue(elem.value)
						)}>
						{elem.name + ' := ' + elem.value} 	      						
					</div>
					))}	
			</div>


		</div>
	)
}


export default ToolsLeft;