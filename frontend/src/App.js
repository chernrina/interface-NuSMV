
import HomePage from './HomePage.js';
import PersonalPage from './PersonalPage';
import Editor from './Editor.js';


import { BrowserRouter as Router, Route } from 'react-router-dom';



function App() {

    return (
      <div>
      
        <Router>
          <div class="main-app">
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route path="/lk/:username" component={PersonalPage} />
            <Route path="/edit/:username/:projectname" component={Editor} />

          </div>
        </Router>
      </div>
      
    );
  }

export default App;