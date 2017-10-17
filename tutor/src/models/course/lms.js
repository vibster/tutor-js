import { filter } from 'lodash';
import { computed, observable } from 'mobx';
import {
  BaseModel, identifiedBy, identifier, field, session, belongsTo,
} from '../base';

@identifiedBy('course/lms')
export default class CourseLMS extends BaseModel {

  @observable course;

  @identifier id;
  @session key;
  @session secret;
  @session url;
  @session xml;

  @session({ type: 'date' }) created_at;
  @session({ type: 'date' }) updated_at;

  @belongsTo({ model: 'course' }) course;

  // called by API
  pushScores() {}
  fetch() { }

}
