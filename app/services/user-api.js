import Service from '@ember/service';
import { fetchRequest } from 'ember-signup-example/utils/fetch-request';

/**
 * Encapsulates a server API related to a User.
 *
 * @class UserApiService
 */
export default Service.extend({
  /**
   * Makes an API call to check if specified username is not occupied yet.
   *
   * @param {string} username
   * @return {Promise} Promise resolved with { ok: true } if username is not occupied,
   * otherwise promise is rejected with an error.
   */
  checkUnoccupied(username) {
    return fetchRequest({
      url: '/check',
      method: 'POST',
      data: {
        username
      },
      validateDataCb: data => data && data.ok
    })
  },

  /**
   * Makes an API call to sign up user with specified data.
   *
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @return {Promise} Promise resolved with { ok: true } on success,
   * otherwise promise is rejected with an error.
   */
  signUp({ username, password, email }) {
    return fetchRequest({
      url: '/signup',
      method: 'POST',
      data: {
        email, password, username
      },
      validateDataCb: data => data && data.ok
    })
  }

});
