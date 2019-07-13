import { isEmpty } from '@ember/utils';

function filterByQueryParams (queryParams, dbRecords) {
  if (isEmpty(queryParams)) {
    // Return all records if no queryParams were specified
    return dbRecords.all();
  }

  // Process queryParams object and extract all keys from 'filter[*]' strings
  const queryKeys = Object.keys(queryParams)
    .map(queryParam => [...queryParam.matchAll(/filter\[(.+)\]/g)])
    .filter(matches => matches.length > 0)
    .map(matches => matches[0][1]);

  // Construct query object with { queryKey: valueToFind }
  const query = queryKeys.reduce(function (result, attr) {
    result[attr] = queryParams[`filter[${attr}]`];
    return result;
  }, {});

  return dbRecords.where(function (record) {
    // check if record matches the query
    return queryKeys.every(function(key) {
      const recordAttr = String(record[key]);
      const queryValue = String(query[key]);
      return Array.isArray(queryValue) ? queryValue.includes(recordAttr) :
        queryValue === recordAttr;
    });
  });
}

export default function() {
  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  this.namespace = 'api/v1';
  this.timing = 2800;      // delay for each request, automatically set to 0 during testing

  this.get('/users', function ({ users }, request) {
    return filterByQueryParams(request.queryParams, users);
  });

  this.post('/users');

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.4.x/shorthands/
  */
}
