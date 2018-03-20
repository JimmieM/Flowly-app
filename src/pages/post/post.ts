import { Component, ViewChild, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { Http, Headers }     from '@angular/http';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { App } from 'ionic-angular';
import { Content } from 'ionic-angular';
import { ToastController, ActionSheetController } from 'ionic-angular';
import * as Ably from 'ably';
import { Globals } from '../../app/globals';
import { CommentInteractions } from '../../app/interactions/comment_interactions';
import { PostInteractions } from '../../app/interactions/post_interactions';
import { ReportInteractions } from '../../app/interactions/report_interactions';
import { UserInformation } from '../../app/user_information'

@Component({
  selector: 'page-post',
  templateUrl: 'post.html'
})
@Injectable()
export class PostPage {
  @ViewChild(Content) content: Content;

  ably;
  channel;

  topic_name: string;

  finishedLoading:Boolean = false;

  messageSend: boolean;
  comment: string;


  post = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public globals: Globals,
    public commentInteractions: CommentInteractions,
    public postInteractions: PostInteractions,
    public userInformation: UserInformation,
    public actionSheetCtrl: ActionSheetController,
    public reportInteractions: ReportInteractions)
  {

    this.topic_name = localStorage.getItem('standardTopicName');

    this.ably = new Ably.Realtime('iJs-JQ.THfLcg:9zSDnj4Yh9n1xdu9');
    this.messageSend = false;

    this.post = this.navParams.get('post_data');

    if(this.post['post_id'] === undefined) {
      this.navCtrl.pop();
    }

    this.channel = this.ably.channels.get('post_' + this.post['post_id']); // specify channel to listen

    var callback = () => this.loadPost(this.post['post_id']);

    this.channel.subscribe(callback);

    this.userInformation.refresh();
  }

  public showOptions(table, id, user_id) {
    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: [
        {
          text: 'Report this ' + table ,
          handler: () => {
            this.reasonOfReport(table, id, user_id);
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    actionSheet.present();
  }

  private reasonOfReport(table, id, user_id) {
    let prompt = this.alertCtrl.create({
     title: 'Why are you reporting this ' + table + '?',
     message: '',
     buttons: [
       {
         text: 'Revealing of personal information',
         handler: data => {
           this.reportContent(table, id, 'Revealing of personal information', user_id);
         }
       },{
         text: 'Abuse or spam',
         handler: data => {
           this.reportContent(table, id, 'Abuse or spam', user_id);
         }
       },{
         text: 'Another reason',
         handler: data => {
           let prompt2 = this.alertCtrl.create({
            title: "Explain your reason of report",
            message: "",
            inputs: [
              {
                name: 'reason',
                placeholder: 'Reason of report'
              },
            ],
            buttons: [
              {
                text: 'Cancel',
                handler: data => {}
              },
              {
                text: 'Report',
                handler: data => {
                  this.reportContent(table, id, data.reason, user_id);
                }
              }
            ]
          });
          prompt2.present();
         }
       },{
         text: 'Cancel',
         handler: data => {}
       }
     ]
   });
   prompt.present();
  }

  private reportContent(table, id, reason_text, user_id) {

    let canInteract = this.reportInteractions.canInteract(id,table);

    if(canInteract) {
      let headers = new Headers();

      headers.append('Content-Type', 'application/json');

      let body = {
        user_id: this.userInformation._user_id,
        user_content_creator_id: user_id,
        table_id: id,
        table: table,
        reason: reason_text
      };

      console.log(body)

      this.http.post(this.globals._https_uri + 'abuse/reportpostcontent', JSON.stringify(body), {headers:headers})
      .map(res => res.json())
      .subscribe(data => {
        // save to report_interactions

        this.reportInteractions.saveReport(id, table);

        console.log(data);
        let toast = this.toastCtrl.create({
          message: 'Thank you for keeping Flowly clean!',
          duration: 3000,
          position: 'top',
          showCloseButton: true
        });
        toast.present();
      })
    } else {
      let toast = this.toastCtrl.create({
        message: "You've already reported this " + table,
        duration: 3000,
        position: 'top',
        showCloseButton: true
      });
      toast.present();
    }

  }

  public loadPost(post_id) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      user_id: this.userInformation._user_id,
      post_id: post_id
    };

    console.log(body)

    this.http.post(this.globals._https_uri + 'standaloneflow', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {

      this.finishedLoading = true;

      if(data.success) {
        this.post = data.flow_response_dynamic[0];
        console.log(this.post)
      } else {
        let toast = this.toastCtrl.create({
          message: data.message,
          duration: 3000,
          position: 'top',
          showCloseButton: true
        });
        toast.present();
      }
    })
  }

  //comment funcs.
  updateVote(like, dislike, id) {

  for(let i = 0; i < this.post['post_comments'].length; i++) {
    let comment = this.post['post_comments'][i];
    if(comment['comment_id'] === id) {

      this.post['post_comments'][i]['comment_likes'] += like;
      this.post['post_comments'][i]['comment_dislikes'] += dislike;
    }
  }
}

  public createContact(contact_id) {
    let toast;

    if(this.userInformation._logged_in) {
      if(contact_id > 0) {

        let confirm = this.alertCtrl.create({
          title: 'Are you sure to request a connection with this user?',
          message: 'As soon as the user accepts your request, you can connect.',
          buttons: [
            {
              text: 'Cancel',
              handler: () => {}
            },
            {
              text: "I'm sure",
              handler: () => {
                let headers = new Headers();
                headers.append('Content-Type', 'application/json');

                let body = {
                  user_id: this.userInformation._user_id,
                  user_contact_id: contact_id,
                  met_by_post_id: this.post['post_id']
                };

                console.log(body)

                this.http.post(this.globals._https_uri + 'contacts/createcontact', JSON.stringify(body), {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                  console.log(data)
                  if(data.success) {
                    toast = this.toastCtrl.create({
                      message: "A request has been sent!",
                      duration: 3000,
                      position: 'top'
                    });
                  } else {
                    toast = this.toastCtrl.create({
                      message: data.message,
                      duration: 3000,
                      position: 'top',
                      showCloseButton: true
                    });
                  }
                  toast.present();
                })
              }
            }
          ]
        });
        confirm.present();

      } else {
        toast = this.toastCtrl.create({
          message: "This user doesn't have an account!",
          duration: 3000,
          position: 'top',
          showCloseButton: true
        });
        toast.present();
      }
    } else {
      toast = this.toastCtrl.create({
        message: "Create an account to connect with others",
        duration: 3000,
        position: 'top',
        showCloseButton: true
      });
      toast.present();
    }
  }

  public disableCommentInteractionBtn(isLike, comment_id) {
    let arr_;

    if(isLike) {
      arr_ = this.commentInteractions.getLikes();
    } else {
      arr_ = this.commentInteractions.getLikes();
    }

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

  commentInput(value) {
    if(value.length > 0) {
      this.messageSend = true;
    } else {
      this.messageSend = false;
    }
  }

  scrollBottom() {
    this.content.scrollToBottom();
  }

  postComment() {

    this.messageSend = false; // lock message send button.

    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    let body = {
      comment_user_id: this.userInformation._user_id,
      comment_content: this.comment,
      comment_location: 'Kalmar',
      comment_post_id: this.post['post_id']
    };

    console.log(body);

    this.http.post(this.globals._https_uri + 'newcomment', JSON.stringify(body), {headers:headers})
    .map(res => res.json())
    .subscribe(data => {
      console.log(data)
      if(data.success) {
          this.channel.publish('update', 'true');

          let obj = {
            comment_content: this.comment,
            comment_date: 'Publishing...',
            comment_likes: 0,
            comment_dislikes: 0
          }
          this.post['post_comments'].push(obj);

          this.scrollBottom(); // scroll

          this.comment = ""; // clear
      } else {
        let alert = this.alertCtrl.create({
           title: 'Could not comment at the moment!',
           subTitle: data.message,
           buttons: ['OK']
         });
         alert.present();
      }
    })
  }

  ionViewDidLoad() {
    // probably a push from profile page Viewflow()
    if(this.post['post_content'] === undefined) {
      console.log("yes")
      this.loadPost(this.post['post_id']);
    } else {
      this.finishedLoading = true;
    }
  }

}
