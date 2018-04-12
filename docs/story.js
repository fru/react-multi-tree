import React, {Component} from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import { Tree } from '../src/main';
import { testdata } from '../example/testdata';
import styles from '../src/theme/theme.scss';

class TreeWithState extends Component {
  constructor(props) {
      super(props);
      this.state = { tree: testdata };
  }
    
	render() {
    return <Tree nodes={this.state.tree} onChange={(tree) => this.setState({tree}) } />;
  }
}

storiesOf('Tree', module)
  .add('with text', () => <TreeWithState />);