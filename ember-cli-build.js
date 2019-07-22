'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const postCssAutoprefixer = require('autoprefixer');
const postCssEasyImport = require('postcss-easy-import');
const postCssNested = require('postcss-nested');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // 'ember-cli-babel': {
    //   includePolyfill: true
    // },
    postcssOptions: {
      compile: {
        enabled: true,
        extension: 'css',
        plugins: [{
            module: postCssEasyImport,
            options: {
              extensions: ['.css']
            }
          },
          {
            module: postCssNested
          },
          {
            module: postCssAutoprefixer,
            options: {
              flexbox: 'no-2009'
            }
          }
        ]
      },
      filter: {
        enabled: false
      }
    },

    stylelint: {
      linterConfig: {
        configFile: '.stylelintrc',
        ignorePath: '.stylelintignore',
        syntax: 'css'
      }
    },

    'ember-bootstrap': {
      'bootstrapVersion': 4,
      'importBootstrapFont': false,
      'importBootstrapCSS': true
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
