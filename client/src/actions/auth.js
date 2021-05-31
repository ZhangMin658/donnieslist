import axios from 'axios';
import { browserHistory } from 'react-router';
import cookie from 'react-cookie';
import { API_URL, CLIENT_ROOT_URL, MESSAGE_INCORRECT_USERNAME_PASSWORD, errorHandler } from './index';
import { AUTH_USER, AUTH_ERROR, UNAUTH_USER, FORGOT_PASSWORD_REQUEST, RESET_PASSWORD_REQUEST, PROTECTED_TEST, EXPERT_SIGNUP_LINK_REQUEST } from './types';

//= ===============================
// Authentication actions
//= ===============================

//login using native auth
export function loginUser({ email, password }) {
  return function (dispatch) {
    if(email !== undefined && password !== undefined){
      return axios.post(`${API_URL}/auth/login`, { email, password })
      .then(
        (response) => {
          if(response && response.data.errorMessage && response.data.errorMessage!=null && response.data.errorMessage!=undefined && response.data.errorMessage!=""){
            return response.data
          }
          else{
            cookie.save('token', response.data.token, { path: '/' });
            cookie.save('user', response.data.user, { path: '/' });
            window.location.href = `${CLIENT_ROOT_URL}/profile`;
            dispatch({ type: AUTH_USER });
            return response
          }
      },
      (error) => {
        return({errorMessage:MESSAGE_INCORRECT_USERNAME_PASSWORD})
      });
    }else{
      return "empty_parameters";
    }
  };
}

export function facebookLoginUser(response) {
  return function (dispatch) {
    return axios.post(`${API_URL}/auth/login-facebook-user`, {response})
    .then((response) => {
      cookie.save('token', response.data.token, { path: '/' });
      cookie.save('user', response.data.user, { path: '/' });
      window.location.href = `${CLIENT_ROOT_URL}/profile`;
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

export function registerUser({ email, firstName, lastName, password,expertSubCategories }) {

  return function (dispatch) {
    return axios.post(`${API_URL}/auth/register`, { email, firstName, lastName, password,expertSubCategories })
    .then((response) => {
      if(response.data.success==true){
        cookie.save('token', response.data.token, { path: '/' });
        cookie.save('user', response.data.user, { path: '/' });
      }
      return response
    },
    (err)=>{
      //alert("cons")
      console.log(err)
    }

    )
  };
}

export function logoutUser(error) {
  return function (dispatch) {
    const userId = cookie.load('user');
    var user_id = userId._id;
    axios.get(`${API_URL}/auth/logout/${user_id}`);
    dispatch({ type: UNAUTH_USER, payload: error || '' });
    cookie.remove('token', { path: '/' });
    cookie.remove('user', { path: '/' });
    cookie.remove('token', { path: '/' });

    window.location.href = `${CLIENT_ROOT_URL}/login`;
  };
}

export function getForgotPasswordToken({ email }) {
  return function (dispatch) {
    axios.post(`${API_URL}/auth/forgot-password`, { email })
    .then((response) => {
      console.log('second controller forgot password');
      console.log(response);
      alert('A Reset password link has been set to your email account!');
      dispatch({ type: FORGOT_PASSWORD_REQUEST,  payload: response.data.message  });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

export function resetPassword(token, { password }) {

  console.log('resetPassword controller---');

  return function (dispatch) {
    console.log('helloo---------------------------------');
    axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
    .then((response) => {
      dispatch({
        type: RESET_PASSWORD_REQUEST,
        payload: response.data.message,
      });
      // Redirect to login page on successful password reset
      browserHistory.push('/login');
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

export function protectedTest() {
  return function (dispatch) {
    axios.get(`${API_URL}/protected`, {
      headers: { Authorization: cookie.load('token') },
    })
    .then((response) => {
      dispatch({
        type: PROTECTED_TEST,
        payload: response.data.content,
      });
    })
    .catch((error) => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    });
  };
}

//= ===============================
// signupExpertSendSignupLink actions
//= ===============================
export function signupExpertSendSignupLink({ email }) {
  return function (dispatch) {
    var expertemail = "ermohit400@yahoo.com";
    if(email !== undefined){
      return axios.post(`${API_URL}/auth/signupExpertSendSignupLink`, { email , expertemail})
      .then((response) => {
        return response.data;
        dispatch({
          type: EXPERT_SIGNUP_LINK_REQUEST,
          payload: response.data
        });
      })
      .catch((error) => {
        errorHandler(dispatch, error.response, AUTH_ERROR);
      });
    }
  };
}