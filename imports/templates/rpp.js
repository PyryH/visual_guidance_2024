//this is the code for the chat box

import { Template } from 'meteor/templating';
import { Messages, Answers } from '../../database/collections.js';

import { questions, questions2 } from '../../imports/levels/questions.js';

//import './chat.html';
//import './templates.html';
//import '../../client/main.html';
import './rpp.html';


//here we choose whitch of the level.lists we want to use
var questions_to_use;
Tracker.autorun(function() {
  var level_list_choice = Session.get('use_levels'); 
  console.log('Here we choose level list ' + level_list_choice)
  if(level_list_choice ==2){
    questions_to_use = questions2;
    Session.set('html_trigger', 1);
  }
  else {
    questions_to_use = questions;
    Session.set('html_trigger', 0);
  }
});


function updateTimeSync() {
    Meteor.call('getServerTime', function(err, res) {
        if(!err) {
            Session.set('serverTimeComp', res);
            Session.set('localTimeComp', (new Date()).getTime());
        }
    });
}



function createAnswer(instance, answer) {
    var textArea = $(instance.firstNode).children('.area');
    var text = textArea.val();
    var answer = instance.data.answer;
    if(text && text !== "") {

        var nick = Session.get('nick');
        var chatId = Session.get('gridId');
        var block =Session.get('use_levels');
        var answerButton = answer;
        var timestamp = (new Date()).getTime() - Session.get('localTimeComp') + Session.get('serverTimeComp');
        var msg = {
            text: text,
            nick: nick,
            block: block,
            answer: answerButton,
            chatId: chatId,
            time: timestamp
        }
        Messages.insert(msg);  //insert answers here

        textArea.val("");
    }
};


/*Template.rpp_view.
(function (){
    var x =this.firstNode;
    console.log(x);
});
*/


Template.rpp_question.events({
    'click #saveAnswer'(event, instance) {
        createAnswer(instance);  
    },
    'keypress textarea'(event, instance) {
        if((event.keyCode | event.which) === 13) { //Enter key
            event.preventDefault();
            createAnswer(instance);
        }
    }
});



function pad(num) {
    var res = '' + num;
    if(res.length < 2) {
        res = '0' + res;
    }
    return res;
}


Tracker.autorun(function() {
    Session.get('html_trigger');
    Template.rpp_view.helpers({
        'questions1': questions_to_use[0],
        'questions2': questions_to_use[1],
        'questions3': questions_to_use[2],

    });
});

Template.rpp_view.onCreated(function() {
  this.currentQuestion = new ReactiveVar(0); // Start with the first question
  this.time = new ReactiveVar(10); // Set the initial countdown time in seconds
});

Template.rpp_view.onRendered(function() {
  const instance = this;
  const interval = setInterval(function() {
    let currentTime = instance.time.get();
    if (currentTime > 0) {
      instance.time.set(currentTime - 1);
    } else {
      let currentQuestion = instance.currentQuestion.get();
      if (currentQuestion < 2) {
        instance.currentQuestion.set(currentQuestion + 1);
        instance.time.set(10); // Reset the timer for the next question
      } else {
        clearInterval(interval);
        // Optionally, you can redirect or perform another action here
      }
    }
  }, 1000); // Update every second
});

Template.rpp_view.helpers({
  currentQuestion() {
    return Template.instance().currentQuestion.get();
  },
  time() {
    return Template.instance().time.get();
  },
  question() {
    const currentQuestion = Template.instance().currentQuestion.get();
    return questions_to_use[currentQuestion];
  }
});

Template.rpp_question.helpers({
    'answers': function() {
        updateTimeSync(); // update time sync for every new message
        var answer = Template.instance().data.answer;
        var block =Session.get('use_levels');
       
        var msgs = Messages.find({answer: answer, block: block}, { sort: { time: -1 }, transform: function(msg) {
            var time = new Date(msg.time);
            msg.time = time.getHours() + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds());
            msg.nick = msg.nick === Session.get('nick') ? 'You' : msg.nick;
            return msg;
        } }).fetch();

        // don't repeat nick header if messages are from same nick
        for(var i=msgs.length-2; i--; i>=0) {
            if(!msgs[i]) break;
            if(msgs[i].nick === msgs[i+1].nick) {
                msgs[i].hide_header = true;
            }
        }

        return msgs;
    }

})
