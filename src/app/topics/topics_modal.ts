import { Component, Injectable } from '@angular/core';

import { Globals } from '../../app/globals';
import { PostInteractions } from '../../app/interactions/post_interactions';

import { NavController } from 'ionic-angular';

import { HttpClientModule } from '@angular/common/http';

import { HTTPInteraction } from '../../app/interactions/interact-http';


import { MyGeoLocation } from '../../app/geolocation/geolocation';

import { UserInformation } from '../../app/user_information';

import { Flow } from '../../app/flow/flow';

import { Geolocation } from '@ionic-native/geolocation';
import { ModalController, ViewController, ToastController } from 'ionic-angular';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
        Pick a topic
    </ion-title>

    <ion-buttons start>
      <button ion-button clear (click)="dismiss()">
        <span ion-text color="white" showWhen="ios">Cancel</span>
        <ion-icon name="md-close" showWhen="android, windows"></ion-icon>
      </button>
    </ion-buttons>
    <ion-buttons end>
      <button clear ion-button full (click)="newTopicAlert()">
        <ion-icon color="light" name="add"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content>
  <ion-searchbar (ionInput)="searchTopics($event)">Search topics</ion-searchbar>

  <button *ngIf="bookmarked_topics.length > 0" color="light" clear ion-button full (click)="toggleBookmarks()">{{bookmark_btn_title}}</button>

  <ion-spinner style="width:100%;" text-center *ngIf="!finishedLoading" name="dots"></ion-spinner>
  <p *ngIf="bookmark_btn_title === 'Rated top'" style="color: #c7c7c7;" text-center>Showing top 15 rated topics</p>
  <ion-list>
    <button ion-item *ngFor="let item of topics_temp | slice:0:15; let i=index" (click)="pickTopic(item.topic_id, item.topic_name)">
      <h2>{{item.topic_name}}</h2>
      <ion-badge item-end>{{item.topic_likes}}</ion-badge>
      <ion-badge item-end>{{item.topic_dislikes}}</ion-badge>
    </button>
  </ion-list>
</ion-content>
`
})
@Injectable()
export class TopicsModal {

  topics;
  topics_temp;

  bookmarked_topics;
  bookmark_btn_title = 'My bookmarks';
  show_bookmarks = false;

  userId: number;

  finishedLoading = false;

  loggedIn: string;

  constructor(
    //public viewCtrl: ViewController,
    public http: Http,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private globals: Globals,
    public modalCtrl: ModalController,
    private userInformation: UserInformation
  ) {
    this.userId = Number.parseInt(localStorage.getItem('userId'));
    this.loggedIn = localStorage.getItem('loggedIn');
    this.topics = [];
    this.bookmarked_topics = JSON.parse(localStorage.getItem('bookmarkedTopics')) || [];

    this.getTopics();
  }


  toggleBookmarks() {

    this.show_bookmarks = !this.show_bookmarks;

    if(this.show_bookmarks) {
      this.bookmark_btn_title = 'Rated topics';

      let temp = [];
      if(this.bookmarked_topics.length > 0) {

        console.log(this.bookmarked_topics);

        for (let i = 0; i < this.bookmarked_topics.length; i++) {
          for (let j = 0; j < this.topics.length; j++) {
            if(this.bookmarked_topics[i] === this.topics[j].topic_id) {
              temp.push(
                {
                  topic_id: this.topics[j].topic_id,
                  topic_name: this.topics[j].topic_name,
                  topic_likes: this.topics[j].topic_likes,
                  topic_dislikes: this.topics[j].topic_dislikes
                }
              );
            }
          }
        }
      }
      this.topics_temp = temp;
    } else {
      this.bookmark_btn_title = 'My bookmarks';
      this.topics_temp = this.topics;
    }
  }

  searchTopics(ev: any) {

    this.topics_temp = this.topics;

    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.topics_temp = this.topics_temp.filter((item) => {
        return item['topic_name'].toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    }
  }

  newTopicAlert() {

    if(this.loggedIn === 'true') {
      let prompt = this.alertCtrl.create({
       title: 'Create a new topic',
       message: "Couldn't find a topic for you? Create one!",
       inputs: [
         {
           name: 'topic_name',
           placeholder: 'Topic name'
         },
       ],
       buttons: [
         {
           text: 'Cancel',
           handler: data => {}
         },
         {
           text: 'Add',
           handler: data => {
             this.createTopic(data.topic_name);
           }
         }
       ]
     });
     prompt.present();
   } else {
     let toast = this.toastCtrl.create({
        message: "Please log in to create a new topic",
        duration: 3000,
        position: 'top',
        showCloseButton: true
      });
      toast.present();
   }


  }

  createTopic(topic_name) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userId,
      topic_name: topic_name
    };

    this.http.post(this.globals._https_uri + 'topics/newtopic', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
      let toast;
      if(data.success) {
        toast = this.toastCtrl.create({
           message: 'Your topic has been created!.',
           duration: 3000,
           position: 'bottom'
         });
      } else if(!data.success && !data.error) {
        toast = this.toastCtrl.create({
           message: 'This topic already exist',
           duration: 3000,
           position: 'bottom'
         });

      } else if(!data.success && data.error) {
        toast = this.toastCtrl.create({
           message: 'Could not create Topic.',
           duration: 3000,
           position: 'bottom'
         });
      }
      toast.present();
      this.getTopics();
    })
  }

  getTopics() {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      // TODO; enter shit
    };

    console.log(this.globals._https_uri)

    this.http.post(this.globals._https_uri + 'topics/GetTopics', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      this.finishedLoading = true;
      //console.log(data)
      if(data.success) {
        this.topics = data.topic_response;
        this.topics_temp = data.topic_response;
      } else {
        let toast = this.toastCtrl.create({
           message: 'Failed to load topics',
           duration: 3000,
           position: 'bottom'
         });
         toast.present();
      }
    })
  }

  /*
  arr = [
    {
      'topic': 'bajs',
      'id': 1,
      'sub_topics': [
        {
          an object of a topic
        },
        {
        another object
        }
      ]

    },
  ]
  */

  sortTopics(topics) {

    let topics_sorted = [];
    let temp_obj;

    for(let i = 0; i < topics.length; i++) {
      temp_obj = {};

      let is_main_topic = function() {
        return topics[i].topic_sub_topic_of_id > 0;
      }
      if(is_main_topic) {
        let topic_sub_topic_of_id = topics[i].topic_sub_topic_of_id;
        // if there's an object in topic_sorted with sub_topic_id
        if(topics_sorted.length > 0) {
          let found = false;
          for (let i = 0; i < topics_sorted.length; i++) {

              // there's already a main topic
              // push subtopic to array
              if(topics_sorted[i].topic_id === topic_sub_topic_of_id) {
                found = true;
                topics.sorted[i].sub_topics.push(topics[i]);
                break;
              }
          }

          // create a main topic
          if(!found) {
              topics.sorted.push() // gotta find the main topic as well...
          }
        }
      }
      let topic_id = topics[i].topic_id;
      let topic_name = topics[i].topic_name;
      let topic_likes = topics[i].topic_likes;
      let topic_dislikes = topics[i].topic_dislikes;
    }

    this.topics = topics;
  }

  pickTopic(topic_id, topic_name) {
    let n = topic_id.toString(); // int > string parse
    localStorage.setItem('standardTopicId', n);
    localStorage.setItem('standardTopicName', topic_name);
    this.dismiss();
  }
   dismiss() {
    //this.viewCtrl.dismiss();
  }
}
