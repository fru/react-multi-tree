/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import { configure } from '@storybook/react';
import 'loki/configure-react';

function loadStories() {
  require('../../docs/story.js');
}

configure(loadStories, module);
