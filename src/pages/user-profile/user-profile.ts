import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { ToastController } from 'ionic-angular';

import { UserInformation } from '../../app/user_information';
import { Globals } from '../../app/globals';

import 'rxjs/add/operator/map';
/*
Dynamic page for viewing a user based on navParams User_id.
*/

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {

  profile_username:string; // the user you're viewing:
  profile_id: number;

  profile = [];

  loading: boolean = true; // show loading..∏


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userInformation: UserInformation,
    private globals: Globals,
    private http: Http,
    private toastCtrl: ToastController) {
  }

  ionViewDidEnter() {
    this.profile_id = this.navParams.get('user_id');
    this.profile_username = this.navParams.get('username');

    this.loadProfile();
  }

  public removeContact() {

  }

  public metInPost() {

  }

  public loadProfile() {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id,
      profile_user_id: this.profile_id
    };

    this.http.post(this.globals._https_uri + 'user/ViewUserProfile', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      this.loading = false;
      console.log(data)
      if(data.success) {
        this.profile = data.profile;
      } else {
        let toast = this.toastCtrl.create({
           message: "Failed to load profile",
           duration: 3000,
           position: 'top',
           showCloseButton: true
         });
         toast.present();
      }
    })
  }

}
