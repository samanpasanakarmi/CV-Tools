import { blankCv } from './model.js';
import { CloudApi } from './api.js';
import { CLOUD_CONFIG } from './config.js';

// Shared, in-memory workspace. Never store credentials or unsaved CV data in localStorage.
export const AI_ENABLED = false; // Core-only release; backend must also be enabled separately.
export const state = {
  api: new CloudApi(CLOUD_CONFIG),
  master: blankCv(),
  variants: [],
  active: null,
  screen: 'dashboard',
  dirtyMaster: false,
  dirtyCv: false,
  busy: false,
  savedMaster: blankCv(),
  authMode: 'login',
  aiDraft: null,
  aiRequest: {targetRole:'Customer Service Representative',company:'',jobDescription:'',template:'modern'},
  aiReview: {title:'',headline:'',summary:'',included:{}}
};
