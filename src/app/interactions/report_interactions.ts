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
{table} as param = comment, post
{id} as param = id of comment or post
*/

@Injectable()
export class ReportInteractions {

  reports;

  constructor(private globals:Globals, private userInformation: UserInformation, private http: Http, private HTTPInteraction: HTTPInteraction) {
    //this.reports['post'] = localStorage.getItem('savedReports');
    //this.update();
  }

  public canInteract(id, table) {
    let arr_ = this.getReports(table);

    if(arr_ !== null) {
      if(arr_.length > 0) {
        for (let i = 0; i < arr_.length; i++) {
          if(arr_[i] === id) {
            return true;
          }
        }
      }
    }
    return true;
  }


  public update(table) {
    this.reports = JSON.parse(localStorage.getItem('savedReports_' + table));
  }

  private getReports(table) {
    return JSON.parse(localStorage.getItem('savedReports_' + table)) || [];
  }

  public saveReport(id, table) {
    let _reports = this.getReports(table);

    _reports.push(id);

    localStorage.setItem('savedReports_' + table, JSON.stringify(_reports));

    console.log(JSON.parse(localStorage.getItem('savedReports_' + table)))
    this.update(table);
  }



}
