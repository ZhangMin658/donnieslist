import React, { Component } from 'react';
import cookie from 'react-cookie';
import { connect } from 'react-redux';
import { fetchUser ,API_URL, Image_URL, } from '../../../actions/index';
import { Link, IndexLink, browserHistory } from 'react-router';

import { uploadImage } from '../../../actions/index'

import UserInfo from './user-info';

var Dropzone = require('react-dropzone');

class ViewProfile extends Component {

    constructor(props) {


    super(props);

    this.state = {
      firstName:"",
      lastName:"",
      expertEmail:"",
      onlineStatus:"",
      expert:"",
      loading: false,
      university:'',
      RelatedImages1:[],
      successMessage:"",
      errorMessage:"",
      role:'',
      resume_path:'',
      Image_other_UrlContain:false
    }
    this.onDrop = this.onDrop.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }



  componentWillMount() {
    // Fetch user data prior to component mounting
    const userId = cookie.load('user');
    var role = userId.role

    this.props.fetchUser(userId._id).then(
        (response)=>{
          const pattern = new RegExp('^(https?:\/\/)?'+
              '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+
              '((\d{1,3}\.){3}\d{1,3}))');

              if(pattern.test(response.data.user.profileImage)) {
                this.setState({Image_other_UrlContain:true})
               }
            const expert = response.data.user;
            this.setState({firstName : response.data.user.firstName });
            this.setState({lastName : response.data.user.lastName });
            this.setState({expertEmail : response.data.user.email });
            this.setState({onlineStatus : response.data.user.onlineStatus });
            this.setState({profileImage : response.data.user.profileImage });
            this.setState({role:role})
            this.setState({university:response.data.user.university})
            this.setState({resume_path:response.data.user.resume_path})
            this.setState({
              expert,
              loading: false,
              error: null

            })
        },
        (error)=>{

        }
      )
  }

    onDrop(acceptedFiles) {
      this.setState({
        RelatedImages1: acceptedFiles
      });
    }




    uploadImage(){
          const {expertEmail, RelatedImages1} = this.state

          var formData = new FormData();
          var data = this.state;
          Object.keys(data).forEach(( key ) => {
            if(key === 'RelatedImages1'){
              formData.append(key, data[key][0]);
            }
            else{
              if(key ==='expertEmail' ){
                formData.append(key, data[ key ]);
              }

            }
          });


           return fetch(`${API_URL}/user/update/profile`, {
            method: 'POST',
            body: formData,
          }).then(
            (response)=>{
                var j = response.json()
                return j
            },
            (err)=>{
              console.log("ERR")
            }
          ).then(
            (res)=>{
              if(res && res!=null && res!=undefined && res.SuccessMessage && res.SuccessMessage!=null && res.SuccessMessage!=undefined && res.SuccessMessage!=""){
                  this.setState({successMessage:res.SuccessMessage, RelatedImages1:""})


                const userId = cookie.load('user');
                this.props.fetchUser(userId._id).then(
                    (response)=>{
                         const expert = response.data.user;
                        this.setState({profileImage:response.data.user.profileImage})
                    },
                    (error)=>{

                    }
                  )
              }
              else if(res && res!=null && res!=undefined && res.errorMessage){
                this.setState({errorMessage:res.errorMessage})

              }
            }
          )
          // this.props.uploadImage({email:this.state.expertEmail, RelatedImages1:this.state.RelatedImages1})
    }

