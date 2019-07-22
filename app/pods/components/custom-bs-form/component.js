import BsForm from 'ember-bootstrap/components/bs-form';

/**
 * This is a Form component from ember-bootstrap, with `OnChange` handler support.
 * `OnChange` is called when form's element was changed. Params for `OnChange` are
 * (value, model, property).
 *
 * Usage example:
 * {{#custom-bs-form model=model onChange=(action "onElementChange")
 *      onSubmit=(action "submit") as |form|}}
 *      ... content (see Form from ember-bootstrap) ...
 * {{/custom-bs-form}}
 */
export default BsForm.extend({
  actions: {
    change() {
      // In order to support `OnChange` handler, it's needed to override the default
      // `change` action and call `OnChange` in it.
      this._super(...arguments);
      this.onChange && this.onChange(...arguments);
    },
  }
});
