import {
  computed, observable,
} from 'mobx';
import { includes, isNil } from 'lodash';

import BaseOnboarding from './base';
import { UiSettings } from 'shared';
import Nags from '../../../components/onboarding/nags';
import User from '../../user';
import { TimeStore } from '../../../flux/time';

const ONBOARDING_CHOICE = 'OBC';
const LAST_NAG_TIME = 'OBNT';
const NAG_INTERVAL = 1000 * 60 * 60 * 24 * 7; // 1 week in milliseconds

// NOTE - the strings for the key's below are meaningful and MUST match what's expected by the BE
const CHOICES = {
  cc: 'For course credit',
  exc: 'For extra credit',
  adr: 'As an additional resource',
  dn: 'I dont know yet',
  wu: 'I wont be using it',
};

export default class FullCourseOnboarding extends BaseOnboarding {

  @observable response = false;

  @computed get nagComponent() {
    if (this.otherModalsAreDisplaying) { return null; }

    if (this.displayInitialPrompt) {
      return Nags.freshlyCreatedCourse;
    } else if (includes(['cc', 'exc', 'adr'], this.response)) {
      return Nags.courseUseTips;
    } else if (this.response === 'dn') {
      return Nags.thanksForNow;
    } else if (this.response === 'wu') {
      return Nags.thanksAnways;
    }
    return null;
  }

  @computed get displayInitialPrompt() {
    return Boolean(
      this.response === false && this.courseIsNaggable && isNil(this.lastNaggedAgo)
    );
  }

  @computed get lastNaggedAgo() {
    const timestamp = UiSettings.get(LAST_NAG_TIME, this.course.id);
    if (!isNil(timestamp)) {
      return TimeStore.getNow().getTime() - timestamp;
    }
    return null;
  }

  @computed get isOnboardingUndecided() {
    if (this.lastNaggedAgo && this.lastNaggedAgo < NAG_INTERVAL) { return false; }
    return includes(['dn', undefined], UiSettings.get(ONBOARDING_CHOICE, this.course.id));
  }

  recordExpectedUse(decision) {
    this.response = decision;
    UiSettings.set(ONBOARDING_CHOICE, this.course.id, decision);
    UiSettings.set(LAST_NAG_TIME, this.course.id, TimeStore.getNow().getTime());

    User.logEvent({
      category: 'onboarding', code: 'made_adoption_decision',
      data: { decision: CHOICES[decision] },
    });
  }

  get usageOptions() {
    return {
      cc: 'Required for some course credit',
      exc: 'For extra credit',
      adr: 'As an additional resource',
      dn: 'I don’t know yet',
      wu: 'I won’t be using it',
    };
  }


}
