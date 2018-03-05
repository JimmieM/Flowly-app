import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { App } from 'ionic-angular';
import { Content } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import * as Ably from 'ably';
import { Globals } from '../../app/globals';
import { UserInformation } from  '../../app/user_information';
import { UserProfilePage } from '../user-profile/user-profile';

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;

  ably;
  channel;

  messageSend: boolean;
  chat_text: string;


  chat_username:string;
  chat_user_id: number;

  chats;

  private scrollToBottom() {
    setTimeout(() => {
           this.content.scrollToBottom();
       });
  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public globals: Globals,
    public userInformation: UserInformation)
  {
    this.messageSend = false;
    this.ably = new Ably.Realtime('iJs-JQ.THfLcg:9zSDnj4Yh9n1xdu9');

    this.chat_user_id = this.navParams.get('user_id');
    this.chat_username = this.navParams.get('username');

    this.userInformation.refresh();

    this.scrollToBottom();

    this.chats = [];
  }

  public openProfile() {
    this.navCtrl.push(UserProfilePage, {
      'user_id': this.chat_user_id,
      'username': this.chat_username
    })
  }

  chatInput(value) {
    if(value.length > 0) {
      this.messageSend = true;
    } else {
      this.messageSend = false;
    }
  }

  sendChat() {

    // push a temp chat.
    let obj = {
      chat_date: 'sending...',
      chat_from_id:this.userInformation._user_id,
      chat_id: 0,
      chat_message: this.chat_text,
      chat_to_id: this.chat_user_id
    }

    this.chats.push(obj);

    // scroll
    this.scrollToBottom();

    // send to server..
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id,
      username: this.userInformation._username,
      to_user_id: this.chat_user_id,
      to_username: this.chat_username,
      message: this.chat_text
    };

    console.log(body);

    this.http.post(this.globals._https_uri + 'chat/newchat', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      let the_date = "";

      if(data.success) {
        let post_channel = this.ably.channels.get('chat_user_id_' + this.chat_user_id);
        ​
        // Publish a message to the test channel
        post_channel.publish('message', this.chat_text);

        the_date = "right now";
      } else {
        the_date = "couldn't send chat, click to retry!"
      }

      this.chats[this.chats.length - 1]['chat_date'] = the_date; // update from "Sending..."

      this.chat_text = "";
      this.messageSend = false;
    });
  }

  getChats(amount = 50) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id,
      contact_user_id: this.chat_user_id,
      amount: amount
    };

    this.http.post(this.globals._https_uri + 'chat/getchat', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {

      console.log(data)
      if(data.success) {
        this.chats = data.chats;

        var channel = this.ably.channels.get('chat_user_id_' + this.userInformation._user_id,);
        let obj;

        var callback = () => this.getChats();

        channel.subscribe(callback);

        this.scrollToBottom();
      } else {
        let alert = this.alertCtrl.create({
           title: 'Could not comment at the moment!',
           subTitle: data.message,
           buttons: ['OK']
         });
         alert.present();
      }
    })
  }

  public updateChatRealtime(data) {
    let obj = {
        chat_date: 'right now',
        chat_from_id: this.chat_user_id,
        chat_id: 0,
        chat_message: data,
        chat_to_id: this.userInformation._user_id,
      }

      this.chats.push(obj);
  }

  ionViewDidLoad() {
    this.getChats();
  }

}
