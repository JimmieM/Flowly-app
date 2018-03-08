import { Injectable } from '@angular/core'

@Injectable()
export class UserInformation {
  _username: string;
  _user_id: number;
  _logged_in: boolean;

  _posts_by: string;

  _flow_state: string; // Defined which flow the user is in.

  _topic_name: string;
  _topic_id: number;

  _locality: string; // where you are (city)
  _country: string; // which country your in.

  _standard_postby: string; // on post

  constructor() {
    this.refresh();
  }

  public refresh() {
    this._username = localStorage.getItem('username');
    this._logged_in = localStorage.getItem('loggedIn') == 'true' ? true : false;
    this._posts_by = localStorage.getItem('postsBy') || 'none';
    this._user_id = Number.parseInt(localStorage.getItem('userId')) || 0;

    this._topic_name = localStorage.getItem('standardTopicName'); // reload variable
    this._topic_id = Number.parseInt(localStorage.getItem('standardTopicId')); // reload variable

    this._standard_postby = localStorage.getItem('standardPostBy') || null;
  }

  public isLoggedIn() {
    return this._logged_in;
  }

  public getUsername() {
    return this._username;
  }

  public getUserId() {
    return this._user_id;
  }
}
