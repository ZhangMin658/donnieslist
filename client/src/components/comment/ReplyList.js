// CommentBox.js
import React, { Component } from 'react';
// import 'whatwg-fetch';
import cookie from 'react-cookie';
import axios from 'axios';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { API_URL } from '../../actions/index';

import CommentModal from './CommentModal';
import CommentList from './CommentList';
import CommentNew from './CommentNew';
import $ from 'jquery';

export default class ReplyList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      replies_list: [],
    };
  }
 
  componentDidMount(){
  	console.log(this.props.id);
  	this.getreplies();
  }

  componentWillUnmount(){
  	// this.getreplies();
  }

  testfunction = () =>{
    console.log('------***********i am test function*************------');
  }

  getreplies = () => {
  	var id = this.props.id;
  	axios.post(`${API_URL}/get-replies`, { id })
    .then((res) => {
      if (!res.data.success) {
        this.setState({ error: res.data.error.message || res.data.error });
      } else {
        console.log('replies retrieved---1');
        // console.log(res.data.data);
        this.setState({replies_list:res.data.data});
       	// res.data.data.map(function(it){
       	// 	console.log(it.text);
       	// })
      }
    });
  }

  likeComment = (id) => {
    var id = id;
    var author = cookie.load('user').slug;

    console.log('like function called');
    console.log(id);
    console.log(author);

    axios.post(`${API_URL}/likeComment`, { id, author })
    .then((res) => {
      if (!res.data.success) {
        this.setState({ error: res.data.error.message || res.data.error });
      } else {
        console.log('liked');
        this.getreplies();
      }
    });
  }
  dislikeComment = (id) => {
    var id = id;
    var author = cookie.load('user').slug;
    axios.post(`${API_URL}/dislikeComment`, { id, author })
    .then((res) => {
      if (!res.data.success) {
        this.setState({ error: res.data.error.message || res.data.error });
      } else {
        console.log('disliked');
        this.getreplies();
      }
    });
  }

  addreply = (id) => {
    const author = this.props.author;
    const text  = $('.reply_'+id).val();
    const expert = this.props.expert;


    $('.reply_field').val('');

    if (!text || !expert) return;
    if (!author) {
      this.onModalShow(e, 'need_login');
      return;
    } 

    // console.log(expert);
    // console.log(author);
    // console.log(text);

    // return false;

    const parentId = id;
    axios.post(`${API_URL}/addComment`, { expert:expert.expert, author: author.id, text, parentId, _id: Date.now().toString() })
      .then((res) => {
        if (!res.data.success) {
          this.setState({ error: res.data.error.message || res.data.error });
        } else {
          console.log('---new reply added---');
          this.getreplies();
        }
      });
   }

  render(){
  	return(
  		<div className="reply_list" style={{marginLeft:'30px'}}>
		{this.state.replies_list.map((reply,i)=>{
			return (
				<div>
					<div className="contents">
		              <img src={"/src/public/profile_images/"+reply.users[0].profileImage} height="50px" width="50px"/>
		              <p className="text">{reply.text}</p>
		            </div>

		            <span>{reply.voters.length?reply.voters.length:""}</span>
		            <i className={"fa fa-thumbs-up like " + (reply.like_slugs.includes(this.props.author.id)? 'green': '')} data-likeslug={reply.like_slugs} data-authordslug={this.props.author.id} style={{padding:'0 10px',fontSize:'18px'}} onClick={()=>{this.likeComment(reply._id)}} data-status="no" data-id={reply._id}>
                    </i>

                    <span>{reply.voters_dislikes && reply.voters_dislikes.length?reply.voters_dislikes.length:""}</span>
                    <i className={"fa fa-thumbs-down dislike " + (reply.dislike_slugs.includes(this.props.author.id)? 'red2': '')} onClick={()=>{this.dislikeComment(reply._id)}} data-status="no" data-id={reply._id} style={{padding:'0 10px',fontSize:'18px'}}>
                    </i>
				</div>
			);
		})}
	    <div className="form-group-text">
	      <textarea className={"form-control reply_field reply_"+this.props.id} placeholder="Add a reply.." rows="5"></textarea>
	      <button data-id={this.props.id} onClick={()=>{this.addreply(this.props.id)}}>Add reply</button>
	    </div>
  		</div>
	);
  }

}    

