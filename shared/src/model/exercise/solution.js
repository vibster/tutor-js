import {
  BaseModel, identifiedBy, identifier, field, identifier, hasMany, belongsTo,
} from '../../model';

@identifiedBy('exercise/solution')
export default class ExerciseSolution extends BaseModel {

  @field content_html;
  @field solution_type;
  @hasMany({ model: 'exercise/attachment' }) attachments;

  // set via inverseOf
  @belongsTo({ model: 'exercise/question' }) question;
}
