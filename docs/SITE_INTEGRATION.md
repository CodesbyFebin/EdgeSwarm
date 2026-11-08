# Landing and documentation integration

The two user-supplied archives were inspected as source data, not executed as setup instructions. The landing design supplied its purple/green visual direction, large editorial hero, glass panels and workflow sections. The static GitHub Pages implementation uses native HTML/CSS so it does not need a separate framework or external script CDN.

Unsupported illustrative counters, fake transaction signatures, timer-driven payment animations, competitor comparisons, unavailable SDK install commands, USDC/program-enforced settlement and independent real-device execution claims were removed from the public landing. The actual Devnet transaction and exported receipt are linked instead. The walkthrough animation is opt-in and can be paused to a still image.

The docs archive supplied the searchable sidebar, theme treatment and text-based Markdown renderer. Ten primary implementation guides are based on repository source documents and the implemented API. The original 100-page, approximately 281k-word corpus is loaded only when the blueprint archive is selected. Its unvalidated proposal status is declared in the data, a sticky banner, page review notes, and a disclosure around original text. It is not a GitBook account/service deployment, an independent audit, or a claim that the imported examples run.

The existing mobile app, desktop dashboard, PostgreSQL session engine and Solana APIs were preserved. app.agentswarm.in and the MLH submission were not changed. The screenshot’s 404 preview could not be reproduced: the current GitHub Pages URL returned 200. The wiki URL redirects to the repository, rather than a distinct demo page.

## Links to use

- Landing: https://codesbyfebin.github.io/EdgeSwarm/
- App: https://edge-swarm.vercel.app/
- Website alias: https://www.agentswarm.in/
- Documentation: https://www.agentswarm.in/docs
- Desktop: https://edge-swarm.vercel.app/dashboard
- Source: https://github.com/CodesbyFebin/EdgeSwarm
- Project walkthrough: https://github.com/CodesbyFebin/EdgeSwarm/blob/main/docs/WALKTHROUGH.md

Use the EdgeSwarm app URL rather than app.agentswarm.in, which returned a different “AgentSwarm Command Centre” title during review. Do not silently repoint that hostname or edit the MLH entry.

## Verification for this integration

- 72 tests passed: the existing 64 engine/API/payment cases plus eight landing/documentation regression checks.
- Production build and TypeScript checks passed. Existing API smoke and real Devnet genesis/intent smoke passed locally without sending funds.
- Browser checks exercised guide search, blueprint full-text search and navigation, the unvalidated-warning/disclosure boundary, and theme switching. The landing GIF play/pause controls changed the actual image source and aria-pressed state correctly.
- CSS layout snapshots in approximately 390-pixel same-origin frame viewports showed no horizontal overflow for both pages; this was a responsive-layout check, not physical-device or mobile-browser behavioral QA.
