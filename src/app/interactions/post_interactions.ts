import { Injectable } from '@angular/core'
import { Globals } from '../globals';
import { UserInformation } from '../user_information';
import { HomePage } from '../../pages/home/home';

import { HTTPInteraction } from './interact-http';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
global class to save and display which posts you've likes/dislikes.

Solution to not let users interact with posts multiple times.
*/

@Injectable()
export class PostInteractions {

  likes;
  dislikes;

  constructor(private globals:Globals, private userInformation: UserInformation, private http: Http, private HTTPInteraction: HTTPInteraction) {
    this.update();
  }

  public disableInteractionBtn(post_id) {
    let arr_ = this.getLikes();

    if(arr_ !== null) {
      if(arr_.length > 0) {
        for (let i = 0; i < arr_.length; i++) {
            if(arr_[i] === post_id) {
              return true;
            }
        }
      }
    }
    return false;
  }

  public like(table, post_id) {
    this.HTTPInteraction.interact(1,0,post_id,table, post_id);
    this.saveLike(post_id);
  }

  public dislike(table, post_id) {
    this.HTTPInteraction.interact(0,1,post_id,table, post_id);
    this.saveLike(post_id);
  }

  public update() {
    this.likes = localStorage.getItem('savedLikes');
    this.dislikes = localStorage.getItem('savedDislikes');
  }

  public getLikes() {
    return JSON.parse(this.likes);
  }

  public getDislikes() {
    return JSON.parse(this.dislikes);
  }

  public saveLike(post_id) {
    console.log(this.likes);
    let _likes = JSON.parse(this.likes) || [];

    _likes.push(post_id);

    localStorage.setItem('savedLikes', JSON.stringify(_likes));
    this.update();

  }

  public saveDislike(post_id) {
    let _dislikes = JSON.parse(this.dislikes) || [];

    _dislikes.push(post_id)

    localStorage.setItem('savedLikes', JSON.stringify(_dislikes));
    this.update();
  }


}
