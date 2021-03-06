import {
  BaseModel, identifiedBy, identifier, session, field, hasMany, computed, action,
} from '../model';
import { reduce, map, filter, find, inRange, merge } from 'lodash';
import invariant from 'invariant';
import Attachment from './exercise/attachment';
import Author from './exercise/author';
import Question from './exercise/question';
import Tag from './exercise/tag';

export { Attachment, Author, Question, Tag };

@identifiedBy('exercise')
export default class Exercise extends BaseModel {

  static build(attrs) {
    return new this(merge(attrs, { questions: [{ }] }));
  }

  @identifier uuid;
  @field id;
  @field uid;
  @field version;
  @field nickname;
  @field({ type: 'array' }) versions;
  @field({ type: 'array' }) formats;
  @field is_vocab;
  @field number;
  @field stimulus_html;
  @session wrapper;

  @hasMany({ model: Attachment }) attachments;
  @hasMany({ model: Author }) authors;
  @hasMany({ model: Author })  copyright_holders;
  @hasMany({ model: Question, inverseOf: 'exercise' }) questions;
  @hasMany({
    model: Tag,
    extend: {
      withType(type, { multiple = false } = {}) {
        return multiple ? filter(this, { type }) : find(this, { type });
      },
      findOrAddWithType(type) {
        return this.withType(type) || this.get(this.push(`${type}:`) - 1);
      },
    },
  }) tags;

  @computed get hasFreeResponse() {
    return this.formats.includes('free-response');
  }

  @computed get pool_types() {
    return [];
  }

  @computed get cnxModuleUUIDs() {
    return map(filter(this.tags, { type: 'context-cnxmod' }), 'value');
  }

  @computed get validity() {
    return reduce(this.questios, (memo, question) => ({
      valid: memo.valid && question.validity.valid,
      part: memo.part || question.validity.part,
    }) , { valid: true });
  }

  @action toggleMultiPart() {
    if (this.isMultiPart) {
      this.questions.slice(1);
    } else {
      this.questions.push({});
    }
  }

  @action moveQuestion(question, offset) {
    const index = this.questions.indexOf(question);
    invariant((index !== -1) && inRange(index+offset, 0, this.questions.length),
      'question not found or cannot move past bounds');
    this.questions.splice(index+offset, 0, this.questions.splice(index, 1)[0]);
  }

  @computed get isMultiPart() {
    return this.questions.length > 1;
  }

  @computed get isPublishable() {
    return Boolean(!this.isNew && this.validity.valid);
  }
}
