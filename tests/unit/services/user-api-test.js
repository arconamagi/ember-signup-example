import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | user-api', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.service = this.owner.lookup('service:user-api');
  });

  test('it exists', function (assert) {
    assert.ok(this.service);
  });

  test('should fetch checkUnoccupied correctly', async function (assert) {
    let response;
    this.server.post('/check', function (_, request) {
      response = JSON.parse(request.requestBody);
      return { ok: true };
    }, 200);

    await this.service.checkUnoccupied('userName');
    assert.deepEqual(response, {
      username: 'userName'
    });
  });

  test('should call signUp correctly', async function (assert) {
    let response;
    this.server.post('/signup', function (_, request) {
      response = JSON.parse(request.requestBody);
      return { ok: true };
    }, 200);

    const params = {
      username: 'user',
      password: '1234',
      email: 'a@b.com'
    };

    await this.service.signUp(params);

    assert.deepEqual(response, params);
  });
});
