import axios from 'axios';
import cookie from 'react-cookie';
import { API_URL, CLIENT_ROOT_URL, errorHandler } from './index';
import { AUTH_USER, AUTH_ERROR, SEND_EXPERT_EMAIL,SEND_EXPERT_TEXT_MESSAGE, CREATE_EXPERT, GET_EXPERT_EMAIL_TOKEN, PROTECTED_TEST } from './types';


// // sendEmail actions
// //= ===============================
// export function sendEmail({ email, message, expertemail}) {
//     return function (dispatch) {
//       var expertemail = "mohit@rvtechnologies.co.in";
//       if(message !== undefined && email !== undefined){
//         return axios.post(`${API_URL}/sendEmailMessageToExpert`, { email, message , expertemail})
//         .then((response) => {
//           return response.data;
//           dispatch({
//             type: SEND_EXPERT_EMAIL,
//             payload: response.data
//           });
//         })
//         .catch((error) => {
//           errorHandler(dispatch, error.response, AUTH_ERROR);
//         });
//       }
//     };
//   }


// const login = async (code) => {
//     return fetch('/api/auth/google', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ code }),
//     }).then((res) => {
//       if (res.ok) {
//         return res.json();
//       } else {
//         return Promise.reject(res);
//       }
//     });
//   };
  
//   export { login };
