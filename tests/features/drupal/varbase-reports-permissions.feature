@varbase_reports @reports @permissions
Feature: Varbase Reports access permissions
  Varbase Reports gates its pages behind dedicated permissions:
    - the landing needs "access site reports"
    - the content report needs "access varbase content reports"
    - the users report needs "access varbase users reports"
  Only privileged administrators may open them; anonymous visitors and
  ordinary authenticated users without the reporting permissions are denied.

  Scenario: An anonymous visitor cannot reach the Varbase reports landing
    Given I am an anonymous visitor
    When I am on "/admin/reports/varbase"
    Then I should see "Access denied"

  Scenario: An anonymous visitor cannot reach the content report
    Given I am an anonymous visitor
    When I am on "/admin/reports/varbase/content/created"
    Then I should see "Access denied"

  Scenario: An anonymous visitor cannot reach the users report
    Given I am an anonymous visitor
    When I am on "/admin/reports/varbase/users/registered"
    Then I should see "Access denied"

  Scenario: An ordinary authenticated user without the reporting permissions is denied the landing
    Given I am a logged in user with the "Authenticated" user
    When I am on "/admin/reports/varbase"
    Then I should see "Access denied"

  Scenario: An ordinary authenticated user without the reporting permissions is denied the content report
    Given I am a logged in user with the "Authenticated" user
    When I am on "/admin/reports/varbase/content/created"
    Then I should see "Access denied"

  Scenario: An ordinary authenticated user without the reporting permissions is denied the users report
    Given I am a logged in user with the "Authenticated" user
    When I am on "/admin/reports/varbase/users/registered"
    Then I should see "Access denied"

  Scenario: An administrator is granted the landing and both reports
    Given I am a logged in user with the "Webmaster" user
    When I open the administration page "/admin/reports/varbase"
    Then I should see "Varbase reports"
    When I open the administration page "/admin/reports/varbase/content/created"
    Then I should see "Number of content created"
    When I open the administration page "/admin/reports/varbase/users/registered"
    Then I should see "Number of users registered"
