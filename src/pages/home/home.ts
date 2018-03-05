import { Component, Injectable } from '@angular/core';

import { Globals } from '../../app/globals';
import { PostInteractions } from '../../app/interactions/post_interactions';
import { TopicVotes } from '../../app/topics/topic_votes';

import { NavController } from 'ionic-angular';
import { SliderPage } from '../slider/slider';
import { PostPage } from '../post/post';
import { NewPostPage } from '../new-post/new-post';
import { HttpClientModule } from '@angular/common/http';

import { HTTPInteraction } from '../../app/interactions/interact-http';

import { MyGeoLocation } from '../../app/geolocation/geolocation';

import { UserInformation } from '../../app/user_information';

import { Flow } from '../../app/flow/flow';

import { PushNotification } from '../../app/push_notifications';


import { Geolocation } from '@ionic-native/geolocation';
import { ModalController, Platform, NavParams, ViewController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
TODO:

List all localStorage variables somewhere,and doucment!
*/

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
  <p *ngIf="viewing_title !== ''" style="color: #c7c7c7;" text-center>{{viewing_title}}</p>
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
export class ModalContentPage {

  topics;
  topics_temp;

  bookmarked_topics_temp;
  bookmarked_topics;
  bookmark_btn_title = 'My bookmarks';
  show_bookmarks = false;


  finishedLoading = false;

  viewing_title = 'Showing top 15 rated topics';
  showSearch = true;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public http: Http,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private globals: Globals,
    private userInformation: UserInformation
  ) {
    this.topics = [];

    this.bookmarked_topics_temp = [];
    this.bookmarked_topics = JSON.parse(localStorage.getItem('bookmarkedTopics')) || [];

    this.getTopics();
  }

  toggleBookmarks() {

    this.show_bookmarks = !this.show_bookmarks;

    if(this.show_bookmarks) {
      this.showSearch = false;
      this.bookmark_btn_title = 'Rated topics';
      this.viewing_title = 'Your bookmarks';

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
      this.bookmarked_topics_temp = temp;
    } else {
      this.showSearch = true;
      this.bookmark_btn_title = 'My bookmarks';
      this.viewing_title = 'Showing top 15 rated topics';
      this.topics_temp = this.topics;
    }
  }

  searchTopics(ev: any) {



    this.viewing_title = 'Searching...'

    let val = ev.target.value;

    // if user is viewing ALL instead of his/hers bookmarks.
    if(!this.show_bookmarks) {
      this.topics_temp = this.topics;
      this.viewing_title = 'Showing top 15 rated topics';
    } else {
      this.topics_temp = this.bookmarked_topics_temp;
      this.viewing_title = 'Your bookmarks';
    }

    if(val.trim() == '' && !this.bookmarked_topics) {

    }
    if(val.trim() != '') {
      this.topics_temp = this.topics_temp.filter((item) => {
        let found = item['topic_name'].toLowerCase().indexOf(val.toLowerCase()) > -1;
        this.viewing_title = 'Results for ' + val + '...';
        return found;
      })
    }
  }

  newTopicAlert() {

    if(this.userInformation._logged_in) {
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
      user_id: this.userInformation._user_id,
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

    this.userInformation._topic_name = topic_name;
    this.userInformation._topic_id = topic_id;
    this.dismiss();
  }
   dismiss() {
    this.viewCtrl.dismiss();
  }
}


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
@Injectable()
export class HomePage {
  topic_name: string;
  topic_id: number;

  finishedLoading = false;
  maps_loader;

  flow: string = "normal"; // set flow as normal
  posts_by; // locality, none, country


  flow_content; // declaration of the flow
  emptyFlow = false;

  constructor(
      public navCtrl: NavController,
      public alertCtrl: AlertController,
      private geolocation: Geolocation,
      public http: Http,
      public toastCtrl: ToastController,
      public modalCtrl: ModalController,
      private globals: Globals,
      public loadingCtrl: LoadingController,
      public actionSheetCtrl: ActionSheetController,
      public postInteractions: PostInteractions,
      public topicVotes: TopicVotes,
      public platform: Platform,
      public flowModule: Flow,
      public userInformation: UserInformation,
      private pushNotification: PushNotification)
    {

    //localStorage.clear();

    this.flow_content = [];


    this.topic_name = localStorage.getItem('standardTopicName');
    this.topic_id = Number.parseInt(localStorage.getItem('standardTopicId'));

    this.userInformation.refresh();


    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      /*
      TODO: call maps API again if cords is very different!
      */
     console.log(data.coords.longitude);
     console.log(data.coords.latitude);
    });
  }

  ionViewDidLoad() {
    if(localStorage.getItem('tutorial') !== 'true') {
      this.navCtrl.push(SliderPage);
    } else {
      this.topic_name = localStorage.getItem('standardTopicName');
      this.topic_id = Number.parseInt(localStorage.getItem('standardTopicId'));


      this.platform.ready().then(() => {


        this.pushNotification.initPushNotification();

        this.geolocation.getCurrentPosition().then((resp) => {

        this.setPostsBy();

         this.getLocation(resp.coords.latitude, resp.coords.longitude);

        }).catch((error) => {
          console.log('Error getting location: ' + error.message);
          //this.maps_loader.dismiss();

          let toast = this.toastCtrl.create({
             message: 'Failed to locate you! Use the compass to try again.',
             duration: 3000,
             position: 'bottom'
           });
           toast.present();
        });

      });
    }
  }

  private beta_input_identifier(country, locality) {
    let prompt = this.alertCtrl.create({
     title: "Hi! Thanks for trying out Flowly.",
     message: "There's a few questions ahead, firsly, please provide your name. We'll use it to identify flaws in the app.",
     inputs: [
       {
         name: 'identifier',
         placeholder: 'Who are you?'
       },
     ],
     buttons: [
       {
         text: "I don't want to participate",
         handler: data => {
           localStorage.setItem('betaGeoLoc_answered', 'true');
           this.beta_show_thanks("");
         }
       },
       {
         text: 'Continue',
         handler: data => {
           this.beta_show_geoloc(country, locality, data.identifier);
         }
       }
     ]
   });
   prompt.present();
  }

  // only for beta testers..
  private beta_show_geoloc(country, locality, identifier) {

    localStorage.setItem('betaGeoLoc_answered', 'true');

    let confirm = this.alertCtrl.create({
      title: 'Is following location correct?',
      message: "Since you're one of our beta testers, we'd like to know if the following location is correct. \n\n We found you in country: " + country + " \n and city/locality: " + locality,
      buttons: [
        {
          text: "It's wrong!",
          handler: () => {
            this.beta_show_comment_input(false, "", identifier);
          }
        },
        {
          text: "It's correct!",
          handler: () => {
            this.beta_post_data(true, "", identifier);
          }
        }
      ]
      });
      confirm.present();
  }

  // when confirmed that the geoloc is wrong
  private beta_show_comment_input(correctLocation, comments, user) {
    let prompt = this.alertCtrl.create({
     title: "Is the location wrong?",
     message: "Please provide your country and city/locality",
     inputs: [
       {
         name: 'comments',
         placeholder: 'Where are you?'
       },
     ],
     buttons: [
       {
         text: 'Cancel',
         handler: data => {
           this.beta_show_thanks("");
         }
       },
       {
         text: 'Send data',
         handler: data => {
           this.beta_post_data(false, data.comments, user);
         }
       }
     ]
   });
   prompt.present();
  }

  // post to API
  private beta_post_data(correctLocation, comments, user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let body = {
      geoloc_comments: comments,
      geoloc_user_identifier: user,
      geoloc_is_correct: correctLocation
    };

    console.log(body);
    this.http.post(this.globals._https_uri + 'beta_test/geolocationQA', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
      this.beta_show_thanks(data.message);
    })
  }

  private beta_show_thanks(message) {
    let prompt = this.alertCtrl.create({
     title: "Thanks!",
     message: "",
     buttons: [
       {
         text: 'Continue',
         handler: data => {
           this.viewTopicsModal();
         }
       }
     ]
   });
   prompt.present();
  }

  ionViewWillEnter(){

  }

  public viewTopicsModal() {

    // save current topic_id in local var. later to prevent a reload if user just cancels the process.
    let current_topic = this.userInformation._topic_id;


    let modal = this.modalCtrl.create(ModalContentPage);
    modal.onDidDismiss(() => {
     // this.userInformation._topic_name = localStorage.getItem('standardTopicName'); // reload variable
     // this.userInformation._topic_id = Number.parseInt(localStorage.getItem('standardTopicId')); // reload variable

     // only if user changed topic, reload.
     if(current_topic !== this.userInformation._topic_id) {
        this.getFlow(this.flow);
     }

    });
    modal.present();
  }

  private setPostsBy() {
    if(localStorage.getItem('postsBy') === null || undefined) {
      localStorage.setItem('postsBy', 'country'); // init as country
      this.posts_by = 'country'; // retreive value quick
    } else {
      this.posts_by = localStorage.getItem('postsBy'); // retreive value
    }
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
        let postsBy = this.posts_by; // get local variable of where to pick posts from.
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
          if(localStorage.getItem('betaGeoLoc_answered') !== 'true') {
            this.beta_input_identifier(this.globals._country, this.globals._locality);
          }
        }

        if(localStorage.getItem('betaGeoLoc_answered') === 'true') {
          // load the flow, or pick a topic first..
          if(hasTopic === null) {
            this.viewTopicsModal();
          } else {
            this.getFlow(this.flow);
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

  public bookmarkTopic(topic_id) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarkedTopics')) || [];

    bookmarks.push(topic_id);

    localStorage.setItem('bookmarkedTopics', JSON.stringify(bookmarks));

    let toast = this.toastCtrl.create({
       message: "Topic bookmarked",
       duration: 3000,
       position: 'top',
       showCloseButton: true
     });
     toast.present();
  }

  public disableBookmarkBtn(topic_id) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarkedTopics')) || [];

    if(bookmarks.length > 0) {
      for (let i = 0; i < bookmarks.length; i++) {
        if(bookmarks[i] == topic_id) {
          return true;
        }
      }
    }
    return false;
  }

  public pickGeoOptions() {

    let country = 'Country';
    let city = 'City';
    if(this.globals._country !== null) {
      country = this.globals._country;
    }
    if(this.globals._locality !== null) {
      city = this.globals._locality;
    }

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select a geographical point',
      buttons: [
        {
          text: 'World',
          handler: () => {
            localStorage.setItem('postsBy', 'none');
            this.userInformation._posts_by = 'none';
            this.getFlow(this.flow);
          }
        },
        {
          text: country,
          handler: () => {
            localStorage.setItem('postsBy', 'country');
            this.userInformation._posts_by = 'country';
            this.getFlow(this.flow);
          }
        },{
          text: city,
          handler: () => {
            localStorage.setItem('postsBy', 'locality');
            this.userInformation._posts_by = 'locality';
            this.getFlow(this.flow);
          }
        },
        {
          text: 'Locate my position',
          handler: () => {
            this.ionViewWillEnter();
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

  public openPost(post) {
    console.log(post);

    this.navCtrl.push(PostPage, {
      post_data: post,
    });
  }


  public newPost() {
    this.navCtrl.push(NewPostPage)
  }

  public updateFlow(refresher, drag) {
    this.getFlow(this.flow, drag);

    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

  async getFlow(flow, drag = false) {

    this.userInformation._flow_state = flow;

    this.emptyFlow = false;

    // don't clear flow if its only a drag..
    // if(!drag) {
    //   this.flow_content = [];
    // }

    this.flow_content = [];

    this.finishedLoading = false;
    if(this.globals._locality == undefined || this.globals._country == undefined) {
      this.ionViewWillEnter();
    }

    let flow_resp = await this.flowModule.getFlow("all")
    console.log(flow_resp)

    console.log(this.flowModule.flow_content)

    if(flow_resp) {
      this.finishedLoading = true;
    }
  }

}
