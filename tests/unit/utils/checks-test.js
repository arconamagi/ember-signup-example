import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { isEmptyObject } from 'ember-signup-example/utils/checks';

module('Unit | Utils | checks-test', function (hooks) {
  setupTest(hooks);

  test('isEmptyObject should work correctly', function (assert) {
    assert.equal(isEmptyObject(undefined), false);
    assert.equal(isEmptyObject(null), false);
    assert.equal(isEmptyObject([]), false);
    assert.equal(isEmptyObject([1, '2']), false);
    assert.equal(isEmptyObject(''), false);
    assert.equal(isEmptyObject('abc'), false);
    assert.equal(isEmptyObject(1), false);
    assert.equal(isEmptyObject({}), true);
    assert.equal(isEmptyObject({ a: 1 }), false);
  });
});
