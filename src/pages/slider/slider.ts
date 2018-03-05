import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-slider',
  templateUrl: 'slider.html',
})
export class SliderPage {

  slides = [
    {
      title: "Hi there!",
      description: "Welcome to Flowly, a place where you can share and post your insights on topics you're in charge of.",
      image: "assets/imgs/primary_red.png",
    },
    {
      title: "What's so special?",
      description: "Flowly lets the community run the topics and discussions. As a member you are completely <bold>anonymous</bold>.",
      image: "assets/imgs/qmark.png",
    },
    {
      title: "Be whom you want",
      description: "How many times have you met an anonymous person you'd like to continue to speak with? Flowly gives you the option to remain anonymous but also connect with users, by revealing your identity.",
      image: "assets/imgs/chat_picture.png",
    }
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  skip() {
    localStorage.setItem('tutorial','true');

    this.navCtrl.push(HomePage);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SliderPage');
  }

}
