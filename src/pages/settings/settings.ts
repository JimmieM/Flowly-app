import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController, ToastController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Globals } from '../../app/globals';
import { ProfilePage } from '../profile/profile';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  loggedIn: boolean;
  userId: number;

  showNameInFlow: boolean;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public http: Http,
    public toastCtrl: ToastController,
    public globals: Globals) {

    this.showNameInFlow = localStorage.getItem('showNameInFlow') == 'true' ? true : false;
    this.loggedIn = localStorage.getItem('loggedIn') == 'true' ? true : false;
    this.userId = Number.parseInt(localStorage.getItem('userId'));

    console.log(this.showNameInFlow);
  }

  public _showNameInFlow() {
    // 'user_settings_show_in_flow'[int] SQL - takes 0 or 1 as boolean.
    let update = 0;
    if(this.showNameInFlow) { update = 1; }
    let resp = this.updateDatabase('user_settings_show_in_flow', update);

    if(resp) {
      localStorage.setItem('showNameInFlow', this.showNameInFlow ? "true":"false");
    } else {
      let toast = this.toastCtrl.create({
         message: "Could not update settings at the moment",
         duration: 3000,
         position: 'top'
       });
       toast.present();
    }
  }

  public changeEmail() {
    let prompt = this.alertCtrl.create({
      title: 'Edit email',
      message: "Enter your new email address",
      inputs: [
        {
          name: 'new_email',
          placeholder: 'Your email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            let resp = this.updateDatabase('user_email', data.new_email);

            let toast;
            if(resp) {
              toast = this.toastCtrl.create({
                 message: "Your email has been updated!",
                 duration: 3000,
                 position: 'top'
               });

            } else {
              toast = this.toastCtrl.create({
                 message: "Your email could not be updated!",
                 duration: 3000,
                 position: 'top'
               });
            }
            toast.present();
          }
        }
      ]
    });
    prompt.present();
  }

  public changePassword() {

  }

  private updateDatabase(column, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userId,
      column: column,
      value: value
    };
    console.log(body)
    this.http.post(this.globals._https_uri + 'user/updateSettings', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      return data.success;
    })
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
           this.navCtrl.push(ProfilePage);
         }
       }
     ]
   });
   confirm.present();
  }

  ionViewWillEnter() {

  }

}
