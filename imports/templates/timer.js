import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Meteor.startup(() => {
  Template.timer.onCreated(function() {
    this.time = new ReactiveVar(10); // Set the initial countdown time in seconds
  });

  Template.timer.onRendered(function() {
    const instance = this;
    const interval = setInterval(function() {
      let currentTime = instance.time.get();
      if (currentTime > 0) {
        instance.time.set(currentTime - 1);
      } else {
        clearInterval(interval);
        window.location.href = "https://example.com"; // Redirect URL
      }
    }, 1000); // Update every second
  });

  Template.timer.helpers({
    time() {
      return Template.instance().time.get();
    }
  });
});