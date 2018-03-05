import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { PostPage } from '../post/post';
import { NewPostPage } from '../new-post/new-post';
import { LoginPage } from '../login/login';

import { UserInformation } from  '../../app/user_information';

import { HttpClientModule } from '@angular/common/http';

import { ToastController } from 'ionic-angular';
import { Globals } from '../../app/globals';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';


@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  loginPage;
  emptyNotifications: boolean = false;

  notifications;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public toastCtrl: ToastController,
    public globals: Globals,
    public userInformation: UserInformation)
  {
    this.loginPage = LoginPage;
  }

  ionViewDidEnter() {
    this.userInformation.refresh();
  }

  ionViewDidLoad() {
    this.userInformation.refresh();

    this.notifications = [];

    if(this.userInformation._logged_in) {
      this.getNotifications();
    }
  }

  public openPost(post_id, notification_id) {
    for(let i = 0; i < this.notifications.length; i++) {
      if((this.notifications[i].notification_seen === 0)
      &&
      (this.notifications[i].notification_id === notification_id)) {
        this.notifications[i].notification_seen = 1;
        break;
      }
    }
    this.navCtrl.push(PostPage, {
      'post_data': {
        'post_id': post_id
      }
    });
  }

  public updateNotifications(refresher) {
    this.getNotifications();
    this.userInformation.refresh();

    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

  public getNotifications() {

    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id
    };

    this.http.post(this.globals._https_uri + 'user/notifications/GetNotifications', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
      if(data.success) {
        this.emptyNotifications = false;
        this.notifications = data.notification_response;
      } else {
        this.emptyNotifications = true;
        if(data.error) {
          let toast = this.toastCtrl.create({
             message: 'Failed to load notifications',
             duration: 3000,
             position: 'top'
           });
           toast.present();
        }
      }
    })
  }

}
