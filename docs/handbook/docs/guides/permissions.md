# Who can do what

You sign in with GitHub; your teams come from the catalog (`org/org.yaml`).

| | Everyone signed in | The service's owning team | Platform team |
|---|---|---|---|
| See services, docs, deployments, health, logs | ✓ | ✓ | ✓ |
| Create a service | for a team you're in | ✓ | ✓ |
| Request help | ✓ | ✓ | ✓ |
| Restart, scale, change resources, add a database, deploy | | ✓ | ✓ |
| Remove a service from the catalog | | ✓ | ✓ |
| See and cancel scaffolder runs | your own | your own | all |
| New golden-path template, template editor | | | ✓ |

If a button is greyed out in **Operate**, you're not in the team that owns the
service: ask a member of that team, or use **Request help**.

## How it's enforced

Rules are checked on the server, not only hidden in the page:

- the portal's permission policy (ownership comes from the service's
  `spec.owner` and your team memberships)
- the Operate API checks ownership before a restart
- every template that changes a service starts with a step that checks you're
  in its owning team, so a hand-edited form can't skip it

Changes still go through pull requests, so the platform team reviews them too.

To be added to a team, open a pull request to `org/org.yaml` in the portal repo.
