import {React, useState,useEffect} from "react";
import axios from 'axios';
import AceEditor from "react-ace";
import TabSpec from './TabSpec.js';
import ToolsLeft from './ToolsLeft.js';
import ToolsRight from './ToolsRight.js';
import { Link } from 'react-router-dom';

import StateGraph from './StateGraph.js';

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import clonedeep from 'lodash.clonedeep';


function Editor({ match }) {

	const projectname = match.params.projectname
	const username = match.params.username
	const [userId,setUserId] = useState([])
	const [input_file,setInputFile] = useState([{
		"input_file":"",
		"output_file":""
	}])
	const [change_file,setChangeFile] = useState("")
	const [flag,setFlag] = useState("Saved")
	const [openEdit,setOpenEdit] = useState(false)
	const [openSpec,setOpenSpec] = useState(false)
	const [openResult,setOpenResult] = useState(false)
    const [time,setTime] = useState("")

	const [newModule,setNewModule] = useState(false)
	const [newModuleName,setNewModuleName] = useState("")

	const [loading,setLoading] = useState(false)
	const [index,setIndex] = useState(0)
	const [load,setLoad] = useState(true)
	const [ind,setInd] = useState(0)

	const [examples, setExamples] = useState([])

    const [stepEx,setStepEx] = useState(0)
    const [start,setStart] = useState(false)

    const [instances,setInstances] = useState([])

	const [moduls,setModuls] = useState([{
        "name": "main",
        "open": true,
        "content": [],
        "input": "",
        "var": [],
        "define": [],
        "constants":[],
        "spec": []
    }])


	const change = function(id) {
		
		var div = document.getElementsByClassName("tab-module")
		for (var i = 0; i < div.length; i++) {
			   if (i == id)
			   	div[i].style.background = "#4D7E9A70"
			   else
			   	div[i].style.background = "#4D7E9A00"
			}
	}

    function instancesMain() {
        for (let elem of moduls[0].var) {
            if (elem.type == "process") {
                let find = /(\w+)\((.+)\)/.exec(elem.value) || []
                if (find.length !== 0) {
                    for (var module_ of moduls) {
                        if (module_.name == find[1]) {
                            instances.push({
                                "name":elem.name,
                                "content": clonedeep(module_.content)
                            })    
                        }
                    }
                    let params = find[2].split(',')
                    for (var instance of instances) {
                        if (instance.name == elem.name) {
                            for (var i = 0;i < params.length; i++) {
                                instance.content[i].globalname = params[i].slice()
                            }
                        }
                    }
                }                    
            }
        }
    }

    

	const indProc = function(name) {
		for (var i = 0; i < instances.length; i++) {
            if (instances[i].name == name) 
                return i
		}
		return -1
	}


	function timeFunction() {
        setTimeout(function(){ setLoad(true); }, 100);
    }

    function display(module_,name,value) {
        if (module_ == "main") {
            for (var i = 0; i < instances.length;i++) 
                nodesColor(i,name,value)
        }
        else 
            nodesColor(indProc(module_),name,value)
    }

    function nodesColor(i,name,value) {
        instances[i].content.map(elem => {
            if (elem.globalname == name) {
                elem.graph.nodes.map((o) => {
                    if (o.id == value)
                        o.color = '#FFA07A'
                    else
                        o.color = null
                })
            }
        })
    }

    function clearGraph() {
        for (var instance of instances) {
            instance.content.map(elem => {
                elem.graph.nodes.map(o => {
                    if (o.color !== null)
                        o.color = null
                })
            })
        }
    }

    function clear() {
        setLoad(false)
        setOpenSpec(false)
        setOpenEdit(false)
        setOpenResult(false)   
    }


    function startVis(ind) {
        clear()
        setIndex(0)
        change(1)
        setInd(ind)
        setStart(true)
        setStepEx(0)
        var step = examples[ind].example.state[0]
        stepDisplay(step)
        setLoad(true)
    }

    function clearInputs() {
        var allDiv = document.querySelectorAll('.item-name-process')
        var main = document.querySelector('.main')
        for (var elem of allDiv) {
            elem.style.border = null
        }
        main.style.border = null
    }

    function setInput(input) {
        if (input.inputs.length !== 0) {
            var goal = document.querySelector('.' + input.inputs[0]["value"])
            clearInputs()
            goal.style.border = "thick solid #FFA07A"
        }
    }

    function nextStep(arg) {
        setLoad(false)
        if (arg == -1) {
            var reload = 0
            while (reload < stepEx) {
                var step = examples[ind].example.state[reload]
                stepDisplay(step)
                var input = examples[ind].example.input[reload]
            	setInput(input)
                reload += 1
            }
            if (reload == 1) 
                clearInputs()
            // else {
            //     var input = examples[ind].example.input[reload-1]
            //     setInput(input)
            // }
            setStepEx(stepEx - 1)
        }
        else {
            var step = examples[ind].example.state[stepEx+arg]
            var input = examples[ind].example.input[stepEx+arg]
            setInput(input)
            stepDisplay(step)
        }
        setLoad(true)
    }

    function stepDisplay(step) {
        for (var i = 0; i < step.states.length; i++) {
            if (step.states[i].name.split('.').length == 1) {
                display("main",step.states[i].name,step.states[i].value)
            }
            else 
                display(step.states[i].name.split('.')[0],step.states[i].name.split('.')[1],step.states[i].value)
        }
    }

    function deleteModule() {
        moduls.splice(index, 1)
        clear()
        setLoad(true)
        setIndex(0)
        change(1)
    }

	axios.defaults.xsrfHeaderName = "X-CSRFToken";
	axios.defaults.xsrfCookieName = "csrftoken";


	useEffect(() => {
		axios({
  		method: "GET",
  		url: "http://127.0.0.1:8000/api/project/" + username + "/" + projectname
  		}).then(response => {
  			if (response.data.length == 0) {
			  setInputFile([{
			  	"input_file": "",
			  	"output_file": ""
			  }])
			} else {
				setInputFile(response.data)
                setTime(response.data[0]["last_time"])
                if (response.data[0]["output_file"].length !== 0) {
                    axios({
                        method: "POST",
                        url: "http://127.0.0.1:8000/api/visualization",
                        data: {
                            "data":response.data[0]["output_file"]
                        },
                        headers: {
                            'X-CSRFToken': document.cookie.split('=')[1],
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json',
                        }
                        }).then(response => {
                            setExamples(response.data)
                        })

                }
			}
  		})
	}, [])
	useEffect(() => {
		axios({
  		method: "GET",
  		url: "http://127.0.0.1:8000/api/user/" + username
  		}).then(response => {
  			setUserId(response.data[0])
  		})
	}, [])
	useEffect(() => {
		axios({
  		method: "POST",
  		url: "http://127.0.0.1:8000/api/parse",
  		data: {
			"project": projectname,
			"user": username
		},
		headers: {
			'X-CSRFToken': document.cookie.split('=')[1],
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': 'application/json',
		}
  		}).then(response => {
  			if (response.data.length !== 0) {
  				setModuls(response.data)
                instancesMain()
  			}
  		})
	}, [])


	return (
		<div>
		<header class="main-header">
	      <div class="container">
	        <div class="header-top">
	          <button class="btn-header" href="" > 
	          <Link to={{ pathname: `/lk/${match.params.username}`, fromDashboard:false}}>
	          	Personal page
		      </Link>	          
	          </button>
	        </div>
	      </div>   
	    </header>
	    <div class="body">
	      	<div class="body-side">
	      		<div class="menu">
	      			<div class="button">
			          <button class="btn-menu" href="" onClick={() =>
			          	
			          	axios({
					  		method: "POST",
					  		url: "http://127.0.0.1:8000/api/project/" + match.params.username + "/" + projectname,
					  		data: {
					  			"title": projectname,
					  			"author": userId["id"],
							    "input_file": change_file,
							    "output_file": "",
                                "last_time": ""
							  },
							headers: {
						            'X-CSRFToken': document.cookie.split('=')[1],
						            'X-Requested-With': 'XMLHttpRequest',
						            'Content-Type': 'application/json',
						        }
					  		}).then(function (response) {
							    setFlag("Saved")
							    input_file[0]["input_file"] = change_file
							    axios({
							  		method: "POST",
							  		url: "http://127.0.0.1:8000/api/parse" ,
							  		data: {
							  			"project": projectname,
							  			"user": username
									  },
									headers: {
								            'X-CSRFToken': document.cookie.split('=')[1],
								            'X-Requested-With': 'XMLHttpRequest',
								            'Content-Type': 'application/json',
								        }
							  		}).then(response => {
							  			if (response.data.length !== 0) {
							  				setModuls(response.data)
                                            setInstances([])
							  			}
							  		})
							  })

			          } > Save </button>
			        </div>
			        <div class="button">	      			
		         	 <button class="btn-menu" onClick={() => (
                        setLoading(true),
			          	axios({
					  		method: "POST",
					  		url: "http://127.0.0.1:8000/api/launch",
					  		data: {
					  			"project": projectname,
					  			"user": username
							  },
							headers: {
						            'X-CSRFToken': document.cookie.split('=')[1],
						            'X-Requested-With': 'XMLHttpRequest',
						            'Content-Type': 'application/json',
						        },
					  		
							onDownloadProgress:(progressEvent) => {
								    
								    console.log("lkdfvk")
								}
					  		}).then(response => {
					  			let file = input_file
					  			file[0]["output_file"] = response.data["text"]
					  			setExamples(response.data["structure"])
                                setTime(response.data["time"])
					  			setInputFile(file)
					  			setLoading(false)
                                if (response.data["structure"].length !== 0) {
    					  			clear()
    			      				setOpenResult(true)
    			      				change(moduls.length + 2)
                                }
					  		})
                        )
			          } > Verification </button>			         	 
			        </div>


			        <div class="button">	      			
		         	 <button class="btn-menu" onClick={() =>
			          	setNewModule(true)
			          } > New module </button>			         	 
			        </div>
			        <div class="button">	      			
		         	 <button class="btn-menu" onClick={() =>
			          	
							axios({
								method: "POST",
								url: "http://127.0.0.1:8000/api/generation/" + match.params.username + "/" + projectname,
								data: {
									moduls
								},
								headers: {
									'X-CSRFToken': document.cookie.split('=')[1],
									'X-Requested-With': 'XMLHttpRequest',
									'Content-Type': 'application/json',
								}
								}).then(function (response) {
									input_file[0]["input_file"] = response.data

								  	}
									
								)

						
			          } > Generate code </button>			         	 
			        </div>

			        <Dialog open={newModule} onClose={() => setNewModule(false)} aria-labelledby="form-dialog-title" fullWidth="true">
				    <DialogContent>
				    	<DialogTitle id="form-dialog-title">
                        Set name to the new module
				      	
				      	</DialogTitle>		
				        <TextField
				            id="content-spec"
				            label="Module name"
				            type="text"
				            onChange={(e) => setNewModuleName(e.target.value)}
				            fullWidth
				        />         
				    </DialogContent>

				    <DialogActions>
				        <Button onClick={() => setNewModule(false)} color="primary">
				            Cancel
				        </Button>
				        <Button onClick={() => (
				        	setNewModule(false),
				        	moduls.forEach(element => element.open = false),
				          	moduls.push({
				          		"name":newModuleName,
				          		"open":true,
				          		"content": [],
								"input": "",
								"var": [],
								"define": [],
								"constants":[]
				           		})
				          	)}
				          	

				          	
				            color="primary">
				                Save
					    </Button>
					</DialogActions>
		        </Dialog>


	      		</div>

	      		<div class="project-title">
		      		Project: {projectname}
		      	</div>


		      	

		      	<div class="module">
		      		{!openEdit && !openResult && !openSpec && <ToolsLeft module={moduls[index]} 
                        delete={() => deleteModule()}/>}

		      	</div>

	      	</div>



	      	<div class="body-center">

	      			<div className="tab">
                        {start && <div class="steps">
                            <button class="arrow left" onClick={() => (
                                stepEx !== 0 && nextStep(-1)
                                )}/> 
                            <button class="arrow right" onClick={() => (
                                stepEx < examples[ind].example.state.length-1 && (
                                setStepEx(stepEx + 1), 
                                nextStep(1))
                                )}/> 
                         </div>} 
	      				<button class="tab-module" onClick={() => (
	      					moduls.forEach(element => element.open = false),
	      					clear(),
                            setOpenSpec(true),
                            change(0)
		      				)}>
			      				Specification
						</button>
	      				{moduls.map((p,index) => (
				      		<button class="tab-module" onClick={() => (
		      					moduls.forEach(element => element.open = false),
		      					clear(),
		      					setIndex(index),
		      					setLoad(true),
		      					change(index+1)
		      				)}>
			      				{p.name}
							</button>
				      		))}
				      	<button class="tab-module" onClick={(e) => (
	      					moduls.forEach(element => element.open = false),
	      					clear(),
                            setOpenEdit(true),
		      				change(moduls.length + 1)
		      				)}>
			      				Source file
						</button>
						{examples.length !== 0 && <button class="tab-module" onClick={(e) => (
	      					moduls.forEach(element => element.open = false),
	      					clear(),
		      				setOpenResult(true),
		      				change(moduls.length + 2)
		      				)}>
			      				Result
						</button>}

					</div>
					{load && index !== 0 && <div class="items"> {moduls[index].content.map(g => (
								g.graph.edges.length !== 0 && 
				      			<div class="item-state"> 
				      			<div class="item-name"> {g.name} </div>
				      			<StateGraph graph={g.graph}/>
				      			</div>
				      		))}
				      		</div>}

				    {load && index == 0 && <div class="items main"> {moduls[index].var.map(gvar => (
								gvar.type == "process" && <div class="process">
                                <div class={"item-name-process " + gvar.name}> {gvar.name} </div>
				      			<div class="item-process"> 
                                    {instances.length == 0 && instancesMain()}
				      				{instances.length != 0 && instances[indProc(gvar.name)].content.map(g => (
										g.graph.edges.length !== 0 && 
						      			<div class="item-state"> 
						      			<div class="item-name"> {g.name} </div>
						      			<StateGraph graph={g.graph}/>
						      			</div>
						      		))}	
				      			
				      			</div> <hr/> </div> 
				      		))}
				      		</div>}

					

	      			{openEdit && input_file.map(p => (
	      				<div class="editors">
	      				<AceEditor
			      			height="100%"
			      			width="100%"
			      			defaultValue={p["input_file"]}
			      			onChange={(v,e) => {
			      				setChangeFile(v)
			      				setFlag("Not Saved")
			      			}}
						    mode="java"
						    theme="github"
						    name="UNIQUE_ID_OF_DIV"
						    editorProps={{ $blockScrolling: true }}
						/>
						</div>		
		      		))}

					{openSpec && <TabSpec spec={moduls[0]["spec"]} result={openResult} structure={examples} /> } 
					{openResult && <TabSpec spec={moduls[0]["spec"]} result={openResult} structure={examples} 
                    f={(ind)=>startVis(ind)} time={time}/> } 
                    

		    </div>



	      	<div class="body-side">

	      		{!openEdit && !openSpec && !openResult && <div> <ToolsRight module={moduls[index]}/> <div class="button">
			          <button class="btn-project change" href="" onClick={() => (
			          	setLoad(false),
			          	timeFunction()
			          	)} > Show changes </button>
			        </div> </div>}

                
                {!openEdit && !openSpec && start && index == 0 && <div class="counter-steps">
                 Step {stepEx}/{examples[ind].example.state.length-1} <br/>
                 {examples[ind].example.input.map(p => (
                    p.loop == 1 && <div> Loop starts at step: {p.step} </div>
                 ))}
                  <div class="button">
                      <button class="btn-project change" href="" onClick={() => (
                        setStart(false),
                        clearGraph(),
                        clearInputs()
                        )} > Close counter-example </button>
                    </div> </div>}
	      		
		    </div>
		  
		</div>

		<footer class="main-footer">
        
        {loading && <div> Verification started </div>}
        
		<hr/>
		Status : {flag}
		<hr/>
		{input_file.map(p => (
			p["output_file"]
			))}
		<hr/>
		{loading.toString()}
		<hr/>
		<button onClick={()=>console.log(moduls)} >
		check
		</button>
	    </footer>

		</div>
	);
}

export default Editor;
