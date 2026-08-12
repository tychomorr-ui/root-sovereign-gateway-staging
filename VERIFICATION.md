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

## Release Boundary

This clean restart is a local preview. It intentionally has no database, OAuth session, or production server because it is not attached to a managed full-stack project. It must be integrated into such a project before it can replace the existing live ROOT domain.
