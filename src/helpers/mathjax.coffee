_ = require 'underscore'

MATH_MARKER_BLOCK  = '\u200c\u200c\u200c' # zero-width non-joiner
MATH_MARKER_INLINE = '\u200b\u200b\u200b' # zero-width space

MATH_RENDERED_CLASS = 'math-rendered'
MATH_DATA_SELECTOR = "[data-math]:not(.#{MATH_RENDERED_CLASS})"
MATH_ML_SELECTOR   = "math:not(.#{MATH_RENDERED_CLASS})"
COMBINED_MATH_SELECTOR = "#{MATH_DATA_SELECTOR}, #{MATH_ML_SELECTOR}"

# Search document for math and [data-math] elements and then typeset them
typesetDocument = ->
  latexNodes = []

  for node in document.querySelectorAll(MATH_DATA_SELECTOR)
    formula = node.getAttribute('data-math')
    # divs should be rendered as a block, others inline
    if node.tagName.toLowerCase() is 'div'
      node.textContent = "#{MATH_MARKER_BLOCK}#{formula}#{MATH_MARKER_BLOCK}"
    else
      node.textContent = "#{MATH_MARKER_INLINE}#{formula}#{MATH_MARKER_INLINE}"
    latexNodes.push(node)

  unless _.isEmpty(latexNodes)
    window.MathJax.Hub.Typeset(latexNodes)

  mathMLNodes = _.toArray(document.querySelectorAll(MATH_ML_SELECTOR))
  unless _.isEmpty(mathMLNodes)
    # ugg - mathjax seems to need at least a bit of other content around the element to style
    # If it just styles a parent element that has no other text then it doesn't know what size the text should be
    parents = _.unique( _.map( mathMLNodes, (el) -> el.parentElement.parentElement ) )
    window.MathJax.Hub.Typeset( parents )

  window.MathJax.Hub.Queue ->
    # Queue a call to mark the found nodes as rendered so are ignored if typesetting is called repeatedly
    for node in latexNodes.concat(mathMLNodes)
      node.classList.add(MATH_RENDERED_CLASS)

# Install a debounce around typesetting function so that it will only run once
# every Xms even if called multiple times in that period
typesetDocument = _.debounce( typesetDocument, 100)


# typesetMath is the main exported function.
# It's called by components like HTML after they're rendered
typesetMath = (root) ->
  # schedule a Mathjax pass if there is at least one [data-math] or <math> element present
  if window.MathJax?.Hub?.Queue? and root.querySelector(COMBINED_MATH_SELECTOR)
    typesetDocument()


# The following should be called once and configures MathJax.
# Assumes the script to load MathJax is of the form:
# `...MathJax.js?config=TeX-MML-AM_HTMLorMML-full&amp;delayStartupUntil=configured`
startMathJax = ->
  MATHJAX_CONFIG =
    showProcessingMessages: false
    tex2jax:
      displayMath: [[MATH_MARKER_BLOCK, MATH_MARKER_BLOCK]]
      inlineMath:  [[MATH_MARKER_INLINE, MATH_MARKER_INLINE]]
    styles:
      '#MathJax_Message':    visibility: 'hidden', left: '', right: 0
      '#MathJax_MSIE_Frame': visibility: 'hidden', left: '', right: 0

  configuredCallback = ->
    window.MathJax.Hub.Configured()

  if window.MathJax?.Hub
    window.MathJax.Hub.Config(MATHJAX_CONFIG)
    # Does not seem to work when passed to Config
    window.MathJax.Hub.processSectionDelay = 0
    configuredCallback()
  else
    # If the MathJax.js file has not loaded yet:
    # Call MathJax.Configured once MathJax loads and
    # loads this config JSON since the CDN URL
    # says to `delayStartupUntil=configured`
    MATHJAX_CONFIG.AuthorInit = configuredCallback

    window.MathJax = MATHJAX_CONFIG


module.exports = {typesetMath, startMathJax}
