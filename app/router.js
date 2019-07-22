import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  // define signup page route
  this.route('signup');

  // catch undefined urls, and redirect to index page
  this.route('not-found', { path: '/*path' });
});

export default Router;
