import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  HttpError, isHttpError,
  normalizeResponseErrors,
  ValidationErrors, isValidationErrors
} from 'ember-signup-example/utils/errors';

module('Unit | Utils | errors-test', function (hooks) {
  setupTest(hooks);

  test('isHttpError should work correctly', function (assert) {
    assert.notOk(isHttpError(undefined));
    assert.notOk(isHttpError(null));
    assert.notOk(isHttpError([]));
    assert.notOk(isHttpError([1, '2']));
    assert.notOk(isHttpError(''));
    assert.notOk(isHttpError('abc'));
    assert.notOk(isHttpError(1));
    assert.notOk(isHttpError({}));
    assert.notOk(isHttpError({ a: 1 }));
    assert.ok(isHttpError(new HttpError('Http Error')));
    assert.notOk(isHttpError(new ValidationErrors({ field: 'value' })));
  });

  test('isValidationErrors should work correctly', function (assert) {
    assert.notOk(isValidationErrors(undefined));
    assert.notOk(isValidationErrors(null));
    assert.notOk(isValidationErrors([]));
    assert.notOk(isValidationErrors([1, '2']));
    assert.notOk(isValidationErrors(''));
    assert.notOk(isValidationErrors('abc'));
    assert.notOk(isValidationErrors(1));
    assert.notOk(isValidationErrors({}));
    assert.notOk(isValidationErrors({ a: 1 }));
    assert.notOk(isValidationErrors(new HttpError('Http Error')));
    assert.ok(isValidationErrors(new ValidationErrors({ field: 'value' })));
  });

  test('normalizeResponseErrors should work correctly', function (assert) {
    const unexpected = { non_field_errors: { message: 'Unexpected server response' } };
    assert.deepEqual(normalizeResponseErrors(undefined), {});
    assert.deepEqual(normalizeResponseErrors(null), {});
    assert.deepEqual(normalizeResponseErrors([]), unexpected);
    assert.deepEqual(normalizeResponseErrors([1, '2']), unexpected);
    assert.deepEqual(normalizeResponseErrors(''), {});
    assert.deepEqual(normalizeResponseErrors('abc'), unexpected);
    assert.deepEqual(normalizeResponseErrors(1), unexpected);
    assert.deepEqual(normalizeResponseErrors({}), unexpected);
    assert.deepEqual(normalizeResponseErrors({ a: 1 }), unexpected);

    assert.deepEqual(normalizeResponseErrors(new HttpError('Http Error')),
      { non_field_errors: { message: 'Http Error' } });
    assert.deepEqual(normalizeResponseErrors(new ValidationErrors({ field: 'value' })),
      { field: 'value' });
  });
});
