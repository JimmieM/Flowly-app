import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { ToastController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { App } from 'ionic-angular';
import { Content } from 'ionic-angular';
import { ChatPage } from '../chat/chat';
import { PostPage } from '../post/post';
import { SettingsPage } from '../settings/settings';
import { ActionSheetController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { UserInformation } from '../../app/user_information';

import { Globals } from '../../app/globals';

import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  myContacts;
  awaitingContacts;
  requesteeContacts;

  postActivity;
  commentActivity;

  finishedLoading: boolean = false;


  activityBySegement: string = 'posts'; // defines the segement value


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public globals: Globals,
    public userInformation: UserInformation) {

      this.myContacts = [];
      this.awaitingContacts = [];
      this.requesteeContacts = [];

      this.postActivity = [];
      this.commentActivity = [];
  }

  public activitySegment() {

  }

  public interactRequest(user_id, username) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Answer request from ' + username,
      buttons: [
        {
          text: 'Accept request',
          handler: () => {
            this.sendInteractionRequest(user_id, 1);
          }
        },{
          text: 'Decline request',
          handler: () => {
            console.log('Archive clicked');
            this.sendInteractionRequest(user_id, 0);
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    actionSheet.present();
  }

  private sendInteractionRequest(contact_user_id, answer) {
    let toast;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let body = {
      username: this.userInformation._username,
      user_id: this.userInformation._user_id,
      contact_user_id: contact_user_id,
      answer: answer
    };

    this.http.post(this.globals._https_uri + 'user/answercontact', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
      if(data.success) {
        let answer_string = 'declined';
        if(answer === 1) {answer_string = 'accepted'}
        toast = this.toastCtrl.create({
          message: "Request has been " + answer_string,
          duration: 3000,
          position: 'top'
        });
        this.getContacts();
      } else {
        toast = this.toastCtrl.create({
          message: 'Could not answer on request. Try again later.',
          duration: 3000,
          position: 'top'
        });

      }
      toast.present();
    })
  }

  public goToSettings() {
    this.navCtrl.push(SettingsPage);
  }

  public logout() {
    let confirm = this.alertCtrl.create({
     title: 'Are you sure to logout?',
     message:'',
     buttons: [
       {
         text: 'Cancel',
         handler: () => {}
       },
       {
         text: 'Logout',
         handler: () => {
           localStorage.removeItem('loggedIn');
           localStorage.removeItem('username');
           localStorage.removeItem('userId');
           this.myContacts = [];
           this.updateProfileView(false,'');
         }
       }
     ]
   });
   confirm.present();
  }

  public goToLoginPage() {
    this.navCtrl.push(LoginPage);
  }

  public viewFlow(post_id) {
    this.navCtrl.push(PostPage, {
      'post_data': {
        'post_id': post_id
      }
    })
  }

  public updateProfileView(refresh, refresher) {
    if(this.userInformation._logged_in) {

      this.getContacts();
      this.getActivity();
  
    }
    this.finishedLoading = true;

    if(refresh) {
      setTimeout(() => {
        refresher.complete();
      }, 2000);
    }
  }

  public getActivity() {
    if(this.userInformation._logged_in) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      let body = {
        user_id: this.userInformation._user_id
      };

      this.http.post(this.globals._https_uri + 'user/getUserActivity', JSON.stringify(body), {headers:headers})
      .map(res => res.json())
      .subscribe(data => {
        console.log("Data")
        console.log(data);
        if(data.success) {
          this.commentActivity = data.comment_activity;
          this.postActivity = data.post_activity;
        }
      })
    }
  }

  public getContacts() {

    if(this.userInformation._logged_in) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      let body = {
        user_id: this.userInformation._user_id
      };

      console.log(body)

      this.http.post(this.globals._https_uri + 'chat/getchats', JSON.stringify(body), {headers:headers})
      .map(res => res.json())
      .subscribe(data => {
        console.log(data)
        if(data.success) {
          this.myContacts = data.contacts;
          this.awaitingContacts = data.contacts_awaiting;
          this.requesteeContacts = data.contacts_requests;
        } else {
          console.log("Couldnt find contacts")
        }
      })
    }

  }

  public openChat(user_id, username) {
    this.navCtrl.push(ChatPage, {
      user_id: user_id,
      username: username
    });
  }

  ionViewDidEnter() {

  }

  ionViewDidLoad() {
    this.userInformation.refresh();

    this.myContacts = [];
    this.awaitingContacts = [];
    this.requesteeContacts = [];

    this.updateProfileView(false, '');

  }

}
