import { Response } from 'ember-cli-mirage';
import ENV from 'ember-signup-example/config/environment';
import { isEmptyObject } from 'ember-signup-example/utils/checks'
import {
  VALIDATION_CANT_BE_BLANK_MSG,
  VALIDATION_INVALID_EMAIL_MSG,
  VALIDATION_USERNAME_TAKEN_MSG
} from 'ember-signup-example/constants';

// Error constants
const ERRORS = {
  BLANK: {
    code: 'blank',
    message: VALIDATION_CANT_BE_BLANK_MSG
  },
  USERNAME_TAKEN: {
    code: 'already_taken',
    message: VALIDATION_USERNAME_TAKEN_MSG
  },
  INVALID_EMAIL: {
    code: 'invalid_email',
    message: VALIDATION_INVALID_EMAIL_MSG
  },
  THROTTLED: {
    code: 'throttle',
    message: 'Your request was throttled. Please try again in 56 sec.'
  }
};

const THROTTLE_TIME = 56 * 1000;

/**
 * Check if a request was throttled.
 * @param {string} url
 * @return {boolean|Response} Response with ERRORS.THROTTLED error, or `false` if not throttled.
 */
function requestThrottled({ url }) {
  if (ENV.environment === 'test') {
    // Don't check in test environment
    return false;
  }

  const lastAccessTime = requestThrottled.lastAccessTimes[url];
  const currentTime = new Date();
  if (lastAccessTime && currentTime - lastAccessTime < THROTTLE_TIME) {
    return errorResponse({ non_field_errors: ERRORS.THROTTLED }, 429);
  }
  requestThrottled.lastAccessTimes[url] = currentTime;
  return false;
}
requestThrottled.lastAccessTimes = {};

/**
 * Helper function for a successful response.
 * @return {{ok: boolean}}
 */
function okResponse() {
  return { ok: true };
}

/**
 * Returns a Response with specified errors and error code.
 * @param {Object} errors
 * @param {number} code
 * @return {Response}
 */
function errorResponse(errors, code = 400) {
  return new Response(code, {}, { errors });
}

export default function () {
  // this.namespace = 'api/v1';
  this.timing = 800;      // delay for each request, automatically set to 0 during testing

  this.post('/check', function ({ users }, request) {
    try {
      const parsed = JSON.parse(request.requestBody) || {};

      // validate username - it shouldn't be empty and occupied
      let errors = {};
      const username = String(parsed.username).trim();
      if (!parsed.username || !username) {
        errors.username = ERRORS.BLANK;
      } else {
        // check if user with specified username was already registered
        const userExists = users.findBy({ username });
        if (userExists) {
          errors.username = ERRORS.USERNAME_TAKEN;
        }
      }

      if (!isEmptyObject(errors)) {
        return errorResponse(errors);
      }

      return okResponse();

    } catch (e) {
      return errorResponse({}, 500);
    }
  });

  this.post('/signup', function ({ users }, request) {
    try {
      const throttledError = requestThrottled(request);
      if (throttledError) {
        return throttledError;
      }

      const parsed = JSON.parse(request.requestBody) || {};

      let errors = {};
      // errors.username = ERRORS.BLANK;errors.password = ERRORS.BLANK;errors.email = ERRORS.INVALID_EMAIL;

      // validate username - it shouldn't be empty and occupied
      const username = String(parsed.username).trim();
      if (!parsed.username || !username) {
        errors.username = ERRORS.BLANK;
      } else {
        // check if user with specified username was already registered
        const userExists = users.findBy({ username });
        if (userExists) {
          errors.username = ERRORS.USERNAME_TAKEN;
        }
      }

      // validate password - it shouldn't be empty
      const password = String(parsed.password);
      if (!parsed.password) {
        errors.password = ERRORS.BLANK;
      }

      // validate email - it shouldn't be empty & should be email
      const email = String(parsed.email).trim();
      const emailIsValid = /\S+@\S+\.\S+/.test(email);
      if (!parsed.email) {
        errors.email = ERRORS.BLANK;
      } else if (!emailIsValid) {
        errors.email = ERRORS.INVALID_EMAIL;
      }

      if (!isEmptyObject(errors)) {
        return errorResponse(errors);
      }

      // Validations were passed - create a user model
      users.create({ username, password, email });

      return okResponse();

    } catch (e) {
      return errorResponse({}, 500);
    }
  });
}
