// Only load recordo for dev code for now
import Recordo from 'recordo';
Recordo.initialize();
// Recordo.start()

import { BootstrapURLs, UiSettings, ExerciseHelpers } from 'shared';

import api from './src/api';
import Notices from './src/helpers/notifications';
import dom from './src/helpers/dom';
import { startMathJax } from 'shared/src/helpers/mathjax';
import { TransitionAssistant } from './src/components/unsaved-state';

import ErrorMonitoring from 'shared/src/helpers/error-monitoring';


import OFFERINGS from './src/models/course/offerings';
import USER from './src/models/user';
import COURSES from './src/models/courses-map';
import TEACHER_TASK_PLANS from './src/models/teacher-task-plans';

import { Logging, ReactHelpers } from 'shared';

window._STORES = {
  SETTINGS: UiSettings,
  APP:                  require('./src/flux/app'),
  COURSE:               require('./src/flux/course'),
  EXERCISE:             require('./src/flux/exercise'),
  PERFORMANCE_FORECAST: require('./src/flux/performance-forecast'),
  SCORES:               require('./src/flux/scores'),
  STUDENT_DASHBOARD:    require('./src/flux/student-dashboard'),
  TASK_PLAN:            require('./src/flux/task-plan'),
  TASK_STEP:            require('./src/flux/task-step'),
  TASK:                 require('./src/flux/task'),
  TIME:                 require('./src/flux/time'),
  NOTIFICATIONS:        require('./src/flux/notifications'),
  TOC:                  require('./src/flux/toc'),
};

window._MODELS = {
  USER,
  COURSES,
  TEACHER_TASK_PLANS,
  OFFERINGS,
};

window._LOGGING = Logging;

// In dev builds this enables hot-reloading,
// in production it simply renders the root app

const loadApp = function() {
  if (document.readyState !== 'interactive') {
    return false;
  }

  const bootstrapData = dom.readBootstrapData();
  api.start(bootstrapData);
  BootstrapURLs.update(bootstrapData);

  UiSettings.initialize(bootstrapData.ui_settings);
  Notices.start(bootstrapData);
  ExerciseHelpers.setErrataFormURL(bootstrapData.errata_form_url);
  ErrorMonitoring.start();
  startMathJax();
  TransitionAssistant.startMonitoring();

  // Both require and module.hot.accept must be passed a bare string, not variable
  const Renderer = ReactHelpers.renderRoot( () => require('./src/components/root').default);
  if (module.hot) { module.hot.accept('./src/components/root', Renderer); }
  return true;
};

loadApp() || document.addEventListener('readystatechange', loadApp);