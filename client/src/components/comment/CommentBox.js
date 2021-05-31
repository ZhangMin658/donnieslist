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
import ReplyList from './ReplyList';
import $ from 'jquery';

class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      error: null,
      author: '',
      showButton: false,
      showModal: null,
      comments :[],
      replies :[],
      mydata:['1','22','333']
    };
    this.pollInterval = null;
    this.onModalClose = this.onModalClose.bind(this);
  }

  componentDidMount() {

    this.loadCommentsFromServer();
    
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadCommentsFromServer, 60000);
    }
    const currentUser = cookie.load('user');
    if (currentUser) {
      this.setState({
        author: {
          id: currentUser.slug,
          name: currentUser.firstName + ' ' + currentUser.lastName,
          /* role: currentUser.role */
          role: 'Expert',
        },
      });
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;

    $(document).on('click','.reply',function(){
      $(this).toggleClass("reply_show");
    })
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
        this.loadCommentsFromServer();
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
        this.loadCommentsFromServer();
      }
    });
  }

  // addreply = (id) => {
  //   const { author } = this.state;
  //   const text  = $('.reply_'+id).val();
  //   const { expert } = this.props;

  //   if (!text || !expert) return;
  //   if (!author) {
  //     this.onModalShow(e, 'need_login');
  //     return;
  //   } 

  //   // return false;

  //   const parentId = id;
  //   axios.post(`${API_URL}/addComment`, { expert, author: author.id, text, parentId, _id: Date.now().toString() })
  //     .then((res) => {
  //       if (!res.data.success) {
  //         this.setState({ error: res.data.error.message || res.data.error });
  //       } else {
  //         console.log('---new reply added---');
          
  //         this.loadCommentsFromServer();
  //         // this.getReplies();
          
  //       }
  //     });
  // }

  // getReplies = (id) => {
  //   axios.post(`${API_URL}/get-replies`, { id })
  //   .then((res) => {
  //     if (!res.data.success) {
  //       this.setState({ error: res.data.error.message || res.data.error });
  //     } else {
  //       console.log('replies retrieved');
  //       console.log(res.data.data);
  //       this.setState({replies:res.data.data});
  //     }
  //   });
  // }

  onChangeText = (e) => {
    this.setState({
      text: e.target.value,
    });
  }

  onModalShow = (e, value) => {
    this.setState({
      showModal: value,
    });
  }

  onModalLogin = (e) => {
    this.setState({
      showModal: null,
    });
    this.redirectToLogin(e);
  }

  onModalClose = () => {
    this.setState({
      showModal: null,
    });
  }

  onShowButton = (e, value) => {
    this.setState({
      showButton: value,
      text: '',
    });
  }

  onSubmitComment = (e) => {
    e.preventDefault();
    const { author, text } = this.state;
    const { expert } = this.props;

    if (!text || !expert) return;

    if (!author) {
      this.onModalShow(e, 'need_login');
      return;
    } 
    // else if (author.role !== 'Expert') {
    //   this.onModalShow(e, 'need_expert');
    //   return;
    // }

    console.log(expert);
    console.log(author);
    console.log(text);
    // return false;


    const parentId = '-1';
    axios.post(`${API_URL}/addComment`, { expert, author: author.id, text, parentId, _id: Date.now().toString() })
      .then((res) => {
        if (!res.data.success) {
          this.setState({ error: res.data.error.message || res.data.error });
        } else {
          console.log('---new comment added---');
          
          this.loadCommentsFromServer();
          this.onShowButton(e, false);
        }
      });
  }
  loadCommentsFromServer = () => {
    console.log('----now get comments----');
    let slug = this.props.expert;

    console.log(slug);

    axios.get(`${ API_URL }/getComments/${ slug }`)
      .then(res => {
        console.log('here 11--');
        console.log('res--');
        console.log(res);
        console.log('res.data--');
        console.log(res.data);
        console.log('res.data.data--');
        console.log(res.data.data);
        if (!res.data.success) {
          console.log('here 22--');
          this.setState({ error: res.data.error });
        } else {
          console.log('here 33--');
          this.setState({ data: res.data.data });
          this.setState({ comments: res.data.data });
          
          // this.child.testfunction();
          console.log('------------testing data--------------');
          console.log(res.data.data);
          console.log('------------testing data--------------');

        }
    })
  }

  redirectToLogin(e) {
    if(e.target) {
      e.preventDefault()
    }
    browserHistory.push('/login');
  }

  onModalClose() {
    this.setState({
      showModal: false
    })
  }

  render() {
    return (
      <div className="comment_inner_wrap">
        <h3>
        {
          this.state.data && this.state.data.length > 1 ?
            this.state.data.length + ' Comments' :
            ( this.state.data.length == 1 ?
                this.state.data.length + ' Comment' :
                'No Comment' )
        }
        </h3>



        <div className="form">
          <CommentNew
            id = "-1"
            text = { this.state.text }
            commentId = { this.state.commentId }
            showButton = { this.state.showButton }
            handleShowButton = { this.onShowButton }
            handleChangeText={ this.onChangeText }
            handleSubmitComment={ this.onSubmitComment }
          />
        </div>


        {/*<div>
        {this.state.data && this.state.data.map((comments, i)=>{
            return <div><span key={i}> {comments.text}</span><p>{comments.author}</p></div>;
        })}
        </div>*/}
        
        <div className="comment list">
            {this.state.data && this.state.data.map((comments, i)=>{
              
            return <div className="comments_list"><img src={"/src/public/profile_images/"+comments.users[0].profileImage} 
            height="50px" width="50px"/><a href={"/expert/"+comments.users[0].expertCategories[0]+"/"+comments.users[0].slug} 
            style={{cursor:'pointer'}}>{comments.users[0].profile.firstName+" "+comments.users[0].profile.lastName}</a><p>{comments.text}</p>

              <div className="like_section list"><span>{comments.voters.length?comments.voters.length:""}</span>
                
                <i className={"fa fa-thumbs-up like " + (comments.like_slugs.includes(this.state.author.id)? 'green': '')} onClick={()=>{this.likeComment(comments._id)}} style={{padding:'0 10px',fontSize:'18px'}} data-status="no" data-id={comments._id}>
                </i>

                <span>{comments.voters_dislikes && comments.voters_dislikes.length?comments.voters_dislikes.length:""}</span>
                <i className={"fa fa-thumbs-down dislike " + (comments.dislike_slugs.includes(this.state.author.id)? 'red2': '')} onClick={()=>{this.dislikeComment(comments._id)}} data-status="no" data-id={comments._id} style={{padding:'0 10px',fontSize:'18px'}}>
                </i>
                
                <label className="reply">Reply</label>

                  <div className="reply_wrap">
                    <div className="contents" style={{display:'none'}}>
                      <img src={"/src/public/profile_images/"+comments.users[0].profileImage} height="50px" width="50px"/>
                      <p className="text"></p>
                    </div>

                    <i className={"fa fa-thumbs-up like " + (comments.like_slugs.includes(this.state.author.id)? 'green': '')} data-likeslug={comments.like_slugs} data-authordslug={this.state.author.id} style={{padding:'0 10px',fontSize:'18px',display:'none'}} data-status="no" data-id={comments._id}>
                    </i>

                    <span style={{display:'none'}}>{comments.voters_dislikes && comments.voters_dislikes.length?comments.voters_dislikes.length:""}</span>
                    <i className={"fa fa-thumbs-down dislike " + (comments.dislike_slugs.includes(this.state.author.id)? 'red2': '')} data-status="no" data-id={comments._id} style={{padding:'0 10px',fontSize:'18px',display:'none'}}>
                    </i>


                    <ReplyList id={comments._id} author={this.state.author} expert={this.props} ref={(cd) => this.child = cd}/>

                    <div className="form-group-text" style={{display:'none'}}>
                      <textarea className={"form-control reply_"+comments._id} placeholder="Type Something...." rows="5"></textarea>
                      <button data-id={comments._id} onClick={()=>{this.addreply(comments._id)}}>Comment</button>
                    </div>
                  </div>


              </div>

            </div>;
           })}
        </div>

         {
        this.state.data && this.state.data.length > 1 ?
        <div className="comment">
          <CommentList
            data={ this.state.data }
            author = { this.state.author }
            expert = { this.props.expert }
            handleShowModal = { this.onModalShow }
            handleLoadComments = { this.loadCommentsFromServer }
          />
        </div>
        :
        '' 
        }
        { this.state.error && <p>{ this.state.error }</p> }
        {
          this.state.showModal == 'need_login' ? (
            <CommentModal
              title = "Please log in..."
              text = "You need to login to submit or reply to comment."
              showModal = { this.state.showModal }
              handleModalClose = { this.onModalClose }
              handleModalLogin = { this.onModalLogin }
            />
          ) : (
            this.state.showModal == 'need_expert' ? (
              <CommentModal
                title = "Sorry..."
                text = "Only expert can submit or reply to comment."
                showModal = { this.state.showModal }
                handleModalClose = { this.onModalClose }
              />
            ) : null
          )
        }

      </div>
    );
  }
}

CommentBox.propTypes = {
  expert: PropTypes.string.isRequired
}

export default CommentBox;
