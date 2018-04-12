/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */

import { configure } from '@storybook/react';
import 'loki/configure-react';

function loadStories() {
  require('../../screenshots/stories');
}

configure(loadStories, module);
