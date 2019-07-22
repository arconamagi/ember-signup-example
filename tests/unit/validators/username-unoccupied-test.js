import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { HttpError, ValidationErrors } from 'ember-signup-example/utils/errors';
import { HTTP_RESPONSE_UNEXPECTED_MSG } from 'ember-signup-example/constants';

module('Unit | Validator | username-unoccupied', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.userApiService = this.owner.lookup('service:user-api');
    this.validator = this.owner.lookup('validator:username-unoccupied');
  });

  test('it exists', function (assert) {
    assert.ok(this.validator);
  });

  test('should return false for empty username', async function (assert) {
    assert.notOk(await this.validator.validate(''));
  });

  test('should return true on api success', async function (assert) {
    this.userApiService.checkUnoccupied = () => Promise.resolve();
    assert.ok(await this.validator.validate('name'));
  });

  test('should return error message on api failure', async function (assert) {
    let error = new HttpError('Http Error');
    this.userApiService.checkUnoccupied = () => Promise.reject(error);
    assert.equal(await this.validator.validate('name'), 'Http Error');

    error = new ValidationErrors({ username: { message: 'value' } });
    assert.equal(await this.validator.validate('name'), 'value');

    error = 'unknown';
    assert.equal(await this.validator.validate('name'), HTTP_RESPONSE_UNEXPECTED_MSG);
  });

});
