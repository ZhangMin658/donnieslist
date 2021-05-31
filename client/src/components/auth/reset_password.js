import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { resetPassword } from '../../actions/auth';

import $ from 'jquery';

import axios from 'axios';
import { API_URL, CLIENT_ROOT_URL, Image_URL, errorHandler, tokBoxApikey, stripeKey } from '../../actions/index';

const form = reduxForm({
  form: 'resetPassword'
});

const renderField = field => (
  <div>
    <input className="form-control" {...field.input} />
    {field.touched && field.error && <div className="error">{field.error}</div>}
  </div>
);

class ResetPassword extends Component {
  static contextTypes = {
    router: PropTypes.object,
  }
  
  componentWillMount() {
    $('.footer').hide();
    console.log('here am i..-');

    if (this.props.authenticated) {
      this.context.router.push('/dashboard');
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.authenticated) {
      this.context.router.push('/dashboard');
    }
  }

  handleFormSubmit({ password }) {

  
    var password = $('#password').val();
    var confirm_password = $('#confirm_password').val();
    if(password!=confirm_password){
      return alert('Confirm password does not match!');
    }

    const resetToken = this.props.params.resetToken;
    console.log('submitted password change');
    console.log(resetToken);
    console.log(password);
    // alert('Password changed successfully!');
    // this.props.resetPassword(resetToken,password); //this was being used earlier

    // for now
      var request_array = {
        password : password,
        resetToken: resetToken
      }

      axios.post(`${API_URL}/auth/change-password`,request_array,{
       ///headers: { Authorization: cookie.load('token') },
       })
     .then((response) => {
       console.log(response);
       if(!response.data.success){
          console.log('here----1');
       }
      
       if(response.data.success){
          alert(response.data.message);
          $('#password').val("");
          $('#confirm_password').val("");
          console.log('here----2');
       }
     }).catch((error) => {
       console.log(error);
     });

    // for now

  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          <strong>Oops!</strong> {this.props.errorMessage}
        </div>
      );
    } else if (this.props.message) {
      return (
        <div className="alert alert-success">
          <strong>Success!</strong> {this.props.message}
        </div>
      );
    }
  }

  render() {
    const { handleSubmit } = this.props;

    return (

      <div>



        <form id="reset_form" onSubmit={handleSubmit(this.handleFormSubmit.bind(this))} className="col-md-6 col-md-offset-3" style={{marginTop:'80px',float:'none',marginBottom:'250px'}}>
          {/*<fieldset className="form-group">
            <label>New Password:</label>
            <Field name="password" id="password" component={renderField} type="password" />
          </fieldset>
          <fieldset className="form-group">
            <label>Confirm New Password:</label>
            <Field name="passwordConfirm" id="confirm_password" component={renderField} type="password" />
            
          </fieldset>*/}

          <div className="form-group">
            <label>New Password:</label>
            <input className="form-control" name="password" id="password" component={renderField} type="password"/>
          </div>

          <div className="form-group">
            <label>Confirm New Password:</label>
            <input className="form-control" name="passwordConfirm" id="confirm_password" component={renderField} type="password"/>
          </div>

          {this.renderAlert()}
          <button action="submit" className="btn btn-primary">Change Password</button>
        </form>
      </div> 
    );
  }
}

function mapStateToProps(state) {
  return { errorMessage: state.auth.error, message: state.auth.resetMessage };
}

export default connect(mapStateToProps, { resetPassword })(form(ResetPassword));
