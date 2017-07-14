import {
  BaseModel, identifiedBy, field, hasMany,
} from './base';
import {  extend } from 'lodash';
import { action, observable, when,computed } from 'mobx';
import loadjs from 'loadjs';
import invariant from 'invariant';
import { Logging } from 'shared';
import User from './user';

let EMBED_URL = '';
let PRODUCT_UUID = '';

const REQUIRED_OPTIONS = [
  'course',
];

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function BAD_UUID() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

@identifiedBy('payments')
export default class Payments extends BaseModel {

  static bootstrap(data) {
    EMBED_URL = data.payments_embed_js_url;
    PRODUCT_UUID = data.payments_product_uuid;
  }

  @observable isBusy = false;
  @observable errorMessage = ''
  @observable element;
  @observable parentCallbacks;

  constructor(options) {
    super();
    this.options = options;
    REQUIRED_OPTIONS.forEach((key) =>
      invariant(options[key], `option ${key} was not set for payments`));
    when(
      () => !!this.element,
      this.fetch,
    );
  }

  close() {
    if (this.remote) {
      this.remote.close();
    }
  }

  @computed get callbacks() {
    return extend({}, this.parentCallbacks, {

    });
  }

  @computed get hasError() {
    return Boolean(this.errorMessage);
  }

  @action.bound
  fetch() {
    if (!EMBED_URL) { return this.logFailure('Attempted to load payments without a url set'); }
    this.isBusy = true;
    if (window.OSPayments) { // may already be loaded
      return this.createIframe();
    } else {
      return loadjs(EMBED_URL, {
        success: this.createIframe,
        error: (e) => this.logFailure(`Unable to request assets: ${e}`),
      });
    }
  }

  logFailure(msg) {
    this.errorMessage = msg;
    this.isBusy = false;
    Logging.error(msg);
  }

  get remotePaymentOptions() {

    const { options: { course } } = this;
    return extend({}, this.options, {
      product_uuid: PRODUCT_UUID,
      purchaser_account_uuid: BAD_UUID(), // User.account_uuid,
      product_end_date: course.ends_at, // TODO: course doesn't currently have the below UUIDs from BE
      product_instance_uuid: course.primaryRole.membership_uuid || BAD_UUID(),
      course_uuid: course.uuid || BAD_UUID(),
    });
  }

  @action.bound
  createIframe() {
    const { OSPayments } = window;
    this.remote = new OSPayments(this.remotePaymentOptions);
    this.remote.createIframe(this.element).then(() => {
      this.isBusy = false;
    });
  }

}
