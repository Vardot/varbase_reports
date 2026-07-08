@varbase_reports @reports @content-report
Feature: Varbase content KPIs report
  The Varbase content report is a Views page backed by the
  "Varbase KPIs Content reports" view. It groups published content by its
  created day and shows how many pieces of content were created, with a
  downloadable CSV data export.

  # Page display path: /admin/reports/varbase/content/created
  #   permission: "access varbase content reports"
  #   table columns (real view field labels): "Created date", "Number of content created"
  # CSV data export path: /admin/reports/varbase/content/created/export

  Scenario: The content report renders its KPI table columns for an administrator
    Given I am a logged in user with the "Webmaster" user
    When I open the administration page "/admin/reports/varbase/content/created"
    Then I should see "Created date"
    And I should see "Number of content created"

  Scenario: The content report exposes a working CSV data export
    Given I am a logged in user with the "Webmaster" user
    When I am on "/admin/reports/varbase/content/created"
    Then the CSV export at "/admin/reports/varbase/content/created/export" should be a CSV download

  @wip
  Scenario: The content report CSV data export path is reachable in the browser
    # Navigating directly to a CSV attachment triggers a browser download rather than
    # a page render, which is fragile in headless CI, so this direct-visit check is @wip.
    Given I am a logged in user with the "Webmaster" user
    When I am on "/admin/reports/varbase/content/created/export"
    Then I should not see "Access denied"
    And I should not see "Page not found"
