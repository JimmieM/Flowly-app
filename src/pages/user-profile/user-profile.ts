import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { ToastController, AlertController } from 'ionic-angular';

import { ProfilePage } from '../profile/profile';

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
    private alertCtrl: AlertController,
    private globals: Globals,
    private http: Http,
    private toastCtrl: ToastController) {
  }

  ionViewDidEnter() {
    this.profile_id = this.navParams.get('user_id');
    this.profile_username = this.navParams.get('username');

    this.loadProfile();
  }

  public removeContactAlert() {
    let confirm = this.alertCtrl.create({
      title: 'Remove ' + this.profile_username + ' as a contact?',
      message: 'This action can not be reverted',
      buttons: [
        {
          text: "I'm sure",
          handler: () => {
            this.removeContact();
          }
        },
        {
          text: "Cancel",
          handler: () => {}
        }
      ]
      });
      confirm.present();
  }

  private removeContact() {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id,
      contact_user_id: this.profile_id
    };

    this.http.post(this.globals._https_uri + 'contacts/removecontact', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      this.loading = false;
      console.log(data)
      let toast
      if(data.success) {
          toast = this.toastCtrl.create({
           message: this.profile_username + ' has been deleted from your contacts',
           duration: 3000,
           position: 'top',
           showCloseButton: true
         });

         this.navCtrl.push(ProfilePage);

      } else {
         toast = this.toastCtrl.create({
           message: this.profile_username + ' could not be removed, try again later.',
           duration: 3000,
           position: 'top',
           showCloseButton: true
         });
      }
      toast.present();
    })
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
