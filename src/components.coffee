# @csx React.DOM

React = require 'react'
AnswerStore = require './answer-store'

AnswerListener =
  _onChange: (question, answer) ->
    if @props.config is question
      @setState {answer}

  _onAnswered: (question) ->
    if @props.config is question
      @setState {isAnswered:true}

  componentDidMount: ->
    AnswerStore.on 'change', @_onChange
    AnswerStore.on 'answered', @_onAnswered

  componentWillUnmount: ->
    AnswerStore.removeListener 'change', @_onChange
    AnswerStore.removeListener 'answered', @_onAnswered



# Converts an index to `a-z` for question answers
AnswerLabeler = React.createClass
  displayName: 'AnswerLabeler'
  render: ->
    {index, before, after} = @props
    letter = String.fromCharCode(index + 97) # For uppercase use 65
    <span className="answer-char">{before}{letter}{after}</span>


Exercise = React.createClass
  displayName: 'Exercise'
  render: ->
    {config} = @props
    <div className="exercise">
      <button onClick={@_submitAnswers}>Submit Answers</button>
      <div className="background" dangerouslySetInnerHTML={__html:config.background}></div>
      {ExercisePart {config:part} for part in config.parts}
    </div>

  _submitAnswers: ->
    AnswerStore.submitAnswers()

getQuestionType = (format) ->
  switch format
    when 'matching' then MatchingQuestion
    when 'multiple-choice' then MultipleChoiceQuestion
    when 'multiple-select' then MultiSelectQuestion
    when 'short-answer' then SimpleQuestion
    when 'true-false' then TrueFalseQuestion
    when 'fill-in-the-blank' then BlankQuestion
    else throw new Error("Unsupported format type '#{format}'")

variantCounter = 0
QuestionVariants = React.createClass
  displayName: 'QuestionVariants'
  render: ->
    {config} = @props

    idPrefix = "id-variants-#{variantCounter++}" # HACK

    formatCheckboxes = for format, i in config.formats
      <input type="checkbox" data-format={format} id={"#{idPrefix}-#{format}"}/>
    formatLabels = for format, i in config.formats
      <label data-format={format} htmlFor={"#{idPrefix}-#{format}"}>{format}</label>

    variants = []
    for format in config.formats
      type = getQuestionType(format)
      if type
        props =
          config: config.variants[format]
        variants.push(<div className="variant" data-format={format}>{type(props)}</div>)

    if variants.length is 1
      return variants[0]
    else
      <div className="variants">
        {formatCheckboxes}
        <div className="options">
          The question below can be shown in several ways. Click to Show
          {formatLabels}
        </div>
        {variants}
      </div>

  componentDidMount: ->
    # Display the first variant (if there are multiple)
    @getDOMNode().querySelector('input[type="checkbox"], input[type="radio"]')?.checked = true

ExercisePart = React.createClass
  displayName: 'ExercisePart'
  render: ->
    {config} = @props

    questions = config.questions

    <div className="part">
      <div className="background" dangerouslySetInnerHTML={__html:config.background}></div>
      {QuestionVariants {config:question} for question in questions}
    </div>

BlankQuestion = React.createClass
  displayName: 'BlankQuestion'
  render: ->
    {config} = @props
    <div className="question">
      <div className="stem" dangerouslySetInnerHTML={__html:config.stem}></div>
    </div>

  componentDidMount: ->
    # Find the input box and attach listeners to it
    input = @getDOMNode().querySelector('input')
    input.onkeyup = input.onblur = =>
      AnswerStore.setAnswer(@props.config, input.value) if input.value


SimpleQuestion = React.createClass
  displayName: 'SimpleQuestion'
  render: ->
    {config} = @props
    <div className="question">
      <div className="stem">{config.stem}</div>
      <input type="text" placeholder={config.short_stem} ref="prompt" onChange=@onChange />
    </div>

  onChange: ->
    val = @refs.prompt.getDOMNode().value
    if val
      AnswerStore.setAnswer(@props.config, val)
    else
      AnswerStore.setAnswer(@props.config, undefined)


