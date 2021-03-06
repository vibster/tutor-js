_ = require 'underscore'
moment = require 'moment'

React = require 'react'
ReactTestUtils = require 'react-addons-test-utils'
{Promise} = require 'es6-promise'

{TeacherTaskPlanStore, TeacherTaskPlanActions} = require '../../../../src/flux/teacher-task-plan'
{TaskPlanStatsStore, TaskPlanStatsActions} = require '../../../../src/flux/task-plan-stats'
{ default: Courses } = require '../../../../src/models/courses-map'

Add = require '../../../../src/components/course-calendar/add'

planId = '1'
courseId = '1'
VALID_PLAN_MODEL = require '../../../../api/plans/1/stats.json'
VALID_COURSE_MODEL = require '../../../../api/user/courses/1.json'

{routerStub, commonActions} = require '../utilities'

actions =
  forceUpdate: (args...) ->
    {component, div} = args[0]
    routerStub.forceUpdate(component, args...)

  clickNext: commonActions.clickMatch('.next')
  clickPrevious: commonActions.clickMatch('.previous')
  clickPlan: (planId) ->
    TaskPlanStatsActions.loaded(VALID_PLAN_MODEL, planId)
    Courses.bootstrap([VALID_COURSE_MODEL], { clear: true })
    commonActions.clickMatch(".course-plan-#{planId}")
  clickAdd: (args...) ->
    {component} = args[0]
    addButton = React.findDOMNode(component.refs.calendarHandler.refs.addButtonGroup.refs.dropdownButton)
    commonActions.clickDOMNode(addButton)(args[0])
  clickToday: (args...) ->
    {component} = args[0]
    currents = ReactTestUtils.scryRenderedDOMComponentsWithClass(component, 'rc-Day--current')
    commonActions.clickComponent(currents[0])(args[0])
  clickTomorrow: (args...) ->
    {component} = args[0]
    upcomings = ReactTestUtils.scryRenderedDOMComponentsWithClass(component, 'rc-Day--upcoming')
    commonActions.clickComponent(upcomings[0])(args[0])
  clickYesterday: (args...) ->
    {component} = args[0]
    pasts = ReactTestUtils.scryRenderedDOMComponentsWithClass(component, 'rc-Day--past')
    commonActions.clickComponent(_.last(pasts))(args[0])
  clickAddHomework: (args...) ->
    {component} = args[0]
    addOnDayDropdown = ReactTestUtils.findRenderedComponentWithType(component, Add)
    commonActions.clickDOMNode(addOnDayDropdown.refs.homeworkLink.getDOMNode().childNodes[0])(args[0])
    args[0]
  clickAddAssignment: (args...) ->
    {div} = args[0]
    addAssignmentButton = div.querySelector('#add-assignment')
    commonActions.clickDOMNode(addAssignmentButton)(args[0])

  _getMomentWithPlans: (courseId) ->
    plansList = TeacherTaskPlanStore.getActiveCoursePlans(courseId)

    firstPlan = _.chain(plansList)
      .clone()
      .sortBy('opens_at')
      .first()
      .value()

    moment(firstPlan.starts_at)

  _goToMonth: (testMoment, {div, courseId, component, state, router, history}) ->
    # component.refs.calendarHandler.props.startDate = testMoment
    component.refs.calendarHandler.setDate(testMoment)
    actions.forceUpdate({div, courseId, component, state, router, history})

  goToMonth: (testMoment) ->
    (args...) ->
      actions._goToMonth(testMoment, args...)

  goToMonthWithPlans: (args...) ->
    {courseId} = args[0]
    testMoment = actions._getMomentWithPlans(courseId)
    actions._goToMonth(testMoment, args...)

module.exports = actions