  render() {

  const renderLoading=(
    <img className="loader-center" src="/src/public/img/ajax-loader.gif"/>
  )


  const renderPosts=(
        <div id="view-experts" className="view-experts" style={{minHeight:'480px'}}>
            <div className="container">
               <div className="row">
                   <ol className="breadcrumb">
                     <li className="breadcrumb-item"><IndexLink to="/">Home</IndexLink></li>
                     <li className="breadcrumb-item">Profile</li>

                   </ol>
               </div>
            </div>

      <div className="expert-list-wrap">
        <div className="container">
           <div className="row">
              <div className="expert-list-inner-wrap">
                 <div className="col-sm-12">
                    <div className="expert-detail-wrap">
                       <div className="row">

                          <div className="col-md-3 col-sm-4">


                            {this.state.Image_other_UrlContain && this.state.profileImage && this.state.profileImage!=null && this.state.profileImage!=undefined && this.state.profileImage!=""?
                             <div className="expert-img" id="1">
                                <img src={"/src/public/profile_images/"+this.state.profileImage}/>
                                <i data-toggle="title" title="Online" className="user-online fa fa-circle" aria-hidden="true"></i>
                             </div>:""
                            }




                            {!this.state.Image_other_UrlContain && this.state.profileImage && this.state.profileImage!=null && this.state.profileImage!=undefined && this.state.profileImage!=""?
                             <div className="expert-img" id="2">
                                <img src={"/src/public/profile_images/"+this.state.profileImage}/>
                                <i data-toggle="title" title="Online" className="user-online fa fa-circle" aria-hidden="true"></i>
                             </div>:""
                            }




                             {this.state.profileImage==null || this.state.profileImage==undefined || this.state.profileImage==""?
                              <div className="expert-img" id="3">
                               <img src="/src/public/img/profile.png"/>
                               <i data-toggle="title" title="Online" className="user-online fa fa-circle" aria-hidden="true"></i>
                            </div>:""}
                           </div>


                            <div className="col-md-9 col-sm-8">
                               <div className="profile-detail">
                                  <div className="name">
                                     <dl className="dl-horizontal">
                                        {this.state.successMessage && this.state.successMessage!="" && <div className="alert alert-success">{this.state.successMessage} </div> }
                                        {this.state.errorMessage && this.state.errorMessage!="" && <div className="alert alert-danger">{this.state.errorMessage} </div> }
                                        
                                        { 
                                          this.state.firstName!='undefined' && this.state.firstName!='' && this.state.firstName!=null
                                          ?
                                          <div className="profile-bor-detail">
                                             <dt>Name</dt>
                                             <dd>
                                             <div className="text-left-detail">{this.state.firstName} {this.state.lastName}</div>
                                             {this.state.role && this.state.role=="Expert" && <div style={{'float':'right','text-transform':'capitalize'}} className="text-right label label-primary"><i className="fa fa-bars" aria-hidden="true"></i> {this.state.expert.expertCategories}</div> }
                                             </dd>
                                          </div>
                                          :
                                          <div className="profile-bor-detail inactive_div">
                                             <dt>Name</dt>
                                             <dd>
                                             <div className="text-left-detail">{this.state.firstName} {this.state.lastName}</div>
                                             {this.state.role && this.state.role=="Expert" && <div style={{'float':'right','text-transform':'capitalize'}} className="text-right label label-primary"><i className="fa fa-bars" aria-hidden="true"></i> {this.state.expert.expertCategories}</div> }
                                             </dd>
                                          </div>
                                        }  
                                        
                                        { 
                                          this.state.role && this.state.role=="Expert" && this.state.expert.expertCategories!='undefined' && this.state.expert.expertCategories!='' && this.state.expert.expertCategories!=null
                                          ?
                                          <div className="profile-bor-detail">
                                             <dt>Area of expertise</dt>
                                             <dd>{this.state.expert.expertCategories}</dd>
                                          </div>
                                          :
                                          <div className="profile-bor-detail inactive_div">
                                             <dt>Area of expertise</dt>
                                             <dd>{this.state.expert.expertCategories}</dd>
                                          </div>
                                        }  

                                        { 
                                          this.state.role && this.state.role=="Expert" && this.state.expert.yearsexpertise!='undefined' && this.state.expert.yearsexpertise!='' && this.state.expert.yearsexpertise!=null
                                          ?
                                           <div className="profile-bor-detail">
                                             <dt>Years of expertise</dt>
                                             <dd>{this.state.expert.yearsexpertise}</dd>
                                          </div>
                                          :
                                           <div className="profile-bor-detail inactive_div">
                                             <dt>Years of expertise</dt>
                                             <dd>{this.state.expert.yearsexpertise}</dd>
                                          </div>
                                        }  
                                       
                                         
                                        { 
                                          this.state.role && this.state.role=="Expert" && this.state.expert.expertFocusExpertise!='undefined' && this.state.expert.expertFocusExpertise!='' && this.state.expert.expertFocusExpertise!=null
                                          ?
                                          <div className="profile-bor-detail">
                                             <dt>Focus of expertise</dt>
                                             <dd>{this.state.expert.expertFocusExpertise}</dd>
                                          </div>
                                          :
                                          <div className="profile-bor-detail inactive_div">
                                             <dt>Focus of expertise</dt>
                                             <dd>{this.state.expert.expertFocusExpertise}</dd>
                                          </div>
                                        }  

                                       
                                          
                                        

                                        {/*this.state.role && this.state.role=="Expert" &&
                                          <div className="profile-bor-detail">
                                             <dt>Rates</dt>
                                             <dd>{this.state.expert.expertRates}</dd>
                                          </div>
                                        */}

                                        
                                         { 
                                          this.state.role && this.state.role=="Expert" && this.state.expert.expertRating!='undefined' && this.state.expert.expertRating!='' && this.state.expert.expertRating!=null
                                          ?
                                          <div className="profile-bor-detail">
                                           <dt>Rating</dt>
                                           <dd>{this.state.expert.expertRating} <i className="fa fa-star" aria-hidden="true"></i></dd>
                                          </div>
                                          :
                                          <div className="profile-bor-detail inactive_div">
                                           <dt>Rating</dt>
                                           <dd>{this.state.expert.expertRating} <i className="fa fa-star" aria-hidden="true"></i></dd>
                                          </div>
                                         } 
                                          
                                       
                                      {this.state.role && (this.state.role=="Admin" || this.state.role=="User") &&
                                        <div>
                                        <div className="profile-bor-detail">
                                            <dt>About</dt>
                                            <dd>{this.state.expert.userBio && this.state.expert.userBio!=null && this.state.expert.userBio!=undefined && this.state.expert.userBio!="" ? this.state.expert.userBio: "-"}</dd>
                                        </div>
                                        <div className="profile-bor-detail">
                                            <dt>Country </dt>
                                            <dd>{this.state.expert.locationCountry && this.state.expert.locationCountry!=null && this.state.expert.locationCountry!=undefined && this.state.expert.locationCountry!="" ? this.state.expert.locationCountry :"-"}</dd>
                                        </div>
                                        <div className="profile-bor-detail">
                                            <dt>State </dt>
                                            <dd>{this.state.expert.locationState && this.state.expert.locationState!=null && this.state.expert.locationState!=undefined && this.state.expert.locationState!="" ? this.state.expert.locationState : "-"}</dd>
                                        </div>
                                        <div className="profile-bor-detail">
                                            <dt>City </dt>
                                            <dd>{this.state.expert.locationCity && this.state.expert.locationCity!=null && this.state.expert.locationCity!=undefined && this.state.expert.locationCity!="" ? this.state.expert.locationCity : "-"}</dd>
                                        </div>
                                      </div>
                                      }




                                        {(this.state.expert.facebookURL=='undefined' && this.state.expert.facebookURL=='' && this.state.expert.facebookURL==null) || (this.state.expert.twitterURL=='undefined' && this.state.expert.twitterURL=='' && this.state.expert.twitterURL==null) || (this.state.expert.linkedinURL=='undefined' && this.state.expert.linkedinURL=='' && this.state.expert.linkedinURL==null) || 
                                        (this.state.expert.instagramURL=='undefined' && this.state.expert.instagramURL=='' && this.state.expert.instagramURL==null) || (this.state.expert.snapchatURL=='undefined' && this.state.expert.snapchatURL=='' && this.state.expert.snapchatURL==null) || (this.state.expert.websiteURL=='undefined' && this.state.expert.websiteURL=='' && this.state.expert.websiteURL==null) ||
                                        (this.state.expert.googleURL=='undefined' && this.state.expert.googleURL=='' && this.state.expert.googleURL==null) || (this.state.expert.youtubeURL=='undefined' && this.state.expert.youtubeURL=='' && this.state.expert.youtubeURL==null) || (this.state.expert.soundcloudURL=='undefined' && this.state.expert.soundcloudURL=='' && this.state.expert.soundcloudURL==null) ||
                                        (this.state.expert.facebookURL=='undefined' && this.state.expert.facebookURL=='' && this.state.expert.facebookURL==null) && this.state.role == "Expert" && <div className="profile-bor-detail expert-social-links">
                                                <dt>Social link </dt>
                                                <dd>
                                                  {this.state.expert.facebookURL && this.state.expert.facebookURL!=null && this.state.expert.facebookURL!=undefined && this.state.expert.facebookURL!="" && <a target="_blank" href={ this.state.expert.facebookURL ? this.state.expert.facebookURL : '#'} title="facebook"><i className="fa fa-facebook-official" aria-hidden="true"></i></a>}
                                                  {this.state.expert.twitterURL && this.state.expert.twitterURL!=null && this.state.expert.twitterURL!=undefined && this.state.expert.twitterURL!="" &&<a target="_blank" href={ this.state.expert.twitterURL ? this.state.expert.twitterURL : '#'} title="twitter"><i className="fa fa-twitter" aria-hidden="true"></i></a>}
                                                  {this.state.expert.linkedinURL && this.state.expert.linkedinURL!=null && this.state.expert.linkedinURL!=undefined && this.state.expert.linkedinURL!="" &&<a target="_blank" href={ this.state.expert.linkedinURL ? this.state.expert.linkedinURL : '#'} title="linkedin"><i className="fa fa-linkedin" aria-hidden="true"></i></a>}
                                                  {this.state.expert.instagramURL && this.state.expert.instagramURL!=null && this.state.expert.instagramURL!=undefined && this.state.expert.instagramURL!="" && <a target="_blank" href={ this.state.expert.instagramURL ? this.state.expert.instagramURL : '#'} title="instagram"><i className="fa fa-instagram" aria-hidden="true"></i></a>}
                                                  {this.state.expert.snapchatURL && this.state.expert.snapchatURL!=null && this.state.expert.snapchatURL!=undefined && this.state.expert.snapchatURL!="" &&<a target="_blank" href={ this.state.expert.snapchatURL ? this.state.expert.snapchatURL : '#'} title="snapchat"><i className="fa fa-snapchat" aria-hidden="true"></i></a>}
                                                  {this.state.expert.websiteURL && this.state.expert.websiteURL!=null && this.state.expert.websiteURL!=undefined && this.state.expert.websiteURL!="" &&<a target="_blank" href={ this.state.expert.websiteURL ? this.state.expert.websiteURL : '#'} title="website"><i className="fa fa-anchor" aria-hidden="true"></i></a>}
                                                  {this.state.expert.googleURL && this.state.expert.googleURL!=null && this.state.expert.googleURL!=undefined && this.state.expert.googleURL!="" &&<a target="_blank" href={ this.state.expert.googleURL ? this.state.expert.googleURL : '#'} title="google"><i className="fa fa-google" aria-hidden="true"></i></a>}
                                                  {this.state.expert.soundcloudURL && this.state.expert.soundcloudURL!=null && this.state.expert.soundcloudURL!=undefined && this.state.expert.soundcloudURL!="" &&<a target="_blank" href={ this.state.expert.soundcloudURL ? this.state.expert.soundcloudURL : '#'} title="soundcloud"><i className="fa fa-soundcloud" aria-hidden="true"></i></a>}
                                                  {this.state.expert.youtubeURL && this.state.expert.youtubeURL!=null && this.state.expert.youtubeURL!=undefined && this.state.expert.youtubeURL!="" &&<a target="_blank" href={ this.state.expert.youtubeURL ? this.state.expert.youtubeURL : '#'} title="youtube"><i className="fa fa-youtube" aria-hidden="true"></i></a>}
                                                  {this.state.expert.facebookURL=="" && this.state.expert.twitterURL=="" && this.state.expert.linkedinURL=="" && this.state.expert.instagramURL=="" && this.state.expert.snapchatURL==""&& this.state.expert.websiteURL==""&& this.state.expert.googleUrl=="" && "No Links Added yet"}

                                                </dd>
                                            </div>
                                          }

                                          { 
                                            this.state.role && this.state.role=="Expert" && this.state.university!='undefined' && this.state.university!='' && this.state.university!=null
                                            ?
                                            <div className="profile-bor-detail">
                                             <dt>University</dt>
                                             <dd>{this.state.university}</dd>
                                            </div>
                                            :
                                             <div className="profile-bor-detail inactive_div">
                                             <dt>University</dt>
                                             <dd>{this.state.university}</dd>
                                            </div>
                                          }  

                                          { 
                                            this.state.role && this.state.role=="Expert" && this.state.resume_path!='undefined' && this.state.resume_path!='' && this.state.resume_path!=null
                                            ?
                                            <div className="profile-bor-detail">
                                             <dt>Download Resume</dt>
                                             <dd> <a href={`${Image_URL}`+this.state.resume_path} title="Download" download className="fa fa-file-pdf-o"></a></dd>
                                            </div>
                                            :
                                            <div className="profile-bor-detail inactive_div">
                                             <dt>Download Resume</dt>
                                             <dd> <a href={`${Image_URL}`+this.state.resume_path} title="Download" download className="fa fa-file-pdf-o"></a></dd>
                                            </div>
                                          }  

                                     </dl>
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








        </div>
  )

    return (
      <div>
        {/*<UserInfo profile={this.props.profile.email} />*/}
         <div>{this.state.loading ?renderLoading: renderPosts}
      </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profile: state.user.profile,
  };
}

export default connect(mapStateToProps, { fetchUser, uploadImage })(ViewProfile);
