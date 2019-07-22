import BaseValidator from 'ember-cp-validations/validators/base';
import { inject as service } from '@ember/service';
import { isValidationErrors, isHttpError } from 'ember-signup-example/utils/errors';
import { HTTP_RESPONSE_UNEXPECTED_MSG } from 'ember-signup-example/constants';

/**
 * Asynchronous validator for 'ember-cp-validations' which asks server if
 * username is not occupied yet.
 */
export default BaseValidator.extend({
  /**
   * @type UserApiService
   */
  userApi: service(),

  /**
   * Asynchronously checks if specified username is not occupied yet.
   *
   * @param username Username to check
   * @return {boolean|Promise<boolean|string>} true if unoccupied, error string otherwise
   */
  validate(username) {
    if (String(username).trim() === '') {
      // Empty username is not allowed
      return false;
    }
    return this.userApi.checkUnoccupied(username).then(() => true)
      .catch(error => {
        if (isValidationErrors(error)) {
          if (error.errors.username) {
            return error.errors.username.message;
          }
        }
        if (isHttpError(error)) {
          return error.message;
        }
        return HTTP_RESPONSE_UNEXPECTED_MSG;
      });
  }
});
