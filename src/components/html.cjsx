_ = require 'underscore'
React = require 'react'

module.exports = React.createClass
  displayName: 'ArbitraryHtmlAndMath'
  propTypes:
    className: React.PropTypes.string
    html: React.PropTypes.string
    block: React.PropTypes.bool.isRequired
  getDefaultProps: ->
    block: false

  render: ->
    classes = ['has-html']
    classes.push(@props.className) if @props.className
    classes = classes.join(' ')

    if @props.block
      <div className={classes} dangerouslySetInnerHTML={@getHTMLFromProp()} />
    else
      <span className={classes} dangerouslySetInnerHTML={@getHTMLFromProp()} />

  getHTMLFromProp: ->
    {html} = @props
    if html
      __html: html

  # rendering uses dangerouslySetInnerHTML and then runs MathJax,
  # Both of which React can't optimize like it's normal render operations
  # Accordingly, only update if any of our props have actually changed
  shouldComponentUpdate: (nextProps, nextState) ->
    for propName, value of nextProps
      return true if @props[propName] isnt value
    return false

  componentDidMount:  -> @updateDOMNode()
  componentDidUpdate: -> @updateDOMNode()

  # Perform manipulation on HTML contained inside the components node.
  updateDOMNode: ->
    # External links should open in a new window
    root = @getDOMNode()
    links = root.querySelectorAll('a')
    _.each links, (link) ->
      link.setAttribute('target', '_blank') unless link.getAttribute('href')?[0] is '#'

    nodes = root.querySelectorAll('[data-math]:not(.math-rendered)') or []

    # Clone the array because the browser will mutable it
    nodes = _.toArray(nodes)

    _.each nodes, (node) ->
      formula = node.getAttribute('data-math')

      # Divs with data-math should be rendered as a block
      if node.tagName.toLowerCase() is 'div'
        node.textContent = "\u200c\u200c\u200c#{formula}\u200c\u200c\u200c"
      else
        node.textContent = "\u200b\u200b\u200b#{formula}\u200b\u200b\u200b"

    # MathML should be rendered by MathJax (if available)
    window.MathJax?.Hub.Queue(['Typeset', MathJax.Hub, root])

    # Once MathJax finishes processing, mark all the nodes as
    # rended and then manually cleanup the MathJax message nodes to prevent
    # React "Invariant Violation" exceptions.
    # MathJax calls Queued events in order, so this should always execute after typesetting
    window.MathJax?.Hub.Queue([ ->
      _.each nodes, (node) ->
        node.classList.add('math-rendered')

      for nodeId in ['MathJax_Message', 'MathJax_Hidden', 'MathJax_Font_Test']
        el = document.getElementById(nodeId)
        break unless el # the elements won't exist if MathJax didn't do anything
        # Some of the elements are wrapped by divs without selectors under body
        # Select the parentElement unless it's already directly under body.
        el = el.parentElement unless el.parentElement is document.body
        el.parentElement.removeChild(el)
    ])
