import React, {useState, useEffect } from 'react';
import './App.css';
import axios from "axios";
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function PersonalPage({match}) {

	const [newProject,setNewProject] = useState(false)
	const [projects,setProjects] = useState([])
	const [nameProject, setNameProject] = useState("")
	const username = match.params.username

	useEffect(() => {
		axios({
  		method: "GET",
  		url: "http://127.0.0.1:8000/api/project/" + username
  		}).then(response => {
  			setProjects(response.data)
  		})
	}, [])


	return (
		<div>
	 	  
	      <header class="main-header">
	      <div class="container">
	        <div class="header-top">
	        	<button class="btn-header" onClick={() => window.location.reload()} > 
	          <Link to={{ pathname: `/logout/`, fromDashboard:false}} >
	          	Logout
		      </Link>	          
	          </button>
	        </div>
	      </div>   
	      </header>
	      <div class="body">
	      	<div class="body-side">
		      	<div class='user-photo'>
		      	</div>

		      	<div class="user-name">
		      	{username}
		      	</div>
	      	</div>
	      	<div class="body-center">
	      		<div class="projects-area">
	      			{projects.map(p => (	
	      				<Link to={{ pathname: `/edit/${username}/${p.title}`, fromDashboard:false}}>     					      		
			      		<div class="project" key={p.id}>
			      			<div class="project-name">
			      			{p.title}
			      			</div>
			      		</div>
			      		</Link>
		      		))}
	      	
	      		</div>
			</div>	      

	      	<div class="body-side">
	      		<div class="button">
		          <button class="btn-project" href="" onClick={() => setNewProject(true)}> 
		          Create project 
		          </button>
		        </div>
	      	</div>

	      	<Dialog open={newProject} onClose={() => setNewProject(false)} aria-labelledby="form-dialog-title" fullWidth="true">
		          
		          <DialogContent>
		            <DialogTitle id="form-dialog-title">Project creation</DialogTitle>
			        <TextField
			            id="name-project"
			            label="Name project"
			            type="text"
			            onChange={(e) => setNameProject(e.target.value)}
			            fullWidth="true"
			        />         
		          </DialogContent>

		          <DialogActions>
			          <Button onClick={() => setNewProject(false)} color="primary">
			            Cancel
			          </Button>
			          <Button onClick={() => setNewProject(false)} color="primary">
			          <Link to={{ pathname: `/edit/${username}/${nameProject}`, fromDashboard:false}}>
			            Create
			          </Link>
			          </Button>
		          </DialogActions>
		        </Dialog> 

	      </div>


	      <footer class="main-footer">
	      <hr/>
      	  </footer>
	      
	      </div>
	)

}



export default PersonalPage;