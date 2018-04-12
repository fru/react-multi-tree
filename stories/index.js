import React, {Component} from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';
import { Tree } from '../src/main';
import { testdata } from '../example/testdata';
import styles from '../src/defaults.scss';


storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>)
  .add('skipped story', () => <Button onClick={action('clicked')}>I am skipped</Button>);


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