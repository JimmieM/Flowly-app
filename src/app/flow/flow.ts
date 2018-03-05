import { Injectable } from '@angular/core'
import { Globals } from '../globals';
import { UserInformation } from '../user_information';

import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class Flow {

  flow_content = [];

  // used for Home.ts to show/hide text as "Empty flow."
  // start as False, to indicate that its not empty.
  // on getFlow, change that variable, if needed.
  flow_content_empty = {
    'normal': false,
    'popular': false,
    'unpopular': false
  }

  topic_id: number;

  constructor(
    private globals:Globals,
    private userInformation: UserInformation,
    private http: Http) {
      this.topic_id = Number.parseInt(localStorage.getItem('standardTopicId')) || 0;
    }

  async getFlow(flow) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id || 0,
      flow_type: flow,
      topic_id: this.userInformation._topic_id,
      posts_by: this.userInformation._posts_by,
      post_geolocations: {
        locality: this.globals._locality,
        country: this.globals._country
      }
    };

    console.log(body);

    const resp = await this.http.post(this.globals._https_uri + 'flow', JSON.stringify(body), {headers:headers}).toPromise();
    let data = resp.json();

    if(data.success) {
      data.flow_response_normal === null ? this.flow_content_empty['normal'] = true:this.flow_content_empty['normal'] = false;
      data.flow_response_popular === null ? this.flow_content_empty['popular'] = true: this.flow_content_empty['popular'] = false;
      data.flow_response_unpopular === null  ? this.flow_content_empty['unpopular'] = true:this.flow_content_empty['unpopular'] = false;

      this.flow_content['normal'] = data.flow_response_normal
      this.flow_content['popular'] = data.flow_response_popular
      this.flow_content['unpopular'] = data.flow_response_unpopular
    }
    return data.success;
  }


}
