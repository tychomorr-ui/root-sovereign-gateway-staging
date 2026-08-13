import { useEffect, useMemo, useState } from "react";
import { countyConfigurations, needDescriptions, publicSources, type County, type Need, type Source } from "./policy";
import { cmapAlignment } from "./cmap";
import { reclaimInitiative, registryDescriptors } from "./reclaim";

type View = "home" | "reclaim" | "member" | "steward" | "truth" | "services" | "proof" | "emergency";
type RootAccount = { id: string; handle: string };
type PathwayItem = { sourceId: string; stage: "saved" | "ready" | "complete"; createdAt: number; updatedAt: number };
type RegionalFeature = { properties: { countyId: string; label: string; resourceScope: string }; geometry: { coordinates: number[][][] } };
type RegionalMapData = { features: RegionalFeature[] };

const links = [
  ["XINUS MonarchOS", "https://xinus.one/"], ["Tesseract", "https://tesseract.manus.space/"], ["NEXINUS Dashboard", "https://xinusdash-doy5g86k.manus.space/"],
  ["Sovereign App", "https://sovereignapp-hkcgwye7.manus.space/"], ["Resonate Earth", "https://resonate-earth.live/"], ["Universal Truth", "https://universaltruth.life/"],
] as const;

const stageLabels: Record<PathwayItem["stage"], string> = { saved: "Saved for later", ready: "Ready to act", complete: "My step is complete" };

