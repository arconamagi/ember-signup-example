import Route from '@ember/routing/route';

export default Route.extend({
  redirect: function () {
    // Silently redirect to index page
    this.transitionTo('index');
  }
});
