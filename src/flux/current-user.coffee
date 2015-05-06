# coffeelint: disable=no_empty_functions
_ = require 'underscore'
flux = require 'flux-react'

{CourseActions, CourseStore} = require './course'

# TODO consider putting this with policies?  especially when this same data could be used for other
# roles based stuffs?
# Roles listed in ascending order of rank, where admin will have most permissions
RANKS = [
  'guest'
  'student'
  'teacher'
  'admin'
]

getRankByRole = (roleType) ->
  rank = RANKS.indexOf(roleType)
  console.warn("Warning: #{roleType} does not exist.  Rank of -1 assigned.  Check session status.") if rank < 0

  rank

ROUTES =
  dashboard:
    label: 'Dashboard'
    roles:
      teacher: 'taskplans'
      student: 'viewStudentDashboard'
      default: 'root'
  guide:
    label: 'Learning Guide'
    roles:
      student: 'viewGuide'


CurrentUserActions = flux.createActions [
  'setToken'  # (token) ->
  'loadAllCourses'
  'loadedAllCourses'
  'loadName'
  'loadedName'
  'logout'    # () ->    # API Hooks onto this action and transitions
  'reset'
]

CurrentUserStore = flux.createStore
  actions: [
    CurrentUserActions.setToken
    CurrentUserActions.loadAllCourses
    CurrentUserActions.loadedAllCourses
    CurrentUserActions.loadName
    CurrentUserActions.loadedName
    CurrentUserActions.reset
  ]

  _token: null
  # DEPRECATE?  courseIds being stored on _courses?
  _courseIds: null # Just store the id's. They will be looked up in the course store

  _getRouteByRole: (routeType, menuRole) ->
    ROUTES[routeType].roles[menuRole] or ROUTES[routeType].roles.default

  _getCourseRole: (courseId) ->
    course = CourseStore.get(courseId)
    courseRoles = course?.roles or [{type: 'guest'}]

    role = _.chain(courseRoles)
      .pluck('type')
      .sortBy((roleType) ->
        # sort by rank -- Teacher role will take precedence over student role for example
        -1 * getRankByRole(roleType)
      )
      .first()
      .value()

    role

  setToken: (@_token) -> # Save the token

  loadName: -> # Used by API
  loadedName: (results) ->
    @_name = results.name
    @emitChange()

  loadAllCourses: -> # Used by API
  loadedAllCourses: (results) ->
    # {items} = results # TODO: This JSON format is inconsistent with the paged results
    items = results
    @_courses = _.map items, (course) ->
      {id} = course
      CourseActions.loaded(course, id)
      id # Just store the ids in @_courses

    @emitChange()

  reset: ->
    @_token = null
    @_name = 'Guest'
    @_courses = null

  exports:
    getToken: -> @_token
    isCoursesLoaded: -> !!@_courses
    getName: -> @_name

    getCourseRole: (courseId) ->
      @_getCourseRole(courseId)

    getCourses: ->
      _.map @_courses, (id) ->
        CourseStore.get(id)

    getDashboardRoute: (courseId) ->
      menuRole = @_getCourseRole(courseId)
      @_getRouteByRole('dashboard', menuRole)

    getMenuRoutes: (courseId) ->
      menuRole = @_getCourseRole(courseId)
      routes = [
        'dashboard'
        'guide'
      ]

      _.chain(routes)
        .map((routeType) =>
          routeName = @_getRouteByRole(routeType, menuRole)

          if routeName?
            name: routeName
            label: ROUTES[routeType].label
        )
        .compact()
        .value()


module.exports = {CurrentUserActions, CurrentUserStore}
