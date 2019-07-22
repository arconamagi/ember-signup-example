import EmberObject from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import {
  VALIDATION_CANT_BE_BLANK_MSG,
  VALIDATION_INVALID_EMAIL_MSG,
  VALIDATION_PASSWORD_MAX_LENGTH,
  VALIDATION_PASSWORD_MIN_LENGTH,
  VALIDATION_PASSWORDS_NOT_MATCH
} from 'ember-signup-example/constants';

const PRESENCE_IGNORE_BLANK = {
  presence: true,
  ignoreBlank: true,
  message: VALIDATION_CANT_BE_BLANK_MSG
};

/**
 * Sign Up Form fields validation rules, see `ember-cp-validations` package for more details.
 */
const Validations = buildValidations({
    email: [
      validator('presence', PRESENCE_IGNORE_BLANK),
      validator('format', {
        type: 'email',
        message: VALIDATION_INVALID_EMAIL_MSG
      })
    ],

    username: [
      validator('presence', PRESENCE_IGNORE_BLANK),
      validator('username-unoccupied')
    ],

    password: [
      validator('presence', PRESENCE_IGNORE_BLANK),
      validator('length', {
        min: VALIDATION_PASSWORD_MIN_LENGTH,
        max: VALIDATION_PASSWORD_MAX_LENGTH
      })
    ],

    confirmPassword: [
      validator('confirmation', {
        on: 'password',
        message: VALIDATION_PASSWORDS_NOT_MATCH
      })
    ]
  },
  {
    debounce: 500
  }
);

/**
 * This is an EmberObject, "form model" for `SignupFormComponent` which stores form fields
 * and allows a client-side form fields validation.
 *
 * @class SignUpFormModel
 */
export default EmberObject.extend(Validations, {
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
});
