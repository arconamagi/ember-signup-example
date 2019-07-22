import fetch from 'fetch';
import { isEmptyObject } from './checks';
import { HttpError, ValidationErrors } from './errors';

const defaultOptions = {
  // ...Place default options for `fetch` here...
};

/**
 * Makes a `fetch` request to a server.
 *
 * @param {string} url Url to use.
 * @param {string} method 'GET', 'POST', 'PUT', etc.
 * @param {Object=} data Data to send.
 * @param {Object=} options Additional options for a `fetch` request, for more details
 * see `fetch` specification.
 * @param {Function=} validateDataCb Callback which additionally checks if data from
 * the server is correct.
 * @return {Promise} Promise resolved if no errors were found,
 * otherwise promise is rejected with an error(s).
 */
export function fetchRequest({ url, method, data = null, options = {}, validateDataCb = null }) {
  let params = { method, ...defaultOptions, ...options };

  if (data) {
    // Prepare data and provide content-type
    params.body = JSON.stringify(data);
    if (!params.headers) {
      params.headers = {};
    }
    params.headers['Content-Type'] = 'application/json';
  }

  // Make a request and check errors
  return fetch(url, params)
    .catch(error => {
      // Catch HTTP errors
      throw new HttpError(error.message)
    })
    .then(response => response.json().then(
      data => {
        // Check if the response has any errors filled
        if (data && data.errors && !isEmptyObject(data.errors)) {
          throw new ValidationErrors(data.errors);
        }

        // Check if data is correct
        if (!validateDataCb || validateDataCb(data)) {
          return data;
        }

        // Something went wrong, throw HTTP error with statusText
        throw new HttpError(response.statusText);
      },
      error => {
        // Catch error during the parse of response.json()
        throw new HttpError(`Error parsing server's response: ${error.message}`);
      })
    );
}
