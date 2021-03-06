axios = require 'axios'
extend = require 'lodash/extend'
defaultsDeep = require 'lodash/defaultsDeep'

OPTIONS = {}

emitError = ({response}) ->
  OPTIONS.handlers?.onFail?({response})
  response

Networking = {

  setOptions: (options) ->
    OPTIONS = options

  updateOptions: (options) ->
    defaultsDeep(OPTIONS, options)

  perform: (opts) ->
    axios(extend({}, OPTIONS?.xhr, opts)).catch((err) ->
      emitError(err) unless opts.silenceErrors
      err.response
    )
}

module.exports = Networking
