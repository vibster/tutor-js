React = require 'react'
BS = require 'react-bootstrap'
Router = require 'react-router'
_ = require 'underscore'

{CourseActions, CourseStore} = require '../flux/course'

PracticeButton = React.createClass
  displayName: 'PracticeButton'
  contextTypes:
    router: React.PropTypes.func

  propTypes:
    courseId: React.PropTypes.number.isRequired
    pageIds: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
    forceCreate: React.PropTypes.bool
    loadedTaskId: React.PropTypes.string
    reloadPractice: React.PropTypes.func

  componentWillMount: ->
    CourseStore.on('practice.loaded', @transitionToPractice)

  componentWillUnmount: ->
    CourseStore.off('practice.loaded', @transitionToPractice)

  render: ->
    <BS.Button bsStyle='primary' className='-practice' onClick={@onClick}>
      {@props.children}
    </BS.Button>

  onClick: ->
    {courseId, pageIds, forceCreate} = @props

    if pageIds
      buttonQuery = {page_ids: pageIds}

    if CourseStore.hasPractice(courseId) and not forceCreate
      task = CourseStore.getPractice(courseId)
      @transitionToPractice(task.id)
    else
      CourseActions.createPractice(courseId, buttonQuery)

  transitionToPractice: (practiceId) ->
    {courseId, loadedTaskId} = @props

    if practiceId is loadedTaskId
      @props.reloadPractice?()
    else
      @context.router.transitionTo('viewPractice', {courseId})

module.exports = PracticeButton
