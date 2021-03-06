React = require 'react'
BS = require 'react-bootstrap'
Icon = require '../icon'

MESSAGES = {
  student:
    <div>
      <p key='s1'>The performance forecast is an estimate of your understanding of a topic.</p>
      <p key='s2'>
        It is personalized display based on your answers to reading questions,
        homework problems, and previous practices.
      </p>
    </div>
  teacher:
    <div>
      <p key='s1'>The performance forecast is an estimate of each group’s understanding of a topic.</p>
      <p key='s2'>
        It is personalized display based on their answers to reading questions,
        homework problems, and previous practices.
      </p>
    </div>
  teacher_student:
    <div>
      <p key='st1'>The performance forecast is an estimate of each student’s understanding of a topic.</p>
      <p key='st2'>
        It is personalized display based on their answers to reading questions,
        homework problems, and previous practices.
      </p>
    </div>
}

module.exports = React.createClass

  displayName: 'PerformanceForecastInfoLink'
  type: React.PropTypes.oneOf(['student', 'teacher', 'teacher_student']).isRequired

  render: ->
    <Icon
      className="info-link"
      type="info-circle"
      tooltipProps={placement: 'right'}
      tooltip={MESSAGES[@props.type]}
    />
