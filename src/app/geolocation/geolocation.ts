import { Injectable } from '@angular/core'
import { Globals } from '../globals';
import { UserInformation } from '../user_information';
import { Geolocation } from '@ionic-native/geolocation';

import { TopicsModal } from '../topics/topics_modal';

import { Flow } from '../flow/flow';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { ModalController, ToastController } from 'ionic-angular';

@Injectable()
export class MyGeoLocation {


  constructor(
    private globals:Globals,
    private userInformation: UserInformation,
    private http: Http,
    private geolocation: Geolocation,
    public toastCtrl: ToastController,
    private flowModule: Flow,
    public topicsModal: TopicsModal) {

  }

  public getLocation(lat, long) {

    let string = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," +  long + "&sensor=true&key=AIzaSyBbhY6gO2Zwk7Afc31MpOGJc-9EMfl_iq0";

    this.http.get(string)
    .map(res => res.json())
    .subscribe(data => {
      //this.maps_loader.dismiss(); // dismiss loader
      console.log(data);
      if(data.status === "OK") {
        let result = data.results;
        let postsBy = this.userInformation._posts_by; // get local variable of where to pick posts from.
        let hasTopic = localStorage.getItem('standardTopicId');


        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[i].types.length; j++) {
                if(result[i].types[j] == 'postal_town') {
                  this.globals._locality = result[i].formatted_address; // set global variable.
                }

                if(result[i].types[j] == 'country') {
                  this.globals._country = result[i].formatted_address; // set global variable.
                }

                if(this.globals._country && this.globals._locality !== null || undefined) {
                  console.log("Done!")
                  break;
                }
            }
        }

        if(this.globals._country !== undefined || this.globals._locality !== undefined) {
          console.log(localStorage.getItem('betaGeoLoc_answered'));

        }

        if(localStorage.getItem('betaGeoLoc_answered') === 'true') {
          // load the flow, or pick a topic first..
          if(hasTopic === null) {
            //this.topicsModal.viewTopicsModal();
          } else {
            this.flowModule.getFlow(this.userInformation._flow_state);
          }
        }

      } else {
        let toast = this.toastCtrl.create({
           message: 'Failed to get current position!',
           duration: 3000,
           position: 'bottom'
         });
         toast.present();
      }

    })
  }


}
