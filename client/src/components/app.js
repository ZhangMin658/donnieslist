import React, { Component } from 'react';
import HeaderTemplate from './template/header';
import FooterTemplate from './template/footer';

import cookie from 'react-cookie';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Login from './auth/login';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    	current_user: cookie.load('user')
    }
  }

  componentDidMount() {
    this.checkLoginStatus()
  }

  checkLoginStatus = () => {
    const current_user = cookie.load('user');

    if(current_user==undefined){
    	<Route path="login" component={Login} />
    }
  }	


  render() {
{/*
  	if (this.state.current_user!=undefined) {
      return (
        <Router  >
          
              <Redirect to="profile"/>

            
        </Router>
      );
    } else {
      return (
        <Router basename="/">
          <React.Suspense>
            <Switch>
              
              <Route exact path="/"/>} />
              
              <Redirect to="/"/>
            </Switch>
          </React.Suspense>
        </Router>
      )
    }

*/}
    return (
      <div>
        <HeaderTemplate logo="Donnie's List" />
          {this.props.children}
        <FooterTemplate />
      </div>
    );



  }
}

export default App;
