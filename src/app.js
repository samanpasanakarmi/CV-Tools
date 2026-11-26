// Application entry point: register each feature, then start the session.
import { registerAuth, boot } from './controllers/auth.js';
import { registerNavigation } from './controllers/navigation.js';
import { registerAi } from './controllers/ai.js';
import { registerAccount } from './controllers/account.js';
import { registerProfile } from './controllers/profile.js';
import { registerCvs } from './controllers/cvs.js';
import { registerExports } from './controllers/export.js';

registerAuth();
registerNavigation();
registerAi();
registerAccount();
registerProfile();
registerCvs();
registerExports();
boot();
