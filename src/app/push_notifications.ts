import { Injectable } from '@angular/core'
import { Globals } from './globals';
import { Platform } from 'ionic-angular';
import { UserInformation } from './user_information';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class PushNotification {


  constructor(
    private globals:Globals,
    private userInformation: UserInformation,
    private http: Http,
    public push: Push,
    public platform: Platform)
    {
      //this.initPushNotification();
    }

    initPushNotification() {
      if (!this.platform.is('cordova')) {
        console.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
        return;
      }
      const options: PushOptions = {
        android: {
          senderID: '215041521810'
        },
        ios: {
          alert: 'true',
          badge: false,
          sound: 'true'
        },
        windows: {}
      };
      const pushObject: PushObject = this.push.init(options);

      pushObject.on('registration').subscribe((data: any) => {
        console.log('device token -> ' + data.registrationId);


        let platform;

        if (this.platform.is('android')) {
          console.log("running on Android device!");
          platform = 'android';
        }
        else if (this.platform.is('ios')) {
          console.log("running on iOS device!");
          platform = 'ios';
        }
        //TODO - send device token to server
        this.updateToken(platform, data.registrationId);
      });

      pushObject.on('notification').subscribe((data: any) => {
        console.log('message -> ' + data.message);


        console.log(data.message);
        //if user using app and push notification comes
        if (data.additionalData.foreground) {
          // if application open, show popup
          console.log(data.message);
        } else {
          //if user NOT using app and push notification comes
          //TODO: Your logic on click of push notification directly

        }
      });

      pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));
    }

    private updateToken(platform, device_token) {
      let headers = new Headers();

      headers.append('Content-Type', 'application/json');

      let body = {
        user_id: this.userInformation._user_id,
        platform: platform,
        device_token: device_token
      };

      console.log(body);

      this.http.post(this.globals._https_uri + 'user/notifications/registernotifications', JSON.stringify(body), {headers:headers})
      .map(res => res.json())
      .subscribe(data => {
        console.log("Register callback: " + data)
      })
    }



}
