import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Modal, Button} from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';
import ExpertLoginPopup from './expert-login-popup';
import {signupExpertSendSignupLink} from '../../actions/auth';
import cookie from 'react-cookie';

const form = reduxForm({
  form: 'email-form'
});

const renderField = ({ input, label, type, className, meta: { touched, error } }) => (
  <div>
      <input {...input} placeholder={label} type={type} className={className} />
      {touched && error && <span className="val-error">{error}</span>}
  </div>
)

/*const email = value =>{
  console.log('value: ',value);
    if (!value) {
      'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      'Invalid email address..'
    } else if( !/.+@stanford\.edu/.test(value) || !/.+@harvard\.edu/.test(value) ){
      'Email should be of @stanford.edu OR @harvard.edu'
    }else{
      undefined
    }
}*/

const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined

class FooterTemplate extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);

    const currentUser = cookie.load('user');
    console.log('currentUser: ',currentUser);
    if(currentUser){
      this.state = {
        show: false
      };
    }else{
      //console.log('route: ',this);
      /*if(this.props.route.path == "expert-signup/:token"){
        console.log('disable popup');*/
        this.state = {
          // show: true
          show: false
        };
      /*}else{
        this.state = {
          show: true
        };
      }*/
    }
  }

  componentDidMount(){
    let path=location.pathname.substring(1,15);
    if(path==='expert-signup/'){
       this.setState({ show: true })
    }
  }

  handleFormSubmit(formProps){
    try{
      this.props.signupExpertSendSignupLink(formProps).then(
        (response)=>{
          console.log('response: ',response);
          if(response.error){
            this.setState({responseTextMsg : "<div class='val-error'>"+response.error+"</div>"});
          }else if(response.message){
            this.setState({responseTextMsg : "<div class='val-success'>"+response.message+"</div>"});
          }
        },
        (err) => err.response.json().then(({errors})=> {
          console.log('errors: ',errors);
          this.setState({responseTextMsg : "<div class='val-error'>"+errors+"</div>"});
        })
      )
    }catch(e){}
  }

  renderLinks() {
    if (this.props.authenticated) {
      return [];
    } else {
      return [];
    }
  }

  handleOnClick(){
    let linksEl = document.querySelector('#nav-collapse');
    linksEl.classList.remove("in");
  }


  handleClose() { this.setState({ show: false }); }
  handleShow() { this.setState({ show: true }); }

  render() {
    const { error, handleSubmit, pristine, reset, submitting ,authenticated} = this.props;

    return (
      <footer className="footer">
        <center>A Donny Dey Production
            {/*<div className="pull-right exprt-lgn-btn" >
           <Link onClick={this.handleOnClick} to="login">{!authenticated && 'Expert Login'}</Link>
         </div>*/}
       </center>
        {/*}<ExpertLoginPopup showStatus={this.state.show} onHide={this.handleClose}/>{*/}
        <Modal
          show={false}
          onHide={this.handleClose}
          dialogClassName="custom-modal text-center"
          bsSize="small">
          <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
            <Modal.Body>
              <h5><p>Everybody is an expert at something.</p>
              <p><b>What's your expertise?</b></p></h5><br/>
              <p><Field
                name="email"
                component={renderField}
                type="email"
                label="Enter email here"
                className="form-control"
                validate={email}
              /></p>
              <div dangerouslySetInnerHTML={{__html: this.state.responseTextMsg}} />
            </Modal.Body>
            <Modal.Footer>
              <div className="pull-left">
                <button type="submit" className="btn btn-primary" disabled={pristine || submitting}>Submit</button>
              </div>
              <div className="pull-right">
                <Button onClick={this.handleClose}>Close</Button>
              </div>
            </Modal.Footer>
          </form>
        </Modal>
      </footer>
    );
  }
}

function mapStateToProps(state) {
  return {
    authenticated: state.auth.authenticated,
  };
}

export default connect(mapStateToProps, {signupExpertSendSignupLink})(form(FooterTemplate));
