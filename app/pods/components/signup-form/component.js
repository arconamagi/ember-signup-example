import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads, equal } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { normalizeResponseErrors } from 'ember-signup-example/utils/errors';

/**
 * This is a Sign Up Form component, which shows the form and validates fields input.
 * Validation is made in a `model` which can be provided or it will be created by
 * instantiating SignupFormModel (see `model` attribute).
 * Also, after the successful registration it shows second "sub-page", notifying about
 * the success (see `currentStep` attribute).
 *
 * Usage examples:
 * {{signup-form}}
 * {{signup-form model=model}}
 *
 * @class SignupFormComponent
 */
export default Component.extend({
  /**
   * @type UserApiService
   */
  userApi: service(),

  /**
   * Model which stores and validates a user-entered data. Should implement `validate()`
   * function, which returns a promise which resolves with { validations } object.
   *
   * @type SignUpFormModel
   */
  model: null,

  /**
   * Server-side errors.
   *
   * @type {Object.<string, { message: string, code: string }>}
   */
  errors: null,

  /**
   * Form-level error (global error message).
   *
   * @type string
   */
  formError: reads('errors.non_field_errors.message'),

  /**
   * Whether to show all errors on the form.
   * For example, needed when user clicks 'Submit'.
   *
   * @type boolean
   */
  showAllValidations: false,

  /**
   * Sign Up component consists of two "sub-pages" - one is a sign up form itself and the second
   * is shown after successful registration. `currentStep` contains the current page id.
   * Possible values - 'signup' or 'success'.
   *
   * @type string
   */
  currentStep: 'signup',

  /**
   * Checks whether current step is a sign up (not successful registration).
   *
   * @type boolean
   */
  isSignupStep: equal('currentStep', 'signup'),

  /**
   * Method called when component is instantiated.
   */
  init() {
    this._super(...arguments);
    if (!this.model) {
      // If model is not specified for this component, create a default SignUpFormModel
      const model = getOwner(this).factoryFor('form-model:components/signup-form').create();
      this.set('model', model);
      // Mark the model for deletion on component destroy (to prevent memory leak)
      this.set('_modelToDestroy', model);
    }
  },

  /**
   * Method called when component is destroyed.
   */
  destroy() {
    this._super(...arguments);
    if (this._modelToDestroy) {
      this._modelToDestroy.destroy();
    }
  },

  actions: {
    /**
     * Action is called on any input change. It clears error (if any) for a changed input.
     * @param {string} value
     * @param {SignupFormModel} model
     * @param {string} property
     * @see SignupFormComponent.errors
     */
    cleanFieldError(value, model, property) {
      const errorPath = 'errors.' + property;
      if (this.get(errorPath)) {
        this.set(errorPath, null);
      }
    },

    /**
     * Validates and submits a form using `user-api` service.
     * @return {Promise}
     */
    submit() {
      this.setProperties({
        showAllValidations: true,
        errors: null
      });

      // Execute client-side validation first
      return this.model.validate().then(({ validations }) => {
        if (validations.isValid) {
          // Client-side validation passed - try to sign up on a server
          return this.userApi.signUp(this.model.getProperties('email', 'password', 'username'))
            .then(() => {
              // User was successfully registered, show the second "sub-page".
              this.setProperties({
                showAllValidations: false,
                currentStep: 'success'
              });
            })
            .catch(error => {
              // HTTP or server-side validation error, update `errors` with the values from the server
              this.set('errors', normalizeResponseErrors(error));
              // Reject Promise so that form could show a failure state
              return Promise.reject();
            });
        }
        // Client-side validation error - reject Promise so that form could show a failure state
        return Promise.reject();
      });
    }
  }
});
