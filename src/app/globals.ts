import { Injectable } from '@angular/core'

@Injectable()
export class Globals {
  _locality: string; // where you are (city)
  _country: string; // which country your in.

  _prod:boolean = false;

  _https_uri: string;
  _key: string;

  constructor() {
    this._key = 'aadsa--djja33_#11@abd';
    this._https_uri = 'https://anonyflow.azurewebsites.net/api/';

    if(!this._prod) {
      this._https_uri = 'http://localhost:5000/api/';
    }
  }
}
