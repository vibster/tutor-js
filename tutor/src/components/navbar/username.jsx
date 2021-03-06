import React from 'react';

import User from '../../models/user';

import { observer } from 'mobx-react';

@observer
export default class UserName extends React.PureComponent {

  render() {
    return (
      <span {...this.props}>
        {User.name}
      </span>
    );
  }
}