SimpleMultipleChoiceOption = React.createClass
  displayName: 'SimpleMultipleChoiceOption'
  render: ->
    {config, questionId, index} = @props
    id = config.id

    <span className="templated-todo" dangerouslySetInnerHTML={__html:config.content or config.value}>
    </span>

MultiMultipleChoiceOption = React.createClass
  displayName: 'MultiMultipleChoiceOption'
  render: ->
    {config, idIndices} = @props
    vals = []
    for id, i in idIndices
      unless config.value.indexOf(id) < 0
        index = config.value.indexOf(id)
        vals.push <AnswerLabeler key={index} before="(" after=")" index={index}/>
    <span className="multi">{vals}</span>


MultipleChoiceOptionMixin =
  render: ->
    {inputType, config, questionId, index, isAnswered} = @props

    # For radio boxes there is only 1 value, the id/value but
    # for checkboxes the answer is an array of ids/values
    option = if Array.isArray(config.value)
      @props.idIndices = for id in config.value
        id
      MultiMultipleChoiceOption(@props)
    else
      SimpleMultipleChoiceOption(@props)

    id = "#{questionId}-#{config.id}"

    inputType = 'hidden' if isAnswered

    classes = ['option']
    classes.push('correct') if @props.isCorrect
    classes.push('incorrect') if @props.isIncorrect

    optionIdent = @props.config.id or @props.config.value
    if Array.isArray(@props.answer)
      isChecked = @props.answer.indexOf(optionIdent) >= 0
    else
      isChecked = @props.answer is optionIdent

    <li key={id} className={classes.join(' ')}>
      <label>
        <input type={inputType}
          name={questionId}
          value={JSON.stringify(config.value)}
          onChange=@onChange
          checked={isChecked}
        />
        <span className="letter"><AnswerLabeler after=")" index={index}/> </span>
        <span className="answer">{option}</span>
      </label>
    </li>


MultipleChoiceOption = React.createClass
  displayName: 'MultipleChoiceOption'
  getDefaultProps: -> {inputType:'radio'}
  mixins: [MultipleChoiceOptionMixin]

  onChange: ->
    @props.onChange(@props.config)


MultipleChoiceQuestion = React.createClass
  displayName: 'MultipleChoiceQuestion'
  mixins: [AnswerListener]
  getInitialState: ->
    isAnswered: false

  render: ->
    {config} = @props
    {isAnswered} = @state
    questionId = config.id
    options = for option, index in config.answers
      isCorrect = false
      isIncorrect = false
      if config.answer is option.id # if my answer is this option
        isCorrect = config.correct is config.answer
        isIncorrect = !isCorrect

      optionProps = {
        config: option
        answer: config.answer
        questionId
        index
        isAnswered
        isCorrect
        isIncorrect
        @onChange
      }
      MultipleChoiceOption(optionProps)

    classes = ['question']
    classes.push('answered') if isAnswered

    <div key={questionId} className={classes.join(' ')}>
      <div className="stem" dangerouslySetInnerHTML={__html:config.stem}></div>
      <ul className="options">{options}</ul>
    </div>

  onChange: (answer) ->
    AnswerStore.setAnswer(@props.config, answer.id or answer.value)


MultiSelectOption = React.createClass
  displayName: 'MultiSelectOption'
  getDefaultProps: -> {inputType:'checkbox'}
  mixins: [MultipleChoiceOptionMixin]

  onChange: ->
    @state = !@state
    @props.onChange(@props.config, @state)


# http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
ArrayEquals = (ary1, array) ->
  # if the other array is a falsy value, return
  return false  unless array
  # compare lengths - can save a lot of time
  return false  unless ary1.length is array.length
  i = 0
  l = ary1.length
  while i < l
    # Check if we have nested arrays
    if ary1[i] instanceof Array and array[i] instanceof Array
      # recurse into the nested arrays
      return false  unless ary1[i].equals(array[i])
    # Warning - two different object instances will never be equal: {x:20} != {x:20}
    else return false  unless ary1[i] is array[i]
    i++
  true

