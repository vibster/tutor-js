_ = require 'underscore'
deepMerge = require 'lodash/merge'
cloneDeep = require 'lodash/cloneDeep'
URLs = require './urls'
Networking = require './networking'

SETTINGS = {}
PREVIOUS_SETTINGS = {}

saveSettings = _.debounce( ->
  Networking.perform(
    method: 'PUT',
    url: URLs.construct('tutor_api', 'users', 'ui_settings')
    withCredentials: true
    data:
      previous_ui_settings: PREVIOUS_SETTINGS
      ui_settings: SETTINGS
  )
)

UiSettings = {

  initialize: (settings) ->
    SETTINGS = cloneDeep(settings) or {}

  get: (key) ->
    SETTINGS[key]

  set: (key, value) ->
    attrs = if _.isObject(key) then key else {"#{key}": value}
    PREVIOUS_SETTINGS = cloneDeep SETTINGS
    deepMerge(SETTINGS, attrs)
    saveSettings()

  # for use by specs to reset
  _reset: ->
    SETTINGS = {}
}

module.exports = UiSettings
