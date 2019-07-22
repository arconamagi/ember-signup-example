import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import BaseValidator from 'ember-cp-validations/validators/base';
import EmberObject from '@ember/object';
import {
  VALIDATION_CANT_BE_BLANK_MSG,
  VALIDATION_INVALID_EMAIL_MSG,
  VALIDATION_PASSWORDS_NOT_MATCH,
  VALIDATION_USERNAME_TAKEN_MSG
} from 'ember-signup-example/constants';
import { mockSignUpFormModelData } from 'ember-signup-example/tests/helpers/mock-signup-model-form';

module('Integration | Component | signup-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`{{signup-form}}`);

    assert.notEqual(this.element.textContent.trim(), '');
  });

  // Shared helper functions
  function assertNoValidationErrors({ elementSelector, assert }) {
    assert.dom(elementSelector + '.invalid-feedback').doesNotExist();
  }

  async function submit() {
    await click('.qa-btn-submit');
  }

  module('Client-side validations', function (hooks) {

    // Client-side validations helper functions
    async function renderAndAssertNoValidationErrors({ elementSelector, assert }) {
      await render(hbs`{{signup-form}}`);

      // Check that no errors are shown initially
      assertNoValidationErrors({ elementSelector, assert });
    }

    async function assertCantBeBlankError({ elementSelector, assert }) {
      await fillIn(elementSelector + ' input', '');
      await triggerEvent(elementSelector + ' input', 'focusout');

      // Ensure that error is shown
      assert.dom(elementSelector).containsText(VALIDATION_CANT_BE_BLANK_MSG);
    }

    async function assertValidationError({ elementSelector, fillInValue, errorMessage, assert }) {
      await fillIn(elementSelector + ' input', fillInValue);

      await triggerEvent(elementSelector + ' input', 'focusout');

      // Ensure that error is shown
      assert.dom(elementSelector).containsText(errorMessage);
    }

    hooks.beforeEach(function () {
      /**
       * This function overrides username-unoccupied validator with specified `value`.
       * @param {string|boolean} value Value which validator will always return if
       * username is not empty.
       */
      this.setUsernameUnoccupiedValidatorValue = (value) => {
        const validator = BaseValidator.extend({
          validate(username) {
            return username ? value : true;
          }
        });
        this.owner.register('validator:username-unoccupied', validator);
      };

      this.setUsernameUnoccupiedValidatorValue(true);
    });

    test('should show successful registration sub-page on correct input', async function (assert) {
      await render(hbs`{{signup-form}}`);

      await fillIn('.qa-email input', 'valid@email.com');
      await fillIn('.qa-username input', 'someUsername');
      await fillIn('.qa-password input', 'qwerty');
      await fillIn('.qa-confirm-password input', 'qwerty');

      // mock signUp() method of user-api service
      this.owner.lookup('service:user-api').signUp = () => Promise.resolve();

      await submit();

      assert.dom().containsText('successfully registered');
      assert.dom().containsText('someUsername');
    });

    test('should show error on invalid email', async function (assert) {
      const elementSelector = '.qa-email';

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await assertCantBeBlankError({ elementSelector, assert });

      await assertValidationError({
        elementSelector, assert,
        fillInValue: 'invalid@email',
        errorMessage: VALIDATION_INVALID_EMAIL_MSG
      });
    });

    test('should show error on invalid username', async function (assert) {
      const elementSelector = '.qa-username';

      // Set username-unoccupied validator to always return an error if not empty
      const occupiedError = 'username-unoccupied error';
      this.setUsernameUnoccupiedValidatorValue(occupiedError);

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await fillIn(elementSelector + ' input', '');
      await assertCantBeBlankError({ elementSelector, assert });

      await assertValidationError({
        elementSelector, assert,
        fillInValue: 'duplicateUsername',
        errorMessage: occupiedError
      });
    });

    test('should show error on invalid password', async function (assert) {
      const elementSelector = '.qa-password';

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await assertCantBeBlankError({ elementSelector, assert });

      await assertValidationError({
        elementSelector, assert,
        fillInValue: '1',
        errorMessage: 'too short'
      });

      await assertValidationError({
        elementSelector, assert,
        fillInValue: '12345678901234567890',
        errorMessage: 'too long'
      });
    });

    test('should show error on invalid confirmation password', async function (assert) {
      const elementSelector = '.qa-confirm-password';

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await assertValidationError({
        elementSelector, assert,
        fillInValue: '12345',
        errorMessage: VALIDATION_PASSWORDS_NOT_MATCH
      });

      // Fill the password with the same value - error should disappear
      await fillIn('.qa-password input', '12345');
      assertNoValidationErrors({ elementSelector, assert });
    });

  });

  module('Server API validations', function (hooks) {
    setupMirage(hooks);

    // Server API validations helper functions
    async function renderAndAssertNoValidationErrors({ elementSelector, assert }) {
      await render(hbs`{{signup-form model=model}}`);

      // Check that no errors are shown initially
      assertNoValidationErrors({ elementSelector, assert });
      submitButtonInNormalState({ assert });
    }

    async function assertCantBeBlankError({ elementSelector, assert }) {
      await fillIn(elementSelector + ' input', '');

      await submit();

      // Ensure that error is shown
      assert.dom(elementSelector).containsText(VALIDATION_CANT_BE_BLANK_MSG);
      submitButtonInErrorState({ assert });
    }

    async function assertValidationError({
      elementSelector, fillInValue, errorMessage, assert, checkButtonState = true}) {
      await fillIn(elementSelector + ' input', fillInValue);

      await submit();

      // Ensure that error is shown
      assert.dom(elementSelector).containsText(errorMessage);
      checkButtonState && submitButtonInErrorState({ assert });
    }

    function submitButtonInNormalState({ assert }) {
      assert.dom('.qa-btn-submit').doesNotHaveClass('btn-danger');
    }

    function submitButtonInErrorState({ assert }) {
      assert.dom('.qa-btn-submit').hasClass('btn-danger');
    }

    hooks.beforeEach(function () {
      // Create a model which always passes client-side validation.
      this.set('model', EmberObject.create({
        ...mockSignUpFormModelData(),
        validate() {
          return Promise.resolve({ validations: { isValid: true } });
        }
      }));
    });

    test('should show successful registration sub-page on correct input', async function (assert) {
      await render(hbs`{{signup-form}}`);

      await fillIn('.qa-email input', 'valid@email.com');
      await fillIn('.qa-username input', 'someUsername');
      await fillIn('.qa-password input', 'qwerty');
      await fillIn('.qa-confirm-password input', 'qwerty');

      await submit();

      assert.dom().containsText('successfully registered');
      assert.dom().containsText('someUsername');
    });

    test('should show error on invalid email', async function (assert) {
      const elementSelector = '.qa-email';

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await assertCantBeBlankError({ elementSelector, assert });

      await assertValidationError({
        elementSelector, assert,
        fillInValue: 'invalid@email',
        errorMessage: VALIDATION_INVALID_EMAIL_MSG
      });
    });

    test('should show error on invalid username', async function (assert) {
      const elementSelector = '.qa-username';

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await assertCantBeBlankError({ elementSelector, assert });

      await fillIn(elementSelector + ' input', 'duplicateUsername');

      // Simulate the same user already registered on the server
      await this.owner.lookup('service:user-api').signUp(this.model);

      await assertValidationError({
        elementSelector, assert,
        fillInValue: 'duplicateUsername',
        errorMessage: VALIDATION_USERNAME_TAKEN_MSG
      });
    });

    test('should show http error if username server validation fails', async function (assert) {
      const elementSelector = '.qa-username';

      await render(hbs`{{signup-form}}`);

      // Mock 500 Internal Server Error
      this.server.post('/check', {}, 500);

      await assertValidationError({
        elementSelector, assert,
        fillInValue: 'anyUsername',
        errorMessage: 'Internal Server Error',
        checkButtonState: false
      });

      // Mock invalid JSON error
      this.server.post('/check', () => '#', 200);

      await assertValidationError({
        elementSelector, assert,
        fillInValue: 'username2',
        errorMessage: 'Unexpected token #',
        checkButtonState: false
      });
    });

    test('should show error on invalid password', async function (assert) {
      const elementSelector = '.qa-password';

      await renderAndAssertNoValidationErrors({ elementSelector, assert });

      await assertCantBeBlankError({ elementSelector, assert });
    });

    test('should show network/server errors on a failed response', async function (assert) {
      await render(hbs`{{signup-form model=model}}`);

      this.mockErrorAndTest = async (errValue, errCode, expectText) => {
        this.server.post('/signup', errValue, errCode);
        await submit();
        assert.dom('.qa-form-errors').containsText(expectText);
      };

      // Mock 500 Internal Server Error
      await this.mockErrorAndTest({}, 500, 'Internal Server Error');

      // Mock invalid JSON error
      await this.mockErrorAndTest(() => '#', 200, 'Unexpected token #');

      // Mock throttle error
      await this.mockErrorAndTest({
        errors: { non_field_errors: { code: 'throttle', message: 'Your request was throttled' } }
      }, 429, 'throttled');
    });
  });

});