MultiSelectQuestion = React.createClass
  displayName: 'MultiSelectQuestion'
  mixins: [AnswerListener]
  getInitialState: ->
    isAnswered: false
    answers: []

  render: ->
    {config} = @props
    {isAnswered} = @state
    questionId = config.id

    options = []

    for option, index in config.answers
      unless Array.isArray(option.value)
        isCorrect = false
        isIncorrect = false
        if config.answer?.indexOf(option.id) >= 0 # if my answer is this option
          config.correct.sort() # Hack to compare 2 arrays since you could have checked in a different order
          config.answer.sort()
          isCorrect = ArrayEquals(config.correct, config.answer)
          isIncorrect = !isCorrect

        optionProps = {
          config: option
          answer: config.answer
          isAnswered
          isCorrect
          isIncorrect
          questionId
          index
          @onChange
        }

        options.push MultiSelectOption(optionProps)

    classes = ['question']
    classes.push('answered') if isAnswered

    <div key={questionId} className={classes.join(' ')}>
      <div className="stem" dangerouslySetInnerHTML={__html:config.stem}></div>
      <div>Select all that apply:</div>
      <ul className="options">{options}</ul>
    </div>

  onChange: (answer, isChecked) ->
    if isChecked
      @state.answers.push(answer.id) if @state.answers.indexOf(answer.id) < 0
    else
      i = @state.answers.indexOf(answer.id)
      @state.answers.splice(i, 1) if i >= 0

    if @state.answers.length
      AnswerStore.setAnswer(@props.config, @state.answers)
    else
      AnswerStore.setAnswer(@props.config, undefined)


TrueFalseQuestion = React.createClass
  displayName: 'TrueFalseQuestion'
  mixins: [AnswerListener]
  getInitialState: ->
    isAnswered: false

  render: ->
    {config} = @props
    {isAnswered} = @state
    questionId = config.id
    idTrue = "#{questionId}-true"
    idFalse = "#{questionId}-false"

    if isAnswered
      trueClasses  = ['option']
      falseClasses = ['option']

      trueClasses.push('correct')
      falseClasses.push('incorrect')

      <div className="question answered true-false">
        <div className="stem" dangerouslySetInnerHTML={__html:config.stem}></div>
        <ul className="options">
          <li className={trueClasses.join(' ')}>
            <span>True</span>
          </li>
          <li className={falseClasses.join(' ')}>
            <span>False</span>
          </li>
        </ul>
      </div>


    else
      <div className="question true-false">
        <div className="stem" dangerouslySetInnerHTML={__html:config.stem}></div>
        <ul className="options">
          <li className="option">
            <label>
              <input type="radio" name={questionId} value="true" onChange=@onTrue />
              <span>True</span>
            </label>
          </li>
          <li className="option">
            <label>
              <input type="radio" name={questionId} value="true" onChange=@onFalse />
              <span>False</span>
            </label>
          </li>
        </ul>
      </div>

  onTrue:  -> AnswerStore.setAnswer(@props.config, true)
  onFalse: -> AnswerStore.setAnswer(@props.config, false)


MatchingQuestion = React.createClass
  displayName: 'MatchingQuestion'
  render: ->
    {config} = @props
    rows = for answer, i in config.answers
      item = config.items[i]

      <tr key={answer.id}>
        <td className="item" dangerouslySetInnerHTML={__html:item}></td>
        <td className="spacer"></td>
        <td className="answer" dangerouslySetInnerHTML={__html:answer.content or answer.value}></td>
      </tr>

    <div className="question matching">
      <table>
        <caption className="stem" dangerouslySetInnerHTML={__html:config.stem}></caption>
        {rows}
      </table>
    </div>



module.exports = {Exercise, getQuestionType}
