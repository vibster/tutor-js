React = require 'react'
twix = require 'twix'

CoursePlanLabel = React.createClass
  displayName: 'CoursePlanLabel'
  propTypes:
    rangeDuration: React.PropTypes.instanceOf(twix).isRequired
    plan: React.PropTypes.object.isRequired
    index: React.PropTypes.number
    offset: React.PropTypes.number

  calcPercentOfPlanLength: (partLength) ->
    partLength / @props.plan.durationLength * 100 + '%'

  render: ->
    {rangeDuration, plan, index, offset, offsetFromPlanStart} = @props
    {opensAt, title} = plan

    # Adjust width based on plan duration, helps with label centering on view...for the most part.
    # CALENDAR_EVENT_LABEL_DYNAMIC_WIDTH
    planRangeLength = rangeDuration.length('days')
    planLabelStyle =
      width: @calcPercentOfPlanLength(planRangeLength)
      marginLeft: @calcPercentOfPlanLength(offsetFromPlanStart)

    labelClass = 'continued' unless index is 0

    label = <label
      data-opens-at={opensAt}
      style={planLabelStyle}
      className={labelClass}>{title}</label>

module.exports = CoursePlanLabel