import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { registerUser, facebookLoginUser } from '../../actions/auth';
import { API_URL, CLIENT_ROOT_URL, errorHandler } from '../../actions/index';
import FacebookLogin from 'react-facebook-login';
import cookie from 'react-cookie';

var Recaptcha = require('react-recaptcha');

const form = reduxForm({
  form: 'register'
});

const renderField = field => (
  <div>
    {field.type && field.type=="password" &&  <input type="password" className="form-control" {...field.input} />}
    {field.type && field.type!="password" &&  <input type="text" className="form-control" {...field.input} />}

    {field.touched && field.error && <div className="error">{field.error}</div>}
  </div>
);

// specifying your onload callback function
var callback = function () {
  console.log('Done!!!!');
};

class Register extends Component {
  constructor(props, context) {
    super(props, context);

    $(document).ready(function(){
      console.log('test');
    });

    this.state = {
        recaptcha_value: '',
    };

  }

  responseFacebook(response) {
    if(response != undefined && response != ""){
      this.props.facebookLoginUser(response);
    }
  }

  // specifying verify callback function
  verifyCallback = function (response) {
    console.log('verifyCallback '+response);
    $('#hiddenRecaptcha').val(response);
    var recaptcha_value = response;
    this.setState({
        recaptcha_value
    });
  };

  componentDidMount(){

    $(document).ready(function(){

      /*$.validator.addMethod("confirmpassword", function(value) {
        alert(document.getElementByName('password').val());
        return false;

      }, 'Please enter "buga"!');*/

      // register form Validation
      jQuery("#signup_form").validate({
          rules: {

             firstName: {
                 required: false
             },
            
             lastName: {
                 required: false
             },

              hiddenRecaptcha: {
                  required: false,
              },
              email: {
                  required: true,
                  email:true,
              },
              // password: {
              //     required: true,
              //     minlength: 8
              // },

              //cfmPassword: "confirmpassword",

              confirm_joining:{
                  required: false,
              },
              confirm_age:{
                  required: false,
              }
           },
           messages: {
             firstName:{
               required: "Please enter this field",
             },
             lastName:{
               required: "Please enter this field",
             },
             username: {
                  remote: "Sorry, our system has detected that an account with this username already exists!"
              },
              email: {
                  required: "Please enter this field",
                  remote: "Sorry, our system has detected that an account with this email address already exists!"
              },

              // password:{
              //   required: "Please enter this field",
              // },

              cfmPassword: {
                  equalTo: "Password and Confirm Password must be same!"
              }
             /* hiddenRecaptcha:{
                  required: "Please enter recaptcha",
              }*/
           },
           // submitHandler: function(form) {
           //    form.submit();
           // }
      });
    });
  }

  handleFormSubmit(formProps) {
    var regx = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? "])[a-zA-Z0-9!#$%&?]{8,20}$/;
    console.log(regx.test(formProps.password));
    if(!regx.test(formProps.password)){
      $('#password_error').css('display','block');
      return false;
    }else{
      $('#password_error').css('display','none');
    }
    
    if($('#signup_form').valid()){
        this.props.registerUser(formProps).then(
          (res)=>{
            if(res.data.error && res.data.error!=null && res.data.error!=undefined && res.data.error!=""){
              this.setState({errorMessage:res.data.error})
            }
            if(res.data.success && res.data.success==true){

              console.log('------------------------------------------------');
              
              //this.setState({successMessage:"Successfully Created Account. You Will be redirected to profile in 4 seconds."})
              setTimeout(function(){
                cookie.save('token', res.data.token, { path: '/' });
                cookie.save('user', res.data.user, { path: '/' });
               
                window.location.href = `${CLIENT_ROOT_URL}/user-expert`;


                var path = window.location.pathname;
                var url = window.location.href;
                var final_url = url.split(path); 
                
                final_url = final_url[0];
    
                final_url = final_url+'/expert/new_category/'+formProps.email.split('@')[0];


                // window.location.href = `${CLIENT_ROOT_URL}/user-expert`;
                window.location.href = final_url;
              
              },1000)
            }
          }
      );
    }
  }

  // renderAlert() {
  //   if (this.props.errorMessage) {
  //     return (
  //       <div>
  //         <span><strong>Error!</strong> {this.props.errorMessage}</span>
  //       </div>
  //     );
  //   }
  // }
  handleFacebookClick() {
    window.open(`${API_URL}/auth/facebook`, 'sharer', 'toolbar=0,top=50,status=0,width=748,height=525');
  }
  
  render() {
    const { handleSubmit } = this.props;

    return (
    <div className="container" style={{minHeight:'480px'}}>
      <div className="col-sm-6 col-sm-offset-3">
        <div className="page-title text-center"><h2>Create account</h2></div>
        <p className="text-center">Create account to start a session.</p>
        <form id="signup_form" onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
          {this.state.errorMessage && this.state.errorMessage!=null && this.state.errorMessage!=undefined && this.state.errorMessage!="" &&
            <div className="alert alert-danger">{this.state.errorMessage}</div>
          }
          {this.state.successMessage && this.state.successMessage!=null && this.state.successMessage!=undefined && this.state.successMessage!="" &&
            <div className="alert alert-success">{this.state.successMessage}</div>
          }
          <div className="row form-group">
            <div className="col-md-12">
              <label>Email</label>
              <Field name="email" className="form-control" required component={renderField} type="text" />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-12">
              <label>Password</label>
              <Field name="password" type="password" className="form-control" required component={renderField} />
              <span id="password_error" style={{color:'red',display:'none'}}>Password must be 8 characters long containing at least one upper, one lower case letter and a number.</span>
            </div>
          </div>

          {/*<div className="row form-group">
            <div className="col-md-12">
              <label>Password</label>
              <Field name="cfmPassword" 
              type="password" 
              className="form-control" 
              required component={renderField}  />
            </div>
          </div>*/}

          <div className="form-group text-center g-recaptcha-wrapper">
          </div>

          <div className="form-group text-center">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>

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

export default connect(mapStateToProps, { registerUser, facebookLoginUser })(form(Register));
