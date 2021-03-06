import {
  identifiedBy, session,
} from 'shared/model';

import { observable, computed, reaction } from 'mobx';
import invariant from 'invariant';
import Job from '../job';

const CURRENT = observable.map();

@identifiedBy('jobs/task-plan-publish')
export default class TaskPlanPublish extends Job {

  static forPlan(plan) {
    let pub = CURRENT.get(plan.id);
    if (!pub) {
      pub = new TaskPlanPublish(plan);
      CURRENT.set(plan.id, pub);
    }
    return pub;
  }

  static stopPollingForPlan(plan) {
    const pub = CURRENT.get(plan.id);
    if (pub) {
      pub.stopListening();
      CURRENT.delete(plan.id);
    }
  }

  static hasPlanId(id) {
    return CURRENT.has(id);
  }

  static isPublishing(plan) {
    const pub = CURRENT.get(plan.id);
    return Boolean(pub ? pub.isPending : false);
  }

  static _reset() {
    CURRENT.clear();
  }

  @observable plan;

  constructor(plan) {
    super({ maxAttempts: 60, interval: 10 }); // every 10 seconds for max of 10 mins
    this.plan = plan;
  }

  stopListening() {
    if (this.publishChangeListener) {
      this.publishChangeListener();
      this.publishChangeListener = null;
      this.stopPolling();
    }
  }

  startListening() {
    if (this.publishChangeListener) { return; }
    this.publishChangeListener = reaction(
      () => this.shouldPoll,
      () => (this.shouldPoll && !this.isPolling) ?
        this.startPolling(this.plan.publish_job_url) : this.stopPolling(),
      { fireImmediately: true }
    );

  }

  @computed get shouldPoll() {
    return Boolean(this.plan && this.plan.is_publishing && this.plan.publish_job_url);
  }

  onPollComplete() {
    this.plan.onPublishComplete();
  }


}
