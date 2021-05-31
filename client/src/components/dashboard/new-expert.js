import React, { Component } from 'react';
import { Link, IndexLink, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import axios from 'axios';
import cookie from 'react-cookie';
import { Modal, Button, Panel } from 'react-bootstrap';
import $ from 'jquery';
import StripeCheckout from 'react-stripe-checkout';
import Carousel from 'react-image-carousel';
import SidebarMenuAdmin from './sidebar-admin';
import { API_URL, CLIENT_ROOT_URL, Image_URL, errorHandler, tokBoxApikey, stripeKey } from '../../actions/index';

import { registerUser, facebookLoginUser } from '../../actions/auth';

import { Field, reduxForm } from 'redux-form';

var Recaptcha = require('react-recaptcha');

const form = reduxForm({
  form: 'register'
});


class NewExpert extends Component{

	constructor(props){
		super(props)
		this.state={
			email : "",
			password: ""
		}
	}

	componentDidMount(){
		
	}

	componentWillMount(){
		axios.get(`${API_URL}/getExpertsCategoryList`)
	    .then(res => {
	        this.setState({categories:res.data})
	        console.log('categories data----');
	        console.log(res.data);
	        res.data.map(key=>{
	            if(key.name==='Music Lessons'){
	              this.setState({musicCategories:key})
	            }
	        })
	      }
	    )
	}

	getSubcategories=(event)=>{
		console.log(event.target.value);
		axios.get(`${API_URL}/getExpertsSubCategoryList/`+event.target.value)
	      .then(res => {
	        this.setState({subcategories:res.data['0'].subcategory})
	      }
	    )
	}

	createExpert = () => {
		
		// const email = this.state.email;
		// const password = this.state.password;
		// const firstName = email.split('@')[0];
		// const lastName = "";
		// const expertSubCategories = "new_category";

		var formProps = {
			email : this.state.email,
			password: this.state.password
		}

	    this.props.registerUser(formProps).then(
          (res)=>{
            if(res.data.error && res.data.error!=null && res.data.error!=undefined && res.data.error!=""){
              this.setState({errorMessage:res.data.error})
            }
            if(res.data.success && res.data.success==true){

              console.log('------------------------------------------------');
              alert('Expert created Successfully!');
              setTimeout(function(){
                cookie.save('token', res.data.token, { path: '/' });
                cookie.save('user', res.data.user, { path: '/' });
               
             	localStorage.setItem('show_message',true);
             	if(localStorage.getItem('show_message')==true){
             		$('#message').css('display','block');
             		setTimeout(
					    function() {
		             		$('#message').css('display','none');
			             	localStorage.setItem('show_message',false);
					    }
					    .bind(this),
					    3000
					);
             	}
             	location.reload();
              
              },1000)
            }
          }
      );


	    return axios.post(`${API_URL}/auth/register`, { email, firstName, lastName, password,expertSubCategories })
	    .then((response) => {
	      if(response.data.success==true){
	        cookie.save('token', response.data.token, { path: '/' });
	        cookie.save('user', response.data.user, { path: '/' });
	      }
	      return response
	    },
	    (err)=>{
	      console.log(err)
	    }

	    )


	}

	adminMenu() {
	    return (
	      <SidebarMenuAdmin/>
	    );
	}

	breadcrumb(){
	    return(
	      <ol className="breadcrumb">
	        <li className="breadcrumb-item"><IndexLink to="/">Home</IndexLink></li>
	        <li className="breadcrumb-item">Create Expert</li>
	      </ol>
	    );
	}

	render(){
		return(
			<div className="session-page">

			<p style={{margin:'1% 5%',color:'green',fontSize: '20px',display:"none"}} id="message">Expert Created Successfully!</p>

		    <div className="container">
		      <div className="row">
		         {this.breadcrumb()}
		         <div className="wrapper-sidebar-page">
		            <div className="row row-offcanvas row-offcanvas-left">
		               {this.adminMenu()}
		               <div className="column col-sm-9 col-xs-11" id="main">
		                  <div id="pageTitle">
		                     <div>
		                        <div className="profile-detail">
		                        	
		                            <div className="form-group">
		                            	<input type="text" onChange={(e)=>{
		                            		this.setState({
		                            			email: e.target.value
		                            		})
		                            	}} placeholder="email" className="form-control" required/>
		                            </div>
		                            <div className="form-group">
		                            	<input type="password" onChange={(e)=>{
		                            		this.setState({
		                            			password : e.target.value
		                            		})
		                            	}} placeholder="password" className="form-control" required/>
		                            </div>
		                            <div className="form-group">
		                            	<button style={{color:"white"}} onClick={()=>{this.createExpert()}}>Create Expert</button>
		                            </div>
		                          
		                        </div>
		                     </div>
		                  </div>
		               </div>
		            </div>
		         </div>
		      </div>
		   </div>
		</div>
		);
	}
}

function mapStateToProps(state) {
  return {
    errorMessage: state.auth.error,
    message: state.auth.message,
    authenticated: state.auth.authenticated,
  };
}

export default connect(mapStateToProps, { registerUser, facebookLoginUser })(form(NewExpert));