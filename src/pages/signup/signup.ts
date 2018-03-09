import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { PostPage } from '../post/post';
import { NewPostPage } from '../new-post/new-post';
import { HttpClientModule } from '@angular/common/http';

import { Geolocation } from '@ionic-native/geolocation';
import { ToastController } from 'ionic-angular';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { ProfilePage } from '../profile/profile';
import { TermsPage } from '../terms/terms';

import { Globals } from '../../app/globals'

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  username:string = '';
  email: string = '';
  password:string = '';

  disableBtn: boolean;

  constructor(public navCtrl: NavController,
    public http: Http,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public globals: Globals) {
    this.disableBtn = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  viewTerms() {
    this.navCtrl.push(TermsPage);
  }

  createAccount() {
    this.disableBtn = true;
    let headers = new Headers();
    let toast;

    headers.append('Content-Type', 'application/json');
    let body = {
      username: this.username,
      password: this.password,
      email: this.email
    };

    this.http.post(this.globals._https_uri + 'user/signup', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      this.disableBtn = false;
      console.log(data);
      if(data.success) {
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', this.username);

          localStorage.setItem('userId', data.message);

           toast = this.toastCtrl.create({
             message: 'Welcome ' + this.username,
             duration: 3000,
             position: 'top'
           });
           toast.present();

          this.navCtrl.push(ProfilePage);
      } else {
        toast = this.toastCtrl.create({
          message: data.message,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    })
  }

}
