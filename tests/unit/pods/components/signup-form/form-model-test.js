import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockSignUpFormModelData } from 'ember-signup-example/tests/helpers/mock-signup-model-form';

module('Unit | Components | signup-form | form-model', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    /**
     * @type SignUpFormModel
     */
    this.formModel = this.owner.factoryFor('form-model:components/signup-form').create();
  });

  test('it exists', function (assert) {
    assert.ok(this.formModel);
  });

  test('should raise validation errors for empty form', async function (assert) {
    const { validations } = await this.formModel.validate();

    assert.notOk(validations.isValid);
    assert.equal(validations.errors.length, 6);
  });

  test('should pass validation for correctly filled form', async function (assert) {
    this.formModel.setProperties(mockSignUpFormModelData());

    const { validations } = await this.formModel.validate();

    assert.ok(validations.isValid);
    assert.equal(validations.errors.length, 0);
  });
});
