steps = require './steps'

omit    = require 'lodash/omit'
extend  = require 'lodash/extend'
clone   = require 'lodash/clone'
forEach = require 'lodash/forEach'

stepsStubs = {}

TASK_ID = '40'
commonInfo =
  content_url: 'https://exercises-dev.openstax.org/exercises/120@1'
  group: 'core'
  related_content: [
    title: 'Physics is cool, yo'
    chapter_section: '1.3'
  ]
  task_id: TASK_ID

# stem and stimulus here as well to replicate real JSON
commonContent =
  stimulus_html: 'This stim should only show up once.'
  stem_html: 'This stem should only show up once.'
  uid: '120@1'

assignStepToTask = (step, stepIndex) ->
  step.content = extend {}, commonContent, step.content
  extend {questionNumber: (stepIndex + 1)}, {stepIndex: stepIndex}, commonInfo, step


forEach steps, (step, stepIndex) ->
  stepStubs =
    'free-response': assignStepToTask omit(step, 'correct_answer_id', 'feedback_html'), stepIndex
    'multiple-choice': assignStepToTask omit(step, 'correct_answer_id', 'feedback_html'), stepIndex
    'review': assignStepToTask clone(step), stepIndex

  stepsStubs[step.id] = stepStubs

module.exports = stepsStubs
