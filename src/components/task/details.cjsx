React = require 'react'
BS = require 'react-bootstrap'
Time = require '../time'
Markdown = require '../markdown'

module.exports = React.createClass
  propTypes:
    task: React.PropTypes.object.isRequired

    title: React.PropTypes.string
    dateFormat: React.PropTypes.string
    dateLabel: React.PropTypes.string
    trigger: React.PropTypes.string
    placement: React.PropTypes.string

  getDefaultProps: ->
    title: 'Instructions'
    dateFormat: 'l'
    dateLabel: 'Due'
    trigger: 'click'
    placement: 'left'

  render: ->
    {task, title, dateFormat, dateLabel, trigger, placement} = @props

    if task.description_html
      detailPopover =
        <BS.Popover title={title} className='-task-details-popover task-details-popover'>
          <Markdown>{task.description_html}</Markdown>
        </BS.Popover>
      details =
        <BS.OverlayTrigger trigger={trigger} placement={placement} overlay={detailPopover}>
          <BS.Button bsStyle="default" className='-task-details task-details'>
            <i className='fa fa-info-circle'></i> {dateLabel} <Time date={task.due_at} format={dateFormat}></Time>
          </BS.Button>
        </BS.OverlayTrigger>
    else
      details =
        <span className='-task-details task-details'>{dateLabel} <Time date={task.due_at} format={dateFormat}></Time></span>
