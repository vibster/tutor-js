React = require 'react'
BindStoreMixin = require '../bind-store-mixin'
BS = require 'react-bootstrap'
isEmpty = require 'lodash/isEmpty'

ErrorHandlers = require './handlers'
{ isReloaded } = require '../../helpers/reload';
{AppStore, AppActions} = require '../../flux/app'

Dialog = require '../tutor-dialog'


module.exports = React.createClass
  displayName: 'ServerErrorMonitoring'

  mixins: [BindStoreMixin]
  bindStore: AppStore
  bindEvent: 'server-error'

  contextTypes:
    router: React.PropTypes.object

  bindUpdate: ->
    error = AppStore.getError()

    return unless error and not isReloaded()
    dialogAttrs = ErrorHandlers.forError(error, @context)

    Dialog.show( dialogAttrs ).then(dialogAttrs.onOk, dialogAttrs.onCancel)


  # We don't actually render anything
  render: -> null
