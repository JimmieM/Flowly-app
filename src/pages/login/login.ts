import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';

import { HomePage } from '../home/home';
import { App } from 'ionic-angular';
import { Content } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { UserInformation } from '../../app/user_information';

import { Globals } from '../../app/globals';
import { SignupPage } from '../signup/signup';
import { ProfilePage } from '../profile/profile';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  password:string;
  username:string;


  disableBtn: boolean;

  constructor(public navCtrl: NavController,
    public http: Http,
    public toastCtrl: ToastController,
    public globals: Globals,
    public userInformation: UserInformation)
  {
    this.disableBtn = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');

    this.userInformation.refresh();

    if(this.userInformation._logged_in) {
      this.navCtrl.pop();
    }
  }

  public goToSignup() {
    this.navCtrl.push(SignupPage);
  }

  public signIn() {
    this.disableBtn = true;
    let headers = new Headers();
    let toast;

    headers.append('Content-Type', 'application/json');
    let body = {
      username: this.username,
      password: this.password
    };

    this.http.post(this.globals._https_uri + 'user/login', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      this.disableBtn = false;
      console.log(data);
      if(data.success) {
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', this.username);

          localStorage.setItem('userId', data.message);

           toast = this.toastCtrl.create({
             message: 'Welcome back, ' + this.username,
             duration: 3000,
             position: 'top'
           });
           toast.present();

          this.navCtrl.push(ProfilePage);
      } else {
        toast = this.toastCtrl.create({
          message: 'Incorrect password or username',
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    })
  }

}
