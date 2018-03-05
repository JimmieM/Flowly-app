import { Injectable } from '@angular/core'
import { Globals } from '../globals';
import { UserInformation } from '../user_information';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { Flow } from '../flow/flow';

@Injectable()
export class HTTPInteraction {

  likes;
  dislikes;

  constructor(private globals:Globals,
    private userInformation: UserInformation,
    private http: Http,
    private flowModule: Flow) {}

  public interact(like, dislike, id, table, post_id) {

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id || 0,
      origin_post_id: post_id,
      likes: like,
      dislikes: dislike,
      id: id, // postId or commentId
      table: table
    };

    console.log(body);

    this.http.post(this.globals._https_uri + 'postinteraction', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
      if(data.success) {


        if(table === 'post') {
          for (let i = 0; i < this.flowModule.flow_content[this.userInformation._flow_state].length; i++) {

            let flow = this.flowModule.flow_content[this.userInformation._flow_state][i];

            if(flow['post_id'] === post_id) {

              flow['post_dislikes'] += dislike;
              flow['post_likes'] += like;
              break;
            }
          }
        } else {
          //this.channel.publish('update', 'true'); TODO fix
          // for(let i = 0; i < this.postPage.post['post_comments'].length; i++) {
          //   let comment = this.postPage.post['post_comments'][i];
          //   if(comment['comment_id'] === id) {
          //     this.postPage.post['post_comments'][i]['post_likes'] += like;
          //     this.postPage.post['post_comments'][i]['post_dislikes'] += dislike;
          //   }
          // }
        }
      }
    })
  }


}
