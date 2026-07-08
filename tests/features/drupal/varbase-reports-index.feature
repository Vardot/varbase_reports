@varbase_reports @reports
Feature: Varbase Reports index
  Varbase Reports adds a "Varbase reports" landing under Administration » Reports
  that links administrators to the statistical content and users reports.

  # Route: varbase_reports.reports_index -> /admin/reports/varbase
  # Title: "Varbase reports", permission: "access site reports".
  # The landing lists its child report menu links:
  #   - "Varbase content reports" (Statistical reports about content.)
  #   - "Varbase users reports"   (Statistical reports about users.)

  Scenario: An administrator sees the Varbase reports landing linking to the content and users reports
    Given I am a logged in user with the "Webmaster" user
    When I open the administration page "/admin/reports/varbase"
    Then I should see "Varbase reports"
    And I should see "Varbase content reports"
    And I should see "Statistical reports about content."
    And I should see "Varbase users reports"
    And I should see "Statistical reports about users."
