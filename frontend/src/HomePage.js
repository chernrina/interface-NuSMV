
import './App.css';



function HomePage() {

    return (
      <div> 
	      <header class="main-header">
	      <div class="container">
	        <div class="header-top">
	          <button class="btn-header" > <a href="http://127.0.0.1:8000/person/login">
	          Login 
	          </a> </button>
	        </div>
	      </div>   
	      </header>
	   

	      <section class="main-info">
	      <div class="container">
		      <div class="main-body">
		        <div class="main-title">
			        <p> NuSMV web-interface </p>
		        </div>

		        <div class="button">
		          <button class="btn-start"> <a href="http://127.0.0.1:8000/person/registration">
		           Get started </a> </button>
		        </div>   

		        
		        <div class="logo">
		        </div>
		      </div>
	      </div>
	      </section>    

	      <footer class="main-footer">
	      <hr/>
	      </footer>
      </div>
    );
  
}



export default HomePage;