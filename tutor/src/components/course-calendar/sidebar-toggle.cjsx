React = require 'react'

classnames = require 'classnames'
{Button} = require 'react-bootstrap'
Icon = require '../icon'
CalendarHelper = require './helper'

CalendarSidebarToggle = React.createClass

  displayName: 'CalendarSidebarToggle'

  propTypes:
    onToggle: React.PropTypes.func.isRequired
    defaultOpen: React.PropTypes.bool

  getDefaultProps: ->
    defaultOpen: false

  getInitialState: ->
    isOpen: false

  componentWillMount: ->
    @setState(pendingIntroTimeout: CalendarHelper.scheduleIntroEvent(@onToggle))

  componentWillUnmount: ->
    CalendarHelper.clearScheduledEvent(@state.pendingIntroTimeout)

  onToggle: ->
    isOpen = not @state.isOpen
    @setState({isOpen, pendingIntroTimeout: false})
    @props.onToggle(isOpen)

  render: ->
    <Button
      onClick={@onToggle}
      className={classnames("sidebar-toggle", open: @state.isOpen)}
    >
      <Icon type={if @state.isOpen then 'times' else 'bars'} />
      <span className="text">Add Assignment</span>
    </Button>


module.exports = CalendarSidebarToggle