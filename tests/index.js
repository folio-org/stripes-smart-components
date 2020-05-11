import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { turnOffWarnings } from './helpers';

// require all test files matching 'lib/**/tests/*-test'
const requireTest = require.context('../lib/', true, /(.*?)\/tests\/(.*?)-test/);
requireTest.keys().forEach(requireTest);

turnOffWarnings();

// require all source files in lib for code coverage
const componentsContext = require.context('../lib/', true, /^(?!.*(stories|examples)).*\.js$/);
componentsContext.keys().forEach(componentsContext);
