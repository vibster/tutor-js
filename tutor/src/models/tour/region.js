import {
  BaseModel, identifiedBy, field, identifier, computed,
} from 'shared/model';

// TourRegion
// Wraps an area of the screen, maps it's id to a given set of audience tags

@identifiedBy('tour/region')
export default class TourRegion extends BaseModel {

  @identifier id;
  @field courseId;

  @field({ type: 'array' }) otherTours;

  @computed get tour_ids() {
    // this seems convoluted, but this makes it so that `tour_ids` will react
    // to `otherTours` updates.  see https://github.com/openstax/tutor-js/pull/1726#discussion_r122459935
    // for more details.
    return this.otherTours.reverse().concat( [this.id] ).reverse();
  }

  @computed get domSelector() {
    return `[data-tour-region-id="${this.id}"]`;
  }

}
