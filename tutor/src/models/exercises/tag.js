import {
  BaseModel, identifiedBy, belongsTo, identifier, field, session, hasMany,
} from '../base';

@identifiedBy('exercises/tag')
export default class ExerciseTag extends BaseModel {

  @identifier id;
  @field data;
  @field is_visible;
  @field type;

}
