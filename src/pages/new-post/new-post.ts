import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PostPage } from '../post/post';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';

import { UserInformation } from '../../app/user_information';

import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Globals } from '../../app/globals';
import { ActionSheetController, ToastController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-new-post',
  templateUrl: 'new-post.html',
})
export class NewPostPage {
  topic_name: string;
  post_by: string;
  post_by__text:string;

  enable_send_button: boolean;

  post_content: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public alertCtrl: AlertController,
    public globals: Globals,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public userInformation: UserInformation) {

    this.post_by = null;
    this.userInformation.refresh();
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad NewPostPage');
  }

  selectLocation() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select geographical point to post in',
      buttons: [
        {
          text: 'All',
          handler: () => {
            this.post_by = 'none';
            this.post_by__text = 'All';
          }
        },
        {
          text: this.globals._country,
          handler: () => {
            this.post_by = 'country';
            this.post_by__text = this.globals._country;
          }
        },{
          text: this.globals._locality,
          handler: () => {
            this.post_by = 'locality';
            this.post_by__text = this.globals._locality;
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

  sendPost() {
    if(this.post_by !== null) {
      if((this.globals._country === null || undefined) || (this.globals._locality === null || undefined)) {
        if(this.post_content !== "" || this.post_content !== undefined) {
          let headers = new Headers();

          headers.append('Content-Type', 'application/json');
          let body = {
            post_user_id: this.userInformation._user_id,
            post_content: this.post_content,
            post_geolocations: {
              post_locality: this.globals._locality,
              post_country: this.globals._country
            },
            post_by_geo: this.post_by,
            post_topic_id: this.userInformation._topic_id
          };

          console.log(body);

          this.http.post(this.globals._https_uri + 'newPost', JSON.stringify(body), {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            console.log(data)
            if(data.success) {
                this.navCtrl.pop();
            } else {
              let alert = this.alertCtrl.create({
                 title: 'Could not post at the moment!',
                 subTitle: data.message,
                 buttons: ['OK']
               });
               alert.present();
            }
          })
        } else {
          let toast = this.toastCtrl.create({
             message: 'Flow can not be empty',
             duration: 3000,
             position: 'top'
           });
           toast.present();
        }
      } else {
        let toast = this.toastCtrl.create({
           message: 'Failed to get your location',
           duration: 3000,
           position: 'top'
         });
         toast.present();
      }
    } else {
      let toast = this.toastCtrl.create({
         message: 'Please select a location',
         duration: 3000,
         position: 'top'
       });
       toast.present();
    }

  }

}
