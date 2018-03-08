import { Injectable } from '@angular/core'

import { Globals } from '../globals';
import { UserInformation } from '../user_information';
import { PostPage } from '../../pages/post/post';

import { HTTPInteraction } from './interact-http';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

/*
global class to save and display which comments you've likes/dislikes.

Solution to not let users interact with a comment multiple times.
*/

@Injectable()
export class CommentInteractions {

  likes;
  dislikes;

  constructor(private globals:Globals, private userInformation: UserInformation, private http: Http, private HTTPInteraction: HTTPInteraction) {
    this.update();
  }

  public disableInteractionBtn(comment_id) {
    let arr_ = this.getLikes();

    if(arr_ !== null) {
      if(arr_.length > 0) {
        for (let i = 0; i < arr_.length; i++) {
            if(arr_[i] === comment_id) {
              return true;
            }
        }
      }
    }
    return false;
  }

  public like(table, id, post_id) {
    this.HTTPInteraction.interact(1,0,id, table, post_id);
    this.saveLike(id);
  }

  public dislike(table, id, post_id) {
    this.HTTPInteraction.interact(0,1, id, table, post_id);
    this.saveLike(id);
  }


  public update() {
    this.likes = localStorage.getItem('savedLikes_comments');
    this.dislikes = localStorage.getItem('savedDislikes_comments');
  }

  public getLikes() {
    return JSON.parse(this.likes);
  }

  public getDislikes() {
    return JSON.parse(this.dislikes);
  }

  public saveLike(comment_id) {
    console.log(this.likes);
    let _likes = JSON.parse(this.likes) || [];

    _likes.push(comment_id);

    localStorage.setItem('savedLikes_comments', JSON.stringify(_likes));
    this.update();

  }

  public saveDislike(comment_id) {
    let _dislikes = JSON.parse(this.dislikes) || [];

    _dislikes.push(comment_id)

    localStorage.setItem('savedLikes_comments', JSON.stringify(_dislikes));
    this.update();
  }


}
