'use strict';

/**
 * @file
 * Custom step definitions for the Varbase Reports test suite.
 *
 * Most of the suite reuses the step definitions that ship with webship-js
 * (navigation, web-first assertions, accessibility). Only a few module-specific
 * helpers live here: logging in as a named user from cucumber.js
 * worldParameters.users, dropping back to an anonymous session, and creating a
 * Basic page through the node-add form.
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const {
  friendly,
  gotoUrl,
  waitForPageLoad,
} = require('webship-js/tests/step-definitions/webship');

/**
 * Run a step body and rethrow any failure as a tester-friendly error.
 *
 * @param {Function} body
 *   Async function performing the step.
 * @param {string} message
 *   Human-readable description for failures.
 */
async function attempt(body, message) {
  try {
    await body();
  }
  catch (err) {
    throw friendly(message, err);
  }
}

/**
 * Log in as a named test user defined in cucumber.js worldParameters.users.
 *
 * Example: Given I am a logged in user with the "Webmaster" user
 */
Given(/^I am a logged in user with( the)*( username)* "([^"]*)?"( user)?$/, async function (theCase, usernameCase, key, userCase) {
  const users = this.parameters.users || {};
  if (!(key in users)) {
    throw new Error(`No user named "${key}" in cucumber.js worldParameters.users`);
  }
  const { username, password } = users[key];
  if (!username || !password) {
    throw new Error(`User "${key}" is missing username or password in worldParameters.users`);
  }
  await attempt(async () => {
    let loggedIn = false;
    for (let i = 0; i < 3 && !loggedIn; i++) {
      await this.context.clearCookies();
      await gotoUrl(this.page, `${this.parameters.launchUrl}/user/login`);
      await this.page.locator('#edit-name').fill(username);
      await this.page.locator('#edit-pass').fill(password);
      await Promise.all([
        this.page.waitForURL((url) => !/\/user\/login/.test(String(url)), { timeout: 30000 }).catch(() => {}),
        this.page.locator('#user-login-form #edit-submit').click(),
      ]);
      await waitForPageLoad(this.page, this.minWaitTime && this.minWaitTime.page);
      // Confirm the session by loading the account page.
      await gotoUrl(this.page, `${this.parameters.launchUrl}/user`);
      await waitForPageLoad(this.page, this.minWaitTime && this.minWaitTime.page);
      const denied = await this.page.locator('h1:has-text("Access denied")').count();
      loggedIn = denied === 0;
    }
    if (!loggedIn) {
      throw new Error(`Login did not establish a session for "${key}"`);
    }
  }, `Could not log in as "${key}"`);
});

/**
 * Drop back to an anonymous session by clearing every cookie.
 *
 * Example: Given I am an anonymous visitor
 */
Given(/^(?:I |we )?am an anonymous visitor$/, async function () {
  await attempt(async () => {
    await this.context.clearCookies();
  }, 'Could not clear the session to become anonymous');
});

/**
 * Create a Basic page through the node-add form (Varbase Page content type).
 *
 * Example: When I create a basic page titled "Varbase Reports test page"
 */
When(/^(?:I |we )?create a basic page titled "([^"]*)"$/, async function (title) {
  await attempt(async () => {
    await gotoUrl(this.page, `${this.parameters.launchUrl}/node/add/page`);
    await this.page.locator('#edit-title-0-value').fill(title);
    await this.page.locator('#edit-submit').click();
    await waitForPageLoad(this.page, this.minWaitTime && this.minWaitTime.page);
  }, `Could not create a basic page titled "${title}"`);
});

/**
 * Open an administration page and assert it is reachable.
 *
 * Uses the webship-js smart-wait helpers (gotoUrl + waitForPageLoad) so heavy
 * Varbase admin pages are fully settled before the assertion, and reports any
 * access-denied / not-found / fatal-error page with a tester-friendly message.
 *
 * Example: When I open the administration page "/admin/config"
 */
When(/^I open the administration page "([^"]*)"$/, async function (path) {
  await attempt(async () => {
    await gotoUrl(this.page, `${this.parameters.launchUrl}${path}`);
    await waitForPageLoad(this.page, (this.minWaitTime && this.minWaitTime.page) || 10000);
    const bad = await this.page.locator(
      'h1:has-text("Access denied"), h1:has-text("Page not found"), h1:has-text("The website encountered an unexpected error")'
    ).count();
    if (bad > 0) {
      throw new Error(`The page "${path}" returned an access-denied, not-found or error response`);
    }
  }, `Could not open the administration page "${path}"`);
});

const path = require('path');

/**
 * Attach a file from the suite's own tests/assets directory to a file input.
 *
 * webship-js resolves "attach the file" against its bundled assets folder, so
 * this step resolves against the project's tests/assets so committed fixtures
 * (e.g. flag-earth.jpg) can be uploaded.
 *
 * Example: When I attach the media file "flag-earth.jpg" to "#edit-field-media-image-0-upload"
 */
When(/^(?:I |we )?attach the media file "([^"]*)" to "([^"]*)"$/, async function (fileName, selector) {
  await attempt(async () => {
    const file = path.resolve(process.cwd(), 'tests', 'assets', fileName);
    await this.page.locator(selector).setInputFiles(file);
    await waitForPageLoad(this.page, (this.minWaitTime && this.minWaitTime.page) || 10000);
  }, `Could not attach the media file "${fileName}" to "${selector}"`);
});


/**
 * Verify a CSV data-export path returns a CSV download for the current user.
 *
 * Fetches the export through the already-authenticated browser context (shares
 * the logged-in session cookies) and asserts 200 + a CSV content type + a
 * non-empty body, a real download check without the flaky navigation-download
 * event that headless CI cannot observe reliably.
 *
 * Example:
 *   Then the CSV export at "/admin/reports/varbase/content/created/export" should be a CSV download
 */
Then(/^the CSV export at "([^"]*)" should be a CSV download$/, async function (exportPath) {
  const origin = new URL(this.page.url()).origin;
  const url = origin + exportPath;
  const response = await this.page.context().request.get(url);
  assert.ok(response.ok(), `Expected HTTP 200 from the CSV export "${exportPath}", got ${response.status()} ${response.statusText()}.`);
  const contentType = (response.headers()['content-type'] || '').toLowerCase();
  assert.ok(contentType.includes('csv') || contentType.includes('application/octet-stream'), `Expected a CSV content type from "${exportPath}", got "${contentType}".`);
  const body = await response.text();
  assert.ok(body.length > 0, `Expected a non-empty CSV body from the export "${exportPath}".`);
});
