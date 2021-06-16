import {React, useState} from "react";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';



function TabSpec(props) {

	const [openItemSpec, setOpenItemSpec] = useState(false)
	const [type,setType] = useState("CTLSPEC")
	const [newSpec,setNewSpec] = useState("")
	const [elem,setElem] = useState("")
	const [edit,setEdit] = useState(false)

	const deleteElem = function() {
		const ind = props.spec.indexOf(elem)
		props.spec.splice(ind,1)
		setElem("")
	}

	const change = function() {
		const ind = props.spec.indexOf(elem)
		props.spec[ind].type = type
		props.spec[ind].content = newSpec
		setElem("")
	}

	


	return (
		<div>
			<div class="list-spec">
		      	{!props.result && <button class="list-spec add-spec" onClick={() => (
		      		setOpenItemSpec(true),
		      		setType("CTLSPEC"),
		      		setNewSpec("")
		      		)}>
		      		+
		      	</button>}
		      	
		      	<Dialog open={openItemSpec} onClose={() => (
		      		setOpenItemSpec(false),
		      		setEdit(false))} aria-labelledby="form-dialog-title" fullWidth="true">
				    <DialogContent>
				      	<FormControl >
				        <InputLabel htmlFor="uncontrolled-native">Type</InputLabel>
				        <NativeSelect
				        	defaultValue={type}
				            onChange={(e) => {
				          	setType(e.target.value)
				        }}
				        >
				            <option value="CTLSPEC">CTLSPEC</option>
				            <option value="LTLSPEC">LTLSPEC</option>
				            <option value="INVARSPEC">INVARSPEC</option>
				            <option value="PSLSPEC">PSLSPEC</option>
				        </NativeSelect>
				        </FormControl>
				
				        <TextField
				            id="content-spec"
				            label="Specification"
				            type="text"
				            defaultValue={newSpec}
				            onChange={(e) => setNewSpec(e.target.value)}
				            fullWidth
				        />         
				    </DialogContent>



				    <DialogActions>

				   		{edit && <Button onClick={() => (
				          	setOpenItemSpec(false),
				          	deleteElem()
				          	)} 
				            color="primary">
				                Delete
					    </Button>}

				        <Button onClick={() => (setOpenItemSpec(false),setEdit(false))} color="primary">
				            Cancel
				        </Button>
				        <Button onClick={() => (
				          	setOpenItemSpec(false),
				          	elem !== "" && change(),
		      				setEdit(false),
				          	elem == "" && props.spec.push({
				          		"type":type,
				          		"content":newSpec
				           		})
				          	)} 
				            color="primary">
				                Save
					    </Button>
					    
					</DialogActions>
		        </Dialog> 
		      	
		      	{!props.result && props.spec.map(p => (
		      		<div>
		      		<div class="list-spec item" onClick={() => (
		      			setType(p.type),
		      			setNewSpec(p.content),
		      			setElem(p),
		      			setEdit(true),
		      			setOpenItemSpec(true))
		      			} >
						<div class="type-spec">
		      				{p.type}
		      			</div>
		      			
		      			<div class="spec">
		      				{p.content} 
		      			</div>

		      		</div>
		      		</div>
	      		))}
	      		{props.result && <div class="time"> Last result at {props.time} </div>}
	      		{props.result && props.structure.map((p,index) => (
		      		<div>
		      		<div class="list-spec item"  >
		      			
		      			<div class="spec">
		      				{p.spec} 
		      			</div>


		      			<button class={"spec-result " + p.res} onClick={() => {
		      				p.res=="false" && props.f(index)}
		      			} >
		      			</button>
		      		</div>
		      		</div>
	      		))}	
			</div>
		</div>
	)
}


export default TabSpec;