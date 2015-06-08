React = require 'react'
BS = require 'react-bootstrap'
Router = require 'react-router'
_ = require 'underscore'
camelCase = require 'camelcase'

{TaskActions, TaskStore} = require '../../flux/task'
{TaskStepActions, TaskStepStore} = require '../../flux/task-step'

CrumbMixin = require './crumb-mixin'

Breadcrumbs = require './breadcrumbs'
Review = require './review'
Details = require './details'
{StatsModalShell} = require '../task-plan/reading-stats'

PinnedHeaderFooterCard = require '../pinned-header-footer-card'
{PinnableFooter} = require '../pinned-header-footer-card/sections'
LoadableItem = require '../loadable-item'

TaskTeacherReview = React.createClass
  propTypes:
    id: React.PropTypes.string

  displayName: 'TaskTeacherReview'

  mixins: [CrumbMixin]

  contextTypes:
    router: React.PropTypes.func

  setStepKey: ->
    {stepIndex} = @context.router.getCurrentParams()
    # url is 1 based so it matches the breadcrumb button numbers
    defaultKey = @getDefaultCurrentStep()
    crumbKey = if stepIndex then parseInt(stepIndex) - 1 else defaultKey
    crumb = @getCrumb(crumbKey)

    # go ahead and render this step only if this step is accessible
    if crumb?.crumb
      @setState(currentStep: crumbKey)
    # otherwise, redirect to the latest accessible step
    else
      @goToStep(defaultKey)(true)

  getInitialState: ->
    {
      currentStep: 0
      refreshFrom: false
      refreshTo: false
      recoverForStepId: false
      recoveredStepId: false
    }

  componentWillMount: ->
    @setStepKey()

  componentWillReceiveProps: ->
    @setStepKey()

  # Curried for React
  goToStep: (stepKey) ->
    =>
      params = @context.router.getCurrentParams()
      # url is 1 based so it matches the breadcrumb button numbers
      params.stepIndex = stepKey + 1
      params.id = @props.id # if we were rendered directly, the router might not have the id

      @context.router.transitionTo('reviewTaskStep', params)

  getCrumb: (crumbKey) ->
    crumbs = @generateCrumbs()
    _.findWhere crumbs, {key: crumbKey}

  # add render methods for different panel types as needed here

  render: ->
    {id, courseId} = @props
    task = TaskStore.get(id)
    return null unless task?

    steps = TaskStore.getSteps(id)

    panel = <Review
          steps={steps}
          taskId={task.id}
          goToStep={@goToStep}
          onNextStep={@onNextStep}
          review='teacher'
          panel='teacher-review' />

    taskClasses = "task-teacher-review task-#{task.type}"
    taskClasses += ' task-completed' if TaskStore.isTaskCompleted(id)

    unless TaskStore.isSingleStepped(id)
      breadcrumbs = <Breadcrumbs
        id={id}
        goToStep={@goToStep}
        currentStep={@state.currentStep}
        key="task-#{id}-breadcrumbs"/>

    <PinnedHeaderFooterCard
      className={taskClasses}
      fixedOffset={0}
      header={breadcrumbs}
      cardType='task'>
        <BS.Grid fluid>
          <BS.Row>
            <BS.Col sm={8}>
              {panel}
            </BS.Col>
            <BS.Col sm={4}>
              <StatsModalShell id={id}/>
            </BS.Col>
          </BS.Row>
        </BS.Grid>
        <PinnableFooter>
          <Router.Link
            to='taskplans'
            params={{courseId}}
            className='btn btn-primary'>Back to Dashboard</Router.Link>
            <Details task={task} key="task-#{task.id}-details"/>
            <div className='task-title'>{task.title}</div>
        </PinnableFooter>
    </PinnedHeaderFooterCard>

  onNextStep: ->
    @goToStep(@state.currentStep + 1)()


TaskTeacherReviewShell = React.createClass
  contextTypes:
    router: React.PropTypes.func

  render: ->
    {id, courseId} = @context.router.getCurrentParams()
    <LoadableItem
      id={id}
      store={TaskStore}
      actions={TaskActions}
      renderItem={-> <TaskTeacherReview key={id} id={id} courseId={courseId}/>}
    />

module.exports = {TaskTeacherReview, TaskTeacherReviewShell}
