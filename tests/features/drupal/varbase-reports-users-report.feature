@varbase_reports @reports @users-report
Feature: Varbase users KPIs report
  The Varbase users report is a Views page backed by the
  "Varbase KPIs Users Reports" view. It groups registered users by their
  created day and shows how many users registered, with a downloadable
  CSV data export.

  # Page display path: /admin/reports/varbase/users/registered
  #   permission: "access varbase users reports"
  #   table columns (real view field labels): "Created date", "Number of users registered"
  # CSV data export path: /admin/reports/varbase/users/registered/export

  Scenario: The users report renders its KPI table columns for an administrator
    Given I am a logged in user with the "Webmaster" user
    When I open the administration page "/admin/reports/varbase/users/registered"
    Then I should see "Created date"
    And I should see "Number of users registered"

  Scenario: The users report exposes a working CSV data export
    Given I am a logged in user with the "Webmaster" user
    When I am on "/admin/reports/varbase/users/registered"
    Then the CSV export at "/admin/reports/varbase/users/registered/export" should be a CSV download

  @wip
  Scenario: The users report CSV data export path is reachable in the browser
    # Navigating directly to a CSV attachment triggers a browser download rather than
    # a page render, which is fragile in headless CI, so this direct-visit check is @wip.
    Given I am a logged in user with the "Webmaster" user
    When I am on "/admin/reports/varbase/users/registered/export"
    Then I should not see "Access denied"
    And I should not see "Page not found"