function App() {
  const [view, setView] = useState<View>("home");
  const [pathway, setPathway] = useState<PathwayItem[]>([]);
  const [notice, setNotice] = useState("");
  const [account, setAccount] = useState<RootAccount | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [pathwayReady, setPathwayReady] = useState(false);
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [selectedNeed, setSelectedNeed] = useState<Need | "All">("All");
  const [selectedCounty, setSelectedCounty] = useState<County | "All">("All");
  const [regionalMap, setRegionalMap] = useState<RegionalMapData | null>(null);
  const [authMessage, setAuthMessage] = useState("A ROOT account is optional until you choose to save a private action plan.");
  const sources = useMemo(() => publicSources(), []);
  const sourceById = useMemo(() => new Map(sources.map(source => [source.id, source])), [sources]);
  const matchingSources = sources.filter(source => (selectedNeed === "All" || source.category === selectedNeed) && (selectedCounty === "All" || source.county === selectedCounty));
  const planSources = pathway.map(item => ({ item, source: sourceById.get(item.sourceId) })).filter((entry): entry is { item: PathwayItem; source: Source } => Boolean(entry.source));

  const requestPathway = async (method: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown, sourceId?: string) => {
    const response = await fetch(sourceId ? `/api/pathway/${encodeURIComponent(sourceId)}` : "/api/pathway", {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      credentials: "same-origin",
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "ROOT could not update your private action plan.");
    setPathway(payload.items);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async response => response.ok ? response.json() : null)
      .then(payload => { if (active) { if (payload?.user) setAccount(payload.user); setAuthReady(true); } })
      .catch(() => { if (active) { setAuthMessage("Account service is unavailable on this preview. No account data is being collected here."); setAuthReady(true); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!account) { setPathway([]); setPathwayReady(true); return; }
    setPathwayReady(false);
    requestPathway("GET").catch(error => setNotice(error instanceof Error ? error.message : "ROOT could not load your private action plan.")).finally(() => setPathwayReady(true));
  }, [account?.id]);

  useEffect(() => {
    if (view !== "reclaim" || regionalMap) return;
    fetch("/reclaim-regional-map-v0.1.geojson")
      .then(response => response.ok ? response.json() : null)
      .then(payload => { if (payload?.features) setRegionalMap(payload); })
      .catch(() => undefined);
  }, [view, regionalMap]);

  const submitAuth = async (mode: "register" | "login") => {
    setAuthMessage(mode === "register" ? "Creating your local ROOT account…" : "Opening your ROOT session…");
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ handle, password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The account request could not be completed.");
      setAccount(payload.user);
      setPassword("");
      setAuthMessage(mode === "register" ? "Your ROOT account and private action plan remain inside ROOT. No external identity provider was used." : "Your local ROOT session is active.");
    } catch (error) { setAuthMessage(error instanceof Error ? error.message : "The account request could not be completed."); }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    setAccount(null);
    setAuthMessage("Your ROOT session has ended on this device.");
  };

  const deleteAccount = async () => {
    const confirmation = window.prompt("Enter your ROOT password to permanently delete this local account, its action plan, and its sessions.");
    if (!confirmation) return;
    try {
      const response = await fetch("/api/auth/account", { method: "DELETE", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ password: confirmation }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Account deletion could not be completed.");
      setAccount(null);
      setPathway([]);
      setAuthMessage("Your local ROOT account, private action plan, and active sessions were deleted.");
    } catch (error) { setAuthMessage(error instanceof Error ? error.message : "Account deletion could not be completed."); }
  };

  const save = async (source: Source) => {
    if (!account) { setView("member"); setNotice("Open a local ROOT account before saving a private action-plan step. ROOT will not contact a provider."); return; }
    try {
      await requestPathway("POST", { sourceId: source.id });
      setView("member");
      setNotice(`Saved “${source.title}” to your private action plan. ROOT has not contacted anyone.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not save that action-plan step."); }
  };

  const updateStage = async (sourceId: string, stage: PathwayItem["stage"]) => {
    try { await requestPathway("PATCH", { sourceId, stage }); } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not update that step."); }
  };
  const remove = async (sourceId: string) => {
    try { await requestPathway("DELETE", undefined, sourceId); } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not remove that step."); }
  };

  const navigator = <section className="navigator" aria-label="Regional connection navigator">
    <div>
      <p className="eyebrow">CONNECTION NAVIGATOR</p>
      <h2>Choose the region and kind of help you want to explore.</h2>
      <p>ROOT filters reviewed public pathways by your choice. It does not score you, send your details, or decide eligibility.</p>
    </div>
    <div>
      <div className="region-chips">
        <button className={selectedCounty === "All" ? "active" : ""} onClick={() => setSelectedCounty("All")}>All published regions</button>
        {countyConfigurations.filter(county => county.publicationState === "published").map(county => <button className={selectedCounty === county.id ? "active" : ""} key={county.id} onClick={() => setSelectedCounty(county.id)}>{county.label}</button>)}
      </div>
      <div className="need-chips">
        <button className={selectedNeed === "All" ? "active" : ""} onClick={() => setSelectedNeed("All")}>All pathways</button>
        {(Object.keys(needDescriptions) as Need[]).map(need => <button className={selectedNeed === need ? "active" : ""} key={need} onClick={() => setSelectedNeed(need)}>{need}</button>)}
      </div>
    </div>
    {selectedNeed !== "All" && <p className="selection-note"><b>{selectedNeed}:</b> {needDescriptions[selectedNeed]}</p>}
  </section>;

  return <div className="app">
    <header>
      <button className="brand" onClick={() => setView("home")}><span>R</span><b>ROOT <small>SOVEREIGN GATEWAY</small></b></button>
      <nav><button onClick={() => setView("home")}>Gateway</button><button onClick={() => setView("reclaim")}>Project Reclaim</button><button onClick={() => setView("services")}>Connection center</button><button onClick={() => setView("member")}>Member space</button></nav>
      <button className="pill" onClick={() => setView("member")}>{account ? `${account.handle} ↗` : "Open ROOT ↗"}</button>
    </header>

    {view === "home" && <main>
      <section className="hero"><p className="eyebrow">PRIVATE BY DEFAULT</p><h1>ROOT is the gateway.<br /><i>Take the next step on your terms.</i></h1><p className="lede">ROOT organizes reviewed sources into an action plan you control. It never scores your life, files an application, contacts a provider, or shares your pathway without a separate grant.</p><div className="actions"><button className="pill" onClick={() => setView("services")}>Find a pathway</button><button className="line" onClick={() => setView("member")}>Open my private plan</button></div></section>
      <section className="principles"><article><b>Choose</b><span>Pick a need without creating a public profile.</span></article><article><b>Prepare</b><span>Save official next steps in your private plan.</span></article><article><b>Decide</b><span>You choose whether to call, apply, or leave ROOT.</span></article><article><b>Revoke</b><span>No external access exists unless you explicitly grant it.</span></article></section>
      <section className="control-surface"><p className="eyebrow">FLAGSHIP INITIATIVE</p><h2>Project Reclaim: physical work first.</h2><div><button onClick={() => setView("reclaim")}><b>Restore</b><span>Land, wildfire resilience, and stewardship</span></button><button onClick={() => setView("reclaim")}><b>Recover</b><span>Wood, biomass, material, and community value</span></button><button onClick={() => setView("reclaim")}><b>Rebuild</b><span>Workforce, training, opportunity, and participation</span></button><button onClick={() => setView("reclaim")}><b>Prove</b><span>Evidence posture without fabricated metrics</span></button></div></section>
      <section className="control-surface"><p className="eyebrow">ROOT CONTROL SURFACE</p><h2>Connection without capture.</h2><div><button onClick={() => setView("services")}><b>Connection center</b><span>Reviewed regional pathways</span></button><button onClick={() => setView("member")}><b>My action plan</b><span>Private steps you control</span></button><button onClick={() => setView("emergency")}><b>Urgent support</b><span>Clear crisis boundaries</span></button><button onClick={() => setView("proof")}><b>Proof ledger</b><span>Consent receipts, not scores</span></button></div></section>
      <section className="connections"><p className="eyebrow">ECOSYSTEM HANDOFFS</p><h2>Open a destination by choice.</h2><p>These links do not carry your ROOT profile, permissions, session, or action-plan data.</p><div>{links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer"><b>{label} ↗</b><small>Link only · no ROOT data transfer</small></a>)}</div></section>
    </main>}

    {view === "reclaim" && <main className="page">
      <section className="reclaim-hero"><p className="eyebrow">PROJECT RECLAIM · FLAGSHIP INITIATIVE</p><h1>{reclaimInitiative.headline}</h1><p className="lede">{reclaimInitiative.mission}</p><p className="reclaim-principle">“{reclaimInitiative.principle}”</p><div className="reclaim-status"><b>Initiative status: IN DEVELOPMENT</b><span>No verified active Project Reclaim projects, jobs, material inventory, partners, metrics, evidence objects, signatures, CIDs, or ledger records are published in ROOT today.</span></div></section>
      <section className="reclaim-loop"><p className="eyebrow">THE OPERATING LOOP</p><h2>{reclaimInitiative.evidenceLoop}</h2><p>ROOT is the navigation and permission layer for this future system. The physical mission comes first; technology makes authorized work visible, organized, auditable, and scalable after real records exist.</p></section>
      <section className="reclaim-pillars">{reclaimInitiative.pillars.map(pillar => <article key={pillar.id}><p className="tag">{pillar.status.replaceAll("_", " ")}</p><h2>{pillar.label}</h2><p>{pillar.detail}</p></article>)}</section>
      <section className="reclaim-paths"><article><p className="eyebrow">PARTICIPATION PATHS</p><h2>People enter from different directions.</h2>{reclaimInitiative.participation.map(path => <div className="reclaim-path" key={path.role}><b>{path.role}</b><span>{path.path}</span><small>{path.boundary}</small></div>)}</article><article><p className="eyebrow">REGIONAL FOUNDATION</p><h2>Local first, federated later.</h2><p><b>Mendocino County:</b> reviewed public pathways are live in ROOT.</p><p><b>Lake County:</b> reviewed public pathways are live in ROOT under your authorized regional scope.</p><p><b>Future regions:</b> must be explicitly configured, source-reviewed, and approved before publication.</p><button className="pill" onClick={() => setView("services")}>Browse reviewed pathways</button></article></section>
      <section className="offline-map"><div><p className="eyebrow">OFFLINE REGIONAL ORIENTATION MAP</p><h2>Public boundaries, local cache, no surveillance.</h2><p>The map uses generalized public county boundaries bundled with ROOT. After ROOT has loaded once on a secure device, the public map pack can be cached for offline orientation. No property, parcel, private address, member location, work site, or emergency location is included.</p></div>{regionalMap ? <RegionalMap data={regionalMap} /> : <p className="map-loading">Loading public map pack…</p>}<small>Orientation only. Not a legal boundary, parcel, evacuation, hazard, or project-site map.</small></section>
      <section className="reclaim-registry"><p className="eyebrow">OPERATIONAL REGISTRY FOUNDATION</p><h2>All the records you named—controlled by evidence, not hype.</h2><p>These registries exist as source-governed schemas and are currently empty. ROOT will show a real record only after the stated publication requirements are supplied and reviewed.</p><div>{registryDescriptors.map(descriptor => <article key={descriptor.kind}><p className="tag">DATA UNAVAILABLE</p><h3>{descriptor.label}</h3><p>{descriptor.purpose}</p><small><b>Required:</b> {descriptor.requiredForPublication.join(" · ")}</small></article>)}</div><a className="line" href="/project-reclaim-registry-v0.1.json" target="_blank" rel="noreferrer">View public registry foundation ↗</a></section>
      <section className="reclaim-pack"><div><p className="eyebrow">FUTURE MONARCH OS RESOURCE PACK</p><h2>Offline-ready public information, not private-data sync.</h2><p>ROOT now publishes a versioned public review pack for future local caching. It includes approved public sources and initiative structure only. Live mesh synchronization, signing, node enrollment, IPFS, CID generation, and peer replication are not active.</p></div><a className="line" href="/project-reclaim-resource-pack-v0.1.json" target="_blank" rel="noreferrer">View public resource pack ↗</a></section>
      <section className="cmap-boundary"><p className="eyebrow">CMAP REFERENCE ALIGNMENT</p><h2>Proof and mesh claims begin with real keys and real records.</h2><p>ROOT references the published {cmapAlignment.protocolReference.handshake} handshake and its quarantine-first trust boundary. No ROOT CMAP peer is enrolled, and no Project Reclaim CID, signature, or ledger reference is issued until an actual public record is canonically serialized, addressed, signed, and verified.</p><div><span>PEERS: {cmapAlignment.enrolledPeers.length}</span><span>PUBLIC OPERATIONAL RECORDS: {cmapAlignment.publicOperationalRecords.length}</span><span>SYNC: PLANNED · NOT ACTIVE</span></div><a className="line" href="/project-reclaim-cmap-manifest-v0.1.json" target="_blank" rel="noreferrer">View CMAP alignment manifest ↗</a></section>
      <section className="reclaim-evidence"><p className="eyebrow">HONEST EVIDENCE POSTURE</p><h2>Real records or no claim.</h2><p>Future Project Reclaim records may connect work to evidence through <b>event → evidence → canonical record → signature → verification</b>. ROOT will not claim a project, job, grant, partnership, mitigation outcome, metric, CID, signature, or ledger proof until it is real, authorized, and verifiable.</p><span>Current operational registry: DATA UNAVAILABLE</span></section>
    </main>}

    {view === "services" && <main className="page"><p className="eyebrow">CONNECTION CENTER</p><h1>More than a directory.</h1><p className="lede">Choose a region and category, see what the official source can do, preserve the next step privately, and only then decide whether to hand yourself off. ROOT has no provider referral agreement and sends no information on your behalf.</p>{navigator}<section className="connection-steps"><article><b>1 · Find</b><span>Filter a reviewed source by your chosen region and need.</span></article><article><b>2 · Plan</b><span>Save a minimal private step in ROOT.</span></article><article><b>3 · Act</b><span>You choose whether to use the official contact or web route.</span></article><article><b>4 · Reflect</b><span>Mark your own progress; no provider sees it.</span></article></section><div className="cards">{matchingSources.map(source => <article key={source.id}><p className="tag">{source.category} · {countyConfigurations.find(county => county.id === source.county)?.label ?? source.county} · REVIEWED</p><h2>{source.title}</h2><p>{source.note}</p><p className="next-step"><b>What you can do:</b> {source.action}</p>{source.contact && <p className="contact">{source.contact}</p>}<a href={source.url} target="_blank" rel="noreferrer">Open official source ↗</a><button className="text" onClick={() => save(source)}>Save my next step</button></article>)}</div></main>}

    {view === "member" && <main className="page"><p className="eyebrow">MEMBER SPACE</p><h1>My private action plan</h1><p className="lede">This plan stays inside your encrypted ROOT account. Saving a step never contacts a provider, starts an application, or shares your identity.</p>{notice && <p className="notice" role="status">{notice}</p>}<section className="member-grid">{!authReady ? <article><h2>Checking ROOT account</h2><p>ROOT is checking only its own local session service.</p></article> : !account ? <article className="account-card"><h2>Local ROOT account</h2><p>Create an account with a ROOT handle and password to retain a private action plan. ROOT does not use a social login, email identity broker, advertising identifier, or tracking SDK.</p><label>ROOT handle<input value={handle} onChange={event => setHandle(event.target.value)} autoComplete="username" placeholder="your-root-handle" /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" placeholder="14 characters minimum" /></label><div className="actions"><button className="pill" onClick={() => submitAuth("register")}>Create local account</button><button className="line" onClick={() => submitAuth("login")}>Sign in</button></div><p className="auth-message">{authMessage}</p></article> : <article><h2>{account.handle}</h2><p><b>Account authority:</b> self-owned ROOT account.</p><p><b>External identity provider:</b> none.</p><p><b>Current session:</b> opaque, HTTP-only ROOT session cookie.</p><button className="line" onClick={signOut}>Sign out</button><button className="text danger" onClick={deleteAccount}>Delete account and action plan</button><p className="auth-message">{authMessage}</p></article>}<article className="plan-card"><h2>My steps</h2>{!account ? <p>Open a local ROOT account to save a private plan. Public sources remain available without a sign-in.</p> : !pathwayReady ? <p>Loading your private plan…</p> : planSources.length === 0 ? <p>No saved steps yet. Choose a reviewed regional pathway when you are ready.</p> : planSources.map(({ item, source }) => <div className="path" key={item.sourceId}><p className="tag">{source.category}</p><b>{source.title}</b><span>{source.action}</span><label>My progress<select value={item.stage} onChange={event => updateStage(item.sourceId, event.target.value as PathwayItem["stage"])}>{(Object.keys(stageLabels) as PathwayItem["stage"][]).map(stage => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}</select></label><div className="path-actions"><a href={source.url} target="_blank" rel="noreferrer">Official source ↗</a><button onClick={() => remove(item.sourceId)}>Remove</button></div></div>)}<button className="pill" onClick={() => setView("services")}>Find a pathway</button></article><article><h2>What ROOT will not do</h2><p>ROOT will not submit a provider form, send a referral, expose your plan to an operator, or create a behavioral profile.</p><p>Eligibility, appointments, service availability, and outcomes belong to the official source—not ROOT.</p><button className="line" onClick={() => setView("proof")}>View permission boundary</button><button className="text" onClick={() => setView("emergency")}>Urgent-support boundary</button></article></section></main>}

    {view === "steward" && <main className="page"><p className="eyebrow">DIRECTORY STEWARD</p><h1>Clear limits, visible review.</h1><section className="member-grid"><article><h2>Authority</h2><p>Review approved Mendocino and Lake County public-source accuracy and the date each official source was checked.</p><p>Excluded: member plans, operator roster, Monarch nodes, attestations, provider decisions, and unverified operational registries.</p></article><article><h2>Regional publication</h2><p>Mendocino and Lake County are published under the current approved regional scope. Any future county still requires explicit source review and a publication decision.</p></article></section></main>}
    {view === "truth" && <main className="page"><p className="eyebrow">TRUTH TALK</p><h1>Provenance before amplification.</h1><p className="lede">Truth Talk is ROOT’s linked public conversation layer. A post identifies its claim type, sources, and correction path; TruthOK signals describe evidence posture, never a binary verdict.</p><section className="member-grid"><article><h2>Public provenance feed</h2><p>The public ledger is quiet. The first post will declare its claim type and create its own integrity receipt.</p><p><b>Signals:</b> identity-bound, integrity-bound, sources-declared, review-completed.</p></article><article><h2>Linked, not fused</h2><p>ROOT holds consent and member controls. Truth Talk carries public provenance and corrections without importing a member’s private action plan.</p></article></section></main>}
    {view === "proof" && <main className="page"><p className="eyebrow">PROOF LEDGER</p><h1>Receipts, not scores.</h1><p className="lede">ROOT records a human-readable explanation of consent. It does not turn a member into an employability, risk, or universal-truth score.</p><section className="member-grid"><article><h2>Current receipt</h2><p><b>External provider access:</b> none.</p><p><b>Private action plan:</b> visible to the member only.</p><p><b>Revocation:</b> deleting a step removes it from ROOT; it cannot retract information the member independently shares with an official source.</p></article><article><h2>Correction boundary</h2><p>When a public source changes, a steward may update or remove the card. Private member data never becomes a public correction artifact.</p></article></section></main>}
    {view === "emergency" && <main className="page"><p className="eyebrow">URGENT SUPPORT BOUNDARY</p><h1>Clear choices in a hard moment.</h1><p className="lede">ROOT does not dispatch emergency services, monitor location, or retain a crisis history. It can show verified public contact paths so you decide what to do next.</p><section className="urgent-grid"><article className="urgent"><p className="tag">LIFE-THREATENING EMERGENCY</p><h2>Call 911</h2><p>If there is immediate danger or a life-threatening emergency, use local emergency services.</p></article><article><p className="tag">MENDOCINO 24/7 MENTAL-HEALTH CRISIS</p><h2>County Crisis Line</h2><p>Mendocino County lists this as a 24/7 crisis line for immediate mental-health help.</p><p className="contact"><b>1-855-838-0404</b></p><a href="https://www.mendocinocounty.gov/residents/health/mental-health" target="_blank" rel="noreferrer">Official county details ↗</a></article><article><p className="tag">LAKE 24-HOUR MENTAL-HEALTH CRISIS</p><h2>County Crisis Line</h2><p>Lake County Behavioral Health Services lists this emergency crisis line.</p><p className="contact"><b>800-900-2075</b></p><a href="https://lcbh.lakecountyca.gov/173/Behavioral-Health-Services" target="_blank" rel="noreferrer">Official county details ↗</a></article></section></main>}
    <footer><span>ROOT self-owned gateway</span><button onClick={() => setView("steward")}>Directory Steward view</button><span className="status">● Connection active</span></footer>
  </div>;
}

function RegionalMap({ data }: { data: RegionalMapData }) {
  const points = data.features.flatMap(feature => feature.geometry.coordinates[0]);
  const longitudes = points.map(point => point[0]);
  const latitudes = points.map(point => point[1]);
  const minLon = Math.min(...longitudes), maxLon = Math.max(...longitudes), minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes);
  const width = 720, height = 410, padding = 26;
  const x = (longitude: number) => padding + ((longitude - minLon) / (maxLon - minLon)) * (width - 2 * padding);
  const y = (latitude: number) => height - padding - ((latitude - minLat) / (maxLat - minLat)) * (height - 2 * padding);
  return <svg className="regional-map-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Generalized Mendocino and Lake County public orientation map">{data.features.map(feature => {
    const anchor = feature.geometry.coordinates[0][Math.floor(feature.geometry.coordinates[0].length / 2)];
    return <g key={feature.properties.countyId}><polygon className={`county-shape county-${feature.properties.countyId}`} points={feature.geometry.coordinates[0].map(point => `${x(point[0])},${y(point[1])}`).join(" ")} /><text x={x(anchor[0])} y={y(anchor[1])} className="county-label">{feature.properties.label}</text><text x={x(anchor[0])} y={y(anchor[1]) + 19} className="county-state">{feature.properties.resourceScope}</text></g>;
  })}</svg>;
}

export default App;
