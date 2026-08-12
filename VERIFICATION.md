# ROOT Clean Restart Verification

| Check | Result |
|---|---|
| TypeScript | Passed with no errors. |
| Policy tests | Three tests passed: reviewed Mendocino public-source filtering, Lake County publication denial, and private pathway ownership. |
| Production build | Vite build passed. |
| Gateway visual check | The public gateway renders a private-by-default message, Mirror Law pillars, and link-only ecosystem handoffs. |
| Project Reclaim visual check | The directory renders exactly two reviewed Mendocino source cards, clear official-source links, private save/report actions, and an explicit Lake County watchlist-only boundary. |
| Member pathway visual check | Saving a reviewed source moves it into the member pathway preview, confirms that ROOT has not contacted anyone, and shows the Permission Center’s owner-only and no-external-access statements. |
| Directory Steward visual check | The steward view permits only Mendocino source-issue review and visibly disables Lake County publication while listing excluded authority over the roster, Monarch nodes, and attestations. |
| Control-surface visual check | The clean gateway now presents member permissions, proof ledger, Truth Talk, and service-access entry points using the same private-control framing as the live reference. |
| Truth Talk visual check | The clean `/truth` surface presents claim type, declared sources, correction path, and non-binary TruthOK signals while explicitly separating public conversation from private member-pathway data. |
| Independent staging check | The verified static ROOT build is live at the temporary staging URL on port 4173; its gateway page loads with the public control surface, regional-source boundaries, and link-only ecosystem handoffs. |
| Tracking-resource check | Browser resource inspection on the temporary staging URL returned only the staging origin; no third-party tracking or advertising host was loaded. |
| Persistent-host investigation | The project’s Replit reference returns a not-found page, and the browser has no authenticated GitHub session to enable Pages. The public deployment repository and Pages workflow are retained for activation when repository Pages permission is available. |
| Self-owned account visual check | The ROOT self-owned-auth service serves a local account screen that requests only a ROOT handle and password, explicitly rules out social login, email identity brokers, advertising identifiers, and tracking SDKs, and keeps public sources available without sign-in. |
| Self-owned account resource check | Browser resource inspection on the self-owned-auth staging service returned only the ROOT staging origin; no third-party identity or tracking host was loaded. |

## Release Boundary

This clean restart is a local preview. It intentionally has no database, OAuth session, or production server because it is not attached to a managed full-stack project. It must be integrated into such a project before it can replace the existing live ROOT domain.
