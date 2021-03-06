// will eventually hook into data loading/saving using the
// derived model's identifiedBy strings
import { computed, action } from 'mobx';
import { find, isNil, get } from 'lodash';

const FLUX_NEW = /_CREATING_/;
import lazyGetter from './helpers/lazy-getter.js';
import ModelApi from './model/api';
import './model/types';

export class BaseModel {

  constructor(attrs) {
    if (attrs) { this.update(attrs); }
  }

  @lazyGetter api = new ModelApi();

  @computed get isNew() {
    const idField = find(Array.from(this.constructor.$schema.values()), { type: 'identifier' });
    const id = this[idField.name];
    return isNil(id) || FLUX_NEW.test(id);
  }

  @action ensureLoaded() {
    if (!this.api.isPending && !this.api.hasBeenFetched) { this.fetch(); }
  }

  @action onApiRequestComplete({ data }) {
    this.update(data);
  }

  @action
  setApiErrors(error) {
    const errors = get(error, 'response.data.errors');
    if (errors) {
      this.api.errors = {};
      errors.forEach(e => this.api.errors[e.code] = e);
      error.isRecorded = true;
    } else {
      this.api.errors = null;
    }
  }

}

// export decorators so they can be easily imported into model classes
export {
  identifiedBy, identifier, hasMany, belongsTo, field, session,
} from 'mobx-decorated-models';

export {
  computed,
  observable,
  action,
} from 'mobx';
