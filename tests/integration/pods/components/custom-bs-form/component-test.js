import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { typeIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | custom-bs-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`{{custom-bs-form}}`);
    assert.equal(this.element.textContent.trim(), '');

    await render(hbs`{{#custom-bs-form}}Text{{/custom-bs-form}}`);
    assert.equal(this.element.textContent.trim(), 'Text');
  });

  test('should call onChange on inner input value change', async function (assert) {
    let onChangeArgs = null;
    this.set('model', { field: '' });
    this.set('onChange', function () {
      onChangeArgs = [...arguments];
    });

    await render(hbs`{{#custom-bs-form model=model onChange=(action this.onChange) as |form|}}
      {{form.element property="field"}} {{/custom-bs-form}}`);

    assert.equal(onChangeArgs, null,
      'onChange should not be called if inner input value didn\'t change');

    await typeIn('input', 'abc');

    assert.deepEqual(onChangeArgs, ['abc', { field: 'abc' }, 'field'],
      'onChange called as expected');
  });

});
