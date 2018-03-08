import { Injectable } from '@angular/core'
import { Globals } from '../globals';
import { UserInformation } from '../user_information';
import { HomePage } from '../../pages/home/home';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
global class to save and display which topics you've likes/dislikes.

Solution to not let users interact with same topic multiple times.
*/

@Injectable()
export class TopicVotes {

  votes;
  constructor(private globals:Globals, private userInformation: UserInformation, private http: Http) {
    this.update();
  }

  public disableTopicVoteBtn(topic_id) {
    let arr_;

    arr_ = this.getVotes();

    if(arr_ !== null) {
      if(arr_.length > 0) {
        for (let i = 0; i < arr_.length; i++) {
            if(arr_[i] === topic_id) {
              return true;
            }
        }
      }
    }

    return false;
  }

  public voteTopic(topic_id, up, down) {

    this.saveVote(topic_id);

    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id,
      likes: up,
      dislikes: down,
      topic_id: topic_id
    };

    this.http.post(this.globals._https_uri + 'topics/voteTopic', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
    })
  }


  public update() {
    this.votes = localStorage.getItem('savedTopicVotes');
  }

  public getVotes() {
    return JSON.parse(this.votes);
  }

  public saveVote(topic_id) {

    let _likes = JSON.parse(this.votes) || [];

    _likes.push(topic_id);

    localStorage.setItem('savedTopicVotes', JSON.stringify(_likes));
    this.update();

  }
}
