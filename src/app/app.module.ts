import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { Http } from '@angular/http';
import { Push } from '@ionic-native/push';

import { ModalController } from 'ionic-angular';

import { HttpClientModule } from '@angular/common/http';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage, ModalContentPage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { PostPage } from '../pages/post/post';
import { TermsPage } from '../pages/terms/terms';
import { NewPostPage } from '../pages/new-post/new-post';
import { ProfilePage } from '../pages/profile/profile';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { NotificationsPage } from '../pages/notifications/notifications';
import { ChatPage } from '../pages/chat/chat';
import { SettingsPage } from '../pages/settings/settings';
import { TopicVotes } from './topics/topic_votes';

import { SignupPage } from '../pages/signup/signup';
import { LoginPage } from '../pages/login/login';

import { SliderPage } from '../pages/slider/slider';

import { Geolocation } from '@ionic-native/geolocation';

import { MyGeoLocation } from './geolocation/geolocation';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PushNotification } from './push_notifications';

import { Globals } from './globals';
import { Flow } from './flow/flow';
import { UserInformation } from './user_information';
import { PostInteractions } from './interactions/post_interactions';
import { CommentInteractions } from './interactions/comment_interactions';
import { HTTPInteraction } from './interactions/interact-http';



@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    PostPage,
    NewPostPage,
    ProfilePage,
    NotificationsPage,
    ChatPage,
    SignupPage,
    LoginPage,
    SettingsPage,
    ModalContentPage,
    SliderPage,
    UserProfilePage,
    TermsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,{
      mode: 'md' // android type. Remove for native UI.
    }),
    HttpModule,
  ],

  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    PostPage,
    NewPostPage,
    ProfilePage,
    NotificationsPage,
    ChatPage,
    SignupPage,
    LoginPage,
    SettingsPage,
    ModalContentPage,
    SliderPage,
    UserProfilePage,
    TermsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Globals,
    PostInteractions,
    TopicVotes,
    HomePage,
    PostPage,
    UserProfilePage,
    CommentInteractions,
    UserInformation,
    HTTPInteraction,
    Flow,
    MyGeoLocation,
    PushNotification,
    Push,
    TermsPage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
