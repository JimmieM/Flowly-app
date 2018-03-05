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
    this.HTTPInteraction.interact(1,0,table, id, post_id);
    this.saveLike(id);
  }

  public dislike(table, id, post_id) {
    this.HTTPInteraction.interact(0,1, table, id, post_id);
    this.saveLike(id);
  }


  // public interact(like, dislike, table, id, post_id) {
  //
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //
  //   let body = {
  //     username: this.userInformation._username,
  //     user_id: this.userInformation._user_id,
  //     likes: like,
  //     dislikes: dislike,
  //     table: table,
  //     id: id,
  //     origin_post_id: post_id
  //   };
  //
  //   console.log(body);
  //
  //   this.http.post(this.globals._https_uri + 'postinteraction', JSON.stringify(body), {headers:headers})
  //   .map(res => res.json())
  //   .subscribe(data => {
  //     console.log(data)
  //     if(data.success) {
  //       //this.channel.publish('update', 'true');
  //       for(let i = 0; i < PostPage.post['post_comments'].length; i++) {
  //         let comment = this.postPage.post['post_comments'][i];
  //         if(comment['comment_id'] === id) {
  //           this.postPage.post['post_comments'][i]['post_likes'] += like;
  //           this.postPage.post['post_comments'][i]['post_dislikes'] += dislike;
  //         }
  //       }
  //     }
  //   })
  // }

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
