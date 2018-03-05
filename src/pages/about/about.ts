import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { App } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  post: Object;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.post = this.navParams.get('post_data');
  }

  ionViewDidLoad() {
    if(this.post !== null) {

    }
  }

}
