import { escapeHtml as esc } from '../model.js';
import { el } from './dom.js';
// Account settings and data management controls.
export function renderAccount(api){
  const email=api.session?.user?.email||'Signed in';
  let html=`<p class="tip">Manage your account and personal CV information here.</p><section class="account-section"><h3>Account information</h3><p class="account-email">${esc(email)}</p><p>You are signed in to Supabase. Sessions are kept in browser memory and a refresh requires logging in again.</p></section>`;
  {
    html+=`<section class="account-section"><h3>Change password</h3><p>Use a new password of at least 12 characters. Passwords are handled by Supabase Auth, not stored in CV Studio.</p><form id="account-password-form" class="account-form"><label class="field"><span>New password</span><input type="password" name="password" minlength="12" required autocomplete="new-password"></label><label class="field"><span>Confirm new password</span><input type="password" name="confirm" minlength="12" required autocomplete="new-password"></label><button type="submit" data-busy-control="1" class="btn btn-primary">Change password</button></form></section>`;
  }
  html+=`<section class="account-section"><h3>Export your information</h3><p>Download a backup of your reusable profile and every saved CV as a JSON file. Keep it in a private location because it contains personal information.</p><button data-action="export-account" class="btn" type="button">Download all CV data (JSON)</button></section>`;
  html+=`<section class="account-section danger-zone"><h3>Erase CV information</h3><p>This permanently removes your saved profile and all CV versions from your Supabase database. It does not delete your login account. Export a backup first if you need one.</p><button data-action="clear-account-data" data-busy-control="1" class="btn btn-danger" type="button">Erase my profile and CVs</button></section>`;
  html+=`<p class="account-note">Account deletion itself is not implemented in this student release. A customer-approved secure server-side deletion process and GDPR/privacy notice are still required before public use.</p>`;
  el('account-panel').innerHTML=html;
}
