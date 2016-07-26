React = require 'react'
_ = require 'underscore'

TaskTeacherReviewExercise = require './exercise'
LoadableItem = require '../loadable-item'

CrumbMixin = require './crumb-mixin'
{ScrollListenerMixin} = require 'react-scroll-components'
{ChapterSectionMixin, ScrollToMixin} = require 'openstax-react-components'
{ScrollTrackerMixin, ScrollTrackerParentMixin} = require 'openstax-react-components/src/components/scroll-tracker'

{TaskTeacherReviewActions, TaskTeacherReviewStore} = require '../../flux/task-teacher-review'

ReviewHeadingTracker = React.createClass
  displayName: 'ReviewHeadingTracker'
  render: ->
    {sectionLabel, title, sectionKey} = @props

    <h2 data-section={sectionKey}>
      <span className='text-success'>
        {sectionLabel}
      </span> {title}
    </h2>


Review = React.createClass
  displayName: 'Review'
  propTypes:
    id: React.PropTypes.string.isRequired
    focus: React.PropTypes.bool.isRequired
    period: React.PropTypes.object.isRequired
    currentStep: React.PropTypes.number

  getDefaultProps: ->
    focus: false

  render: ->
    {id, focus, steps} = @props
    stepsProps = _.omit(@props, 'focus')

    stepsList = _.map steps, (step, index) =>

      # scrollState = _.pick(step, 'key', 'sectionLabel')

      if step.question_stats?
        return null unless step.content
        stepProps = _.extend({}, stepsProps, step)
        stepProps.key = "task-review-question-#{step.question_stats[0].question_id}-#{step.stepIndex}"
        stepProps.focus = focus and index is 0

        Tracker = TaskTeacherReviewExercise
      else
        stepProps = step
        stepProps.key = "task-review-heading-#{step.sectionLabel}"

        Tracker = ReviewHeadingTracker

      item = <Tracker
        {...stepProps}
        sectionKey={step.key}/>

    <div>
      {stepsList}
    </div>


ReviewShell = React.createClass
  render: ->
    {id} = @props
    <LoadableItem
      id={id}
      store={TaskTeacherReviewStore}
      actions={TaskTeacherReviewActions}
      renderItem={=> <Review {...@props} review='teacher' panel='teacher-review' />}
    />

module.exports = {Review, ReviewShell}
