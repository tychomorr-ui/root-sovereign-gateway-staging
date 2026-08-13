import { useEffect, useMemo, useState } from "react";
import { countyConfigurations, needDescriptions, publicSources, type County, type Need, type Source } from "./policy";
import { cmapAlignment } from "./cmap";
import { firstAuthorizedRegistryRecords, reclaimInitiative, registryDescriptors } from "./reclaim";

type View = "home" | "reclaim" | "member" | "steward" | "truth" | "services" | "proof" | "emergency";
type RootAccount = { id: string; handle: string };
type PathwayItem = { sourceId: string; stage: "saved" | "ready" | "complete"; createdAt: number; updatedAt: number };
type LedgerKind = "account_control" | "attestation" | "consent" | "consent_grant" | "claim" | "correction";
type LedgerState = "active" | "recorded_not_executed" | "corrected" | "withdrawn" | "revoked";
type LedgerItem = { id: string; kind: LedgerKind; state: LedgerState; payload: Record<string, unknown>; relation: { correctsId?: string } | null; integrityDigest: string; createdAt: number; updatedAt: number };
type IdentityProfile = { displayName: string; selfDescription: string; identityPosture: "private" | "pseudonymous" | "disclosed_by_choice" | "organization_steward"; verification: "self_asserted_not_third_party_verified" };
type SessionView = { id: string; current: boolean; createdAt: number; expiresAt: number };
type IdentityState = { profile: IdentityProfile; sessions: SessionView[]; recoveryKitActive: boolean };
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
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [ledgerReady, setLedgerReady] = useState(false);
  const [attestationLabel, setAttestationLabel] = useState("");
  const [attestationStatement, setAttestationStatement] = useState("");
  const [claimType, setClaimType] = useState("report");
  const [claimStatement, setClaimStatement] = useState("");
  const [claimSources, setClaimSources] = useState("");
  const [identity, setIdentity] = useState<IdentityState | null>(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [identityPosture, setIdentityPosture] = useState<IdentityProfile["identityPosture"]>("private");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryHandle, setRecoveryHandle] = useState("");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [grantRecipient, setGrantRecipient] = useState("");
  const [grantPurpose, setGrantPurpose] = useState("");
  const [grantScopes, setGrantScopes] = useState<string[]>(["private_claim_drafts"]);
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

  const requestLedger = async (method: "GET" | "POST", path = "/api/ledger", body?: unknown) => {
    const response = await fetch(path, { method, headers: body ? { "content-type": "application/json" } : undefined, credentials: "same-origin", body: body ? JSON.stringify(body) : undefined });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "ROOT could not update your private record.");
    setLedger(payload.items);
  };

  const loadIdentity = async () => {
    const response = await fetch("/api/identity", { credentials: "same-origin" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "ROOT could not load your sovereign identity controls.");
    setIdentity(payload);
    setProfileName(payload.profile.displayName);
    setProfileDescription(payload.profile.selfDescription);
    setIdentityPosture(payload.profile.identityPosture);
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
    if (!account) { setPathway([]); setLedger([]); setIdentity(null); setPathwayReady(true); setLedgerReady(true); setIdentityReady(true); return; }
    setPathwayReady(false);
    setLedgerReady(false);
    setIdentityReady(false);
    Promise.all([requestPathway("GET"), requestLedger("GET"), loadIdentity()])
      .catch(error => setNotice(error instanceof Error ? error.message : "ROOT could not load your private member records."))
      .finally(() => { setPathwayReady(true); setLedgerReady(true); setIdentityReady(true); });
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

  const createAttestation = async () => {
    try {
      await requestLedger("POST", "/api/ledger/attestations", { label: attestationLabel, statement: attestationStatement });
      setAttestationLabel(""); setAttestationStatement(""); setNotice("Your private attestation now has a ROOT integrity receipt. It has not been published or shared.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not create that private attestation."); }
  };

  const createConsent = async (scope: string) => {
    try {
      await requestLedger("POST", "/api/ledger/consents", { scope });
      setNotice("ROOT recorded a private internal-storage consent receipt. No external recipient received access.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not create that consent receipt."); }
  };

  const createClaim = async () => {
    const sources = claimSources.split("\n").map(value => value.trim()).filter(Boolean);
    try {
      await requestLedger("POST", "/api/ledger/claims", { claimType, statement: claimStatement, sources });
      setClaimStatement(""); setClaimSources(""); setNotice("Your Truth Talk draft is private, source-declared, and unpublished. ROOT created an integrity receipt only.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not create that private claim draft."); }
  };

  const correctRecord = async (record: LedgerItem) => {
    const statement = window.prompt("Write a replacement correction statement. ROOT will retain a private correction link and will not publish either record.");
    if (!statement) return;
    try {
      await requestLedger("POST", `/api/ledger/${encodeURIComponent(record.id)}/correct`, { statement });
      setNotice("ROOT marked the original private record corrected and added a separate private correction receipt.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not correct that private record."); }
  };

  const changeLedgerState = async (record: LedgerItem) => {
    const action = ["consent", "consent_grant"].includes(record.kind) ? "revoke" : "withdraw";
    try {
      await requestLedger("POST", `/api/ledger/${encodeURIComponent(record.id)}/${action}`);
      setNotice(["consent", "consent_grant"].includes(record.kind) ? "ROOT revoked that private consent record. No external access existed to revoke." : "ROOT withdrew that private record and created a new integrity state.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not change that private record."); }
  };

  const saveIdentityProfile = async () => {
    try {
      const response = await fetch("/api/identity/profile", { method: "PUT", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ displayName: profileName, selfDescription: profileDescription, identityPosture }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ROOT could not save your identity posture.");
      setIdentity(current => current ? { ...current, profile: payload.profile } : current);
      setNotice("ROOT saved your voluntary, self-asserted identity posture. It has not been published or externally verified.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not save your identity posture."); }
  };

  const createRecoveryKit = async () => {
    try {
      const response = await fetch("/api/auth/recovery-kit", { method: "POST", credentials: "same-origin" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ROOT could not create a recovery kit.");
      setRecoveryCode(payload.recoveryCode);
      await loadIdentity();
      setNotice("Save the recovery code offline now. ROOT will show it only this time and stores only a hash.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not create a recovery kit."); }
  };

  const revokeRecoveryKit = async () => {
    try {
      const response = await fetch("/api/auth/recovery-kit", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("ROOT could not revoke the recovery kit.");
      setRecoveryCode(""); await loadIdentity(); setNotice("ROOT revoked the recovery kit. No recovery secret remains active.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not revoke the recovery kit."); }
  };

  const revokeOtherSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions/revoke-other", { method: "POST", credentials: "same-origin" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ROOT could not revoke other sessions.");
      setIdentity(current => current ? { ...current, sessions: payload.sessions } : current);
      setNotice("ROOT ended your other sessions. The session on this device remains active.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not revoke other sessions."); }
  };

  const recoverAccount = async () => {
    try {
      const response = await fetch("/api/auth/recover", { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ handle: recoveryHandle, recoveryCode: recoveryCodeInput, password: recoveryPassword }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ROOT could not use that recovery kit.");
      setAccount(payload.user); setRecoveryCodeInput(""); setRecoveryPassword(""); setAuthMessage("Your recovery kit reset the ROOT password and ended prior sessions. The kit is now invalid.");
    } catch (error) { setAuthMessage(error instanceof Error ? error.message : "ROOT could not use that recovery kit."); }
  };

  const createConsentGrant = async () => {
    try {
      await requestLedger("POST", "/api/ledger/grants", { recipientLabel: grantRecipient, purpose: grantPurpose, dataScopes: grantScopes });
      setGrantRecipient(""); setGrantPurpose(""); setNotice("ROOT recorded a proposed private grant. No data was transferred and no external recipient was contacted.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ROOT could not record that proposed consent grant."); }
  };

  const toggleGrantScope = (scope: string) => setGrantScopes(current => current.includes(scope) ? current.filter(item => item !== scope) : [...current, scope]);

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

  const identityControls = account && <section className="page sovereign-controls"><p className="eyebrow">SOVEREIGN IDENTITY CONTROLS</p><h2>Control your ROOT identity surface.</h2><p className="lede">Everything below stays inside your encrypted ROOT account unless a future, separate transfer is explicitly built and accepted. A record of consent is not a completed transfer.</p>{!identityReady || !identity ? <p>Loading private identity controls…</p> : <div className="member-grid identity-grid"><article><p className="eyebrow">VOLUNTARY PROFILE</p><h3>Describe yourself on your own terms.</h3><p>This is self-asserted, private, and never a legal or third-party verification.</p><label>Optional display name<input value={profileName} onChange={event => setProfileName(event.target.value)} placeholder="Private by default" /></label><label>Optional self-description<textarea value={profileDescription} onChange={event => setProfileDescription(event.target.value)} placeholder="How I choose to describe my ROOT presence." /></label><label>Identity posture<select value={identityPosture} onChange={event => setIdentityPosture(event.target.value as IdentityProfile["identityPosture"])}><option value="private">Private</option><option value="pseudonymous">Pseudonymous</option><option value="disclosed_by_choice">Disclosed by choice</option><option value="organization_steward">Organization steward</option></select></label><button className="pill" onClick={saveIdentityProfile}>Save private identity posture</button><small>Verification state: {identity.profile.verification.replaceAll("_", " ")}</small></article><article><p className="eyebrow">RECOVERY & SESSIONS</p><h3>Recover without an identity broker.</h3><p>Use a one-time recovery code stored offline. ROOT stores only its hash, never emails it, and cannot retrieve it for you.</p>{recoveryCode && <div className="recovery-code"><b>Save this once:</b><code>{recoveryCode}</code><small>Copy it to an offline location now. Replacing, using, or revoking the kit makes this code invalid.</small></div>}<p><b>Recovery kit:</b> {identity.recoveryKitActive ? "active" : "not active"}</p><div className="path-actions"><button className="line" onClick={createRecoveryKit}>{identity.recoveryKitActive ? "Replace recovery kit" : "Create recovery kit"}</button>{identity.recoveryKitActive && <button className="text danger" onClick={revokeRecoveryKit}>Revoke kit</button>}</div><p><b>Active sessions:</b> {identity.sessions.length} · ROOT intentionally shows no IP, device fingerprint, or behavioral trail.</p><button className="line" onClick={revokeOtherSessions}>End other sessions</button></article><article><p className="eyebrow">PROPOSED CONSENT GRANT</p><h3>Record a future sharing decision without sharing.</h3><p>ROOT records your stated recipient, purpose, scope, and revocation right. It does not contact the recipient or move any data.</p><label>Recipient label<input value={grantRecipient} onChange={event => setGrantRecipient(event.target.value)} placeholder="A future verifier or service" /></label><label>Purpose<textarea value={grantPurpose} onChange={event => setGrantPurpose(event.target.value)} placeholder="Why I might later choose to present selected private data." /></label><div className="scope-list">{[["identity_profile", "Identity profile"], ["private_attestations", "Private attestations"], ["private_claim_drafts", "Private claim drafts"], ["private_action_plan", "Private action plan"]].map(([scope, label]) => <label key={scope}><input type="checkbox" checked={grantScopes.includes(scope)} onChange={() => toggleGrantScope(scope)} /> {label}</label>)}</div><button className="pill" onClick={createConsentGrant}>Record proposed grant</button>{ledger.filter(record => record.kind === "consent_grant").map(record => <div className="grant-state" key={record.id}><b>{String(record.payload.recipientLabel)}</b><span>{record.state.replaceAll("_", " ")}</span>{record.state === "recorded_not_executed" && <button className="text danger" onClick={() => changeLedgerState(record)}>Revoke</button>}</div>)}</article><article><p className="eyebrow">PORTABILITY & INTEROPERABILITY</p><h3>Take your data without pretending it is a credential.</h3><p>Your export contains your voluntary profile and private ROOT records. It is not a DID, a W3C Verifiable Credential, an external signature, a public status list, or a verifier presentation.</p><a className="pill" href="/api/ledger/export">Download expanded private export</a><small>Interoperability posture: DID not issued · credential not issued · signature not issued · external presentation not issued.</small></article></div>}</section>;

  return <div className="app">
    <header>
      <button className="brand" onClick={() => setView("home")}><span>R</span><b>ROOT <small>SOVEREIGN GATEWAY</small></b></button>
      <nav><button onClick={() => setView("home")}>Gateway</button><button onClick={() => setView("reclaim")}>Project Reclaim</button><button onClick={() => setView("services")}>Connection center</button><button onClick={() => setView("member")}>Member space</button></nav>
      <button className="pill" onClick={() => setView("member")}>{account ? `${account.handle} ↗` : "Open ROOT ↗"}</button>
    </header>

    {view === "home" && <main>
      <section className="hero"><p className="eyebrow">PRIVATE BY DEFAULT · SELF-OWNED</p><h1>ROOT is your sovereign record.<br /><i>Exist, decide, and prove on your terms.</i></h1><p className="lede">ROOT gives you a self-owned account, private attestations, consent receipts, integrity receipts, correction, revocation, and member-controlled records. It never creates a universal score, publishes your private records, or grants access without a separate decision.</p><div className="actions"><button className="pill" onClick={() => setView("member")}>Open my sovereign record</button><button className="line" onClick={() => setView("proof")}>Understand proof and consent</button></div></section>
      <section className="principles"><article><b>Exist</b><span>Control a ROOT account without a social-login broker.</span></article><article><b>Attest</b><span>Create private statements with integrity receipts.</span></article><article><b>Correct</b><span>Amend or withdraw your own record without erasing history.</span></article><article><b>Revoke</b><span>End an internal consent receipt; no external access exists by default.</span></article></section>
      <section className="control-surface"><p className="eyebrow">FLAGSHIP INITIATIVE</p><h2>Project Reclaim: physical work first.</h2><div><button onClick={() => setView("reclaim")}><b>Restore</b><span>Land, wildfire resilience, and stewardship</span></button><button onClick={() => setView("reclaim")}><b>Recover</b><span>Wood, biomass, material, and community value</span></button><button onClick={() => setView("reclaim")}><b>Rebuild</b><span>Workforce, training, opportunity, and participation</span></button><button onClick={() => setView("reclaim")}><b>Prove</b><span>Evidence posture without fabricated metrics</span></button></div></section>
      <section className="control-surface"><p className="eyebrow">ROOT CONTROL SURFACE</p><h2>Identity, consent, proof, and choice.</h2><div><button onClick={() => setView("member")}><b>My sovereign record</b><span>Account control, attestations, and private proof drafts</span></button><button onClick={() => setView("proof")}><b>Proof ledger</b><span>Integrity, correction, revocation, and export</span></button><button onClick={() => setView("truth")}><b>Truth Talk</b><span>Private source-declared drafts before public amplification</span></button><button onClick={() => setView("services")}><b>Connection center</b><span>Optional reviewed pathways, never a profile</span></button></div></section>
      <section className="connections"><p className="eyebrow">ECOSYSTEM HANDOFFS</p><h2>Open a destination by choice.</h2><p>These links do not carry your ROOT profile, permissions, session, or action-plan data.</p><div>{links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer"><b>{label} ↗</b><small>Link only · no ROOT data transfer</small></a>)}</div></section>
    </main>}

    {view === "reclaim" && <main className="page">
      <section className="reclaim-hero"><p className="eyebrow">PROJECT RECLAIM · FLAGSHIP INITIATIVE</p><h1>{reclaimInitiative.headline}</h1><p className="lede">{reclaimInitiative.mission}</p><p className="reclaim-principle">“{reclaimInitiative.principle}”</p><div className="reclaim-status"><b>Initiative status: IN DEVELOPMENT</b><span>ROOT now publishes the owner-authorized initiating organization and a two-county material-recovery intake framework. It does not claim material inventory, active projects, jobs, third-party partners, metrics, evidence objects, signatures, CIDs, or ledger records.</span></div></section>
      <section className="reclaim-loop"><p className="eyebrow">THE OPERATING LOOP</p><h2>{reclaimInitiative.evidenceLoop}</h2><p>ROOT is the navigation and permission layer for this future system. The physical mission comes first; technology makes authorized work visible, organized, auditable, and scalable after real records exist.</p></section>
      <section className="reclaim-pillars">{reclaimInitiative.pillars.map(pillar => <article key={pillar.id}><p className="tag">{pillar.status.replaceAll("_", " ")}</p><h2>{pillar.label}</h2><p>{pillar.detail}</p></article>)}</section>
      <section className="reclaim-paths"><article><p className="eyebrow">PARTICIPATION PATHS</p><h2>People enter from different directions.</h2>{reclaimInitiative.participation.map(path => <div className="reclaim-path" key={path.role}><b>{path.role}</b><span>{path.path}</span><small>{path.boundary}</small></div>)}</article><article><p className="eyebrow">REGIONAL FOUNDATION</p><h2>Local first, federated later.</h2><p><b>Mendocino County:</b> reviewed public pathways are live in ROOT.</p><p><b>Lake County:</b> reviewed public pathways are live in ROOT under your authorized regional scope.</p><p><b>Future regions:</b> must be explicitly configured, source-reviewed, and approved before publication.</p><button className="pill" onClick={() => setView("services")}>Browse reviewed pathways</button></article></section>
      <section className="offline-map"><div><p className="eyebrow">OFFLINE REGIONAL ORIENTATION MAP</p><h2>Public boundaries, local cache, no surveillance.</h2><p>The map uses generalized public county boundaries bundled with ROOT. After ROOT has loaded once on a secure device, the public map pack can be cached for offline orientation. No property, parcel, private address, member location, work site, or emergency location is included.</p></div>{regionalMap ? <RegionalMap data={regionalMap} /> : <p className="map-loading">Loading public map pack…</p>}<small>Orientation only. Not a legal boundary, parcel, evacuation, hazard, or project-site map.</small></section>
      <section className="reclaim-registry"><p className="eyebrow">OPERATIONAL REGISTRY FOUNDATION</p><h2>Start with authorized reality—not pretend inventory.</h2><p>ROOT now holds two owner-authorized public foundation records. All other registries remain unavailable until real records meet their publication controls.</p><div className="first-registry-records">{[...firstAuthorizedRegistryRecords.partners, ...firstAuthorizedRegistryRecords.materials].map(record => <article key={record.id}><p className="tag">{record.status.replaceAll("_", " ")}</p><h3>{record.label}</h3><p>{record.publicSummary}</p><small><b>Scope:</b> {record.countyScope.join(" · ")}</small><small><b>Proof:</b> {record.proofState}</small><small><b>Privacy:</b> {record.privacyBoundary}</small></article>)}</div><div>{registryDescriptors.filter(descriptor => descriptor.kind !== "partners" && descriptor.kind !== "materials").map(descriptor => <article key={descriptor.kind}><p className="tag">DATA UNAVAILABLE</p><h3>{descriptor.label}</h3><p>{descriptor.purpose}</p><small><b>Required:</b> {descriptor.requiredForPublication.join(" · ")}</small></article>)}</div><a className="line" href="/project-reclaim-registry-v0.1.json" target="_blank" rel="noreferrer">View public registry foundation ↗</a></section>
      <section className="reclaim-pack"><div><p className="eyebrow">FUTURE MONARCH OS RESOURCE PACK</p><h2>Offline-ready public information, not private-data sync.</h2><p>ROOT now publishes a versioned public review pack for future local caching. It includes approved public sources and initiative structure only. Live mesh synchronization, signing, node enrollment, IPFS, CID generation, and peer replication are not active.</p></div><a className="line" href="/project-reclaim-resource-pack-v0.1.json" target="_blank" rel="noreferrer">View public resource pack ↗</a></section>
      <section className="cmap-boundary"><p className="eyebrow">CMAP REFERENCE ALIGNMENT</p><h2>Proof and mesh claims begin with real keys and real records.</h2><p>ROOT references the published {cmapAlignment.protocolReference.handshake} handshake and its quarantine-first trust boundary. No ROOT CMAP peer is enrolled, and no Project Reclaim CID, signature, or ledger reference is issued until an actual public record is canonically serialized, addressed, signed, and verified.</p><div><span>PEERS: {cmapAlignment.enrolledPeers.length}</span><span>PUBLIC OPERATIONAL RECORDS: {cmapAlignment.publicOperationalRecords.length}</span><span>SYNC: PLANNED · NOT ACTIVE</span></div><a className="line" href="/project-reclaim-cmap-manifest-v0.1.json" target="_blank" rel="noreferrer">View CMAP alignment manifest ↗</a></section>
      <section className="reclaim-evidence"><p className="eyebrow">HONEST EVIDENCE POSTURE</p><h2>Real records or no claim.</h2><p>Future Project Reclaim records may connect work to evidence through <b>event → evidence → canonical record → signature → verification</b>. ROOT will not claim a project, job, grant, partnership, mitigation outcome, metric, CID, signature, or ledger proof until it is real, authorized, and verifiable.</p><span>Current operational registry: DATA UNAVAILABLE</span></section>
    </main>}

    {view === "services" && <main className="page"><p className="eyebrow">CONNECTION CENTER</p><h1>More than a directory.</h1><p className="lede">Choose a region and category, see what the official source can do, preserve the next step privately, and only then decide whether to hand yourself off. ROOT has no provider referral agreement and sends no information on your behalf.</p>{navigator}<section className="connection-steps"><article><b>1 · Find</b><span>Filter a reviewed source by your chosen region and need.</span></article><article><b>2 · Plan</b><span>Save a minimal private step in ROOT.</span></article><article><b>3 · Act</b><span>You choose whether to use the official contact or web route.</span></article><article><b>4 · Reflect</b><span>Mark your own progress; no provider sees it.</span></article></section><div className="cards">{matchingSources.map(source => <article key={source.id}><p className="tag">{source.category} · {countyConfigurations.find(county => county.id === source.county)?.label ?? source.county} · REVIEWED</p><h2>{source.title}</h2><p>{source.note}</p><p className="next-step"><b>What you can do:</b> {source.action}</p>{source.contact && <p className="contact">{source.contact}</p>}<a href={source.url} target="_blank" rel="noreferrer">Open official source ↗</a><button className="text" onClick={() => save(source)}>Save my next step</button></article>)}</div></main>}

    {view === "member" && <main className="page"><p className="eyebrow">MEMBER SPACE</p><h1>My sovereign record</h1><p className="lede">Your ROOT account is a private control surface for existence, consent, attestation, proof drafts, correction, revocation, and export. It is not a public identity profile or universal-truth score.</p>{notice && <p className="notice" role="status">{notice}</p>}<section className="member-grid">{!authReady ? <article><h2>Checking ROOT account</h2><p>ROOT is checking only its own local session service.</p></article> : !account ? <article className="account-card"><h2>Local ROOT account</h2><p>Create an account with a ROOT handle and password. ROOT creates an account-control receipt that proves this account registration only; it does not verify a legal, biometric, or real-world identity.</p><label>ROOT handle<input value={handle} onChange={event => setHandle(event.target.value)} autoComplete="username" placeholder="your-root-handle" /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" placeholder="14 characters minimum" /></label><div className="actions"><button className="pill" onClick={() => submitAuth("register")}>Create local account</button><button className="line" onClick={() => submitAuth("login")}>Sign in</button></div><p className="auth-message">{authMessage}</p></article> : <article><h2>{account.handle}</h2><p><b>Account authority:</b> self-owned ROOT account.</p><p><b>External identity provider:</b> none.</p><p><b>Current session:</b> opaque, HTTP-only ROOT session cookie.</p><button className="line" onClick={signOut}>Sign out</button><button className="text danger" onClick={deleteAccount}>Delete account, private records, and action plan</button><p className="auth-message">{authMessage}</p></article>}<article className="plan-card"><h2>Optional private action plan</h2>{!account ? <p>Open a local ROOT account to save a private plan. Public sources remain available without a sign-in.</p> : !pathwayReady ? <p>Loading your private plan…</p> : planSources.length === 0 ? <p>No saved steps yet. This module is optional and never defines your ROOT identity.</p> : planSources.map(({ item, source }) => <div className="path" key={item.sourceId}><p className="tag">{source.category}</p><b>{source.title}</b><span>{source.action}</span><label>My progress<select value={item.stage} onChange={event => updateStage(item.sourceId, event.target.value as PathwayItem["stage"])}>{(Object.keys(stageLabels) as PathwayItem["stage"][]).map(stage => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}</select></label><div className="path-actions"><a href={source.url} target="_blank" rel="noreferrer">Official source ↗</a><button onClick={() => remove(item.sourceId)}>Remove</button></div></div>)}<button className="pill" onClick={() => setView("services")}>Find a pathway</button></article><article><h2>What ROOT will not do</h2><p>ROOT will not submit a provider form, send a referral, expose your plan to an operator, create a behavioral profile, or publish a private proof record.</p><p>Eligibility, appointments, service availability, and outcomes belong to the official source—not ROOT.</p><button className="line" onClick={() => setView("proof")}>View proof boundary</button><button className="text" onClick={() => setView("emergency")}>Urgent-support boundary</button></article></section>{account && <section className="member-grid ledger-grid"><article><p className="eyebrow">PRIVATE ATTESTATION</p><h2>Say what you stand behind.</h2><p>This remains inside ROOT unless you make a separate future publication decision.</p><label>Label<input value={attestationLabel} onChange={event => setAttestationLabel(event.target.value)} placeholder="Account control" /></label><label>Statement<textarea value={attestationStatement} onChange={event => setAttestationStatement(event.target.value)} placeholder="I control this ROOT account and choose how my record is used." /></label><button className="pill" onClick={createAttestation}>Create private attestation</button></article><article><p className="eyebrow">CONSENT RECEIPTS</p><h2>Grant narrow internal storage—not outside access.</h2><p>Each receipt is revocable. ROOT has no external recipient by default.</p><button className="line" onClick={() => createConsent("root_private_storage")}>Consent to private ROOT storage</button><button className="line" onClick={() => createConsent("member_proof_draft")}>Consent to private proof drafts</button><button className="line" onClick={() => createConsent("truth_talk_private_draft")}>Consent to private Truth Talk drafts</button></article><article><p className="eyebrow">TRUTH TALK · PRIVATE DRAFT</p><h2>Declare claim type before amplification.</h2><p>Drafts are private. ROOT does not publish, rank, or pronounce a binary truth verdict.</p><label>Claim type<select value={claimType} onChange={event => setClaimType(event.target.value)}><option value="report">Report</option><option value="firsthand_account">Firsthand account</option><option value="opinion">Opinion</option><option value="analysis">Analysis</option><option value="correction">Correction</option><option value="question">Question</option></select></label><label>Statement<textarea value={claimStatement} onChange={event => setClaimStatement(event.target.value)} placeholder="Write a private, source-aware draft." /></label><label>Declared public source URLs, one per line<textarea value={claimSources} onChange={event => setClaimSources(event.target.value)} placeholder="https://example.org/source" /></label><button className="pill" onClick={createClaim}>Create private claim draft</button></article></section>}{account && <section className="member-grid ledger-grid"><article className="ledger-card"><p className="eyebrow">MY RECEIPTS</p><h2>Integrity, correction, and revocation.</h2>{!ledgerReady ? <p>Loading your private receipts…</p> : ledger.length === 0 ? <p>ROOT has no private records for this account yet.</p> : ledger.map(record => <div className="ledger-record" key={record.id}><p className="tag">{record.kind.replaceAll("_", " ")} · {record.state}</p><b>{String(record.payload.label || record.payload.claimType || record.payload.scope || "Account control")}</b><span>{String(record.payload.statement || "Private ROOT receipt")}</span><small>Integrity receipt: {record.integrityDigest.slice(0, 18)}…</small>{record.relation?.correctsId && <small>Corrects: {record.relation.correctsId}</small>}<div className="path-actions">{record.state === "active" && ["attestation", "claim"].includes(record.kind) && <button onClick={() => correctRecord(record)}>Correct</button>}{record.state === "active" && record.kind !== "account_control" && <button onClick={() => changeLedgerState(record)}>{record.kind === "consent" ? "Revoke" : "Withdraw"}</button>}</div></div>)}</article><article><p className="eyebrow">MEMBER EXPORT</p><h2>Take your private record with you.</h2><p>Download your own encrypted-account record view as JSON. Exporting does not publish it or grant anyone else access.</p><a className="pill" href="/api/ledger/export">Download my private ROOT record</a><p><b>Account deletion:</b> removes your account, private plan, sessions, and private ROOT receipts from ROOT. It cannot retrieve a copy you independently exported or shared elsewhere.</p></article></section>}</main>}

    {view === "member" && account && identityControls}
    {view === "member" && !account && <section className="page recovery-entry"><p className="eyebrow">ACCOUNT RECOVERY</p><h2>Use a recovery kit you created earlier.</h2><p>ROOT has no email reset, social login, or external recovery custodian. A valid one-time recovery code resets the password and ends prior sessions.</p><label>ROOT handle<input value={recoveryHandle} onChange={event => setRecoveryHandle(event.target.value)} autoComplete="username" /></label><label>Recovery code<input value={recoveryCodeInput} onChange={event => setRecoveryCodeInput(event.target.value)} autoComplete="one-time-code" /></label><label>New password<input type="password" value={recoveryPassword} onChange={event => setRecoveryPassword(event.target.value)} autoComplete="new-password" /></label><button className="pill" onClick={recoverAccount}>Recover my ROOT account</button><p className="auth-message">{authMessage}</p></section>}
    {view === "steward" && <main className="page"><p className="eyebrow">DIRECTORY STEWARD</p><h1>Clear limits, visible review.</h1><section className="member-grid"><article><h2>Authority</h2><p>Review approved Mendocino and Lake County public-source accuracy and the date each official source was checked.</p><p>Excluded: member plans, operator roster, Monarch nodes, attestations, provider decisions, and unverified operational registries.</p></article><article><h2>Regional publication</h2><p>Mendocino and Lake County are published under the current approved regional scope. Any future county still requires explicit source review and a publication decision.</p></article></section></main>}
    {view === "truth" && <main className="page"><p className="eyebrow">TRUTH TALK</p><h1>Provenance before amplification.</h1><p className="lede">Truth Talk begins as a member-controlled private claim draft: declare the claim type, name public sources when relevant, create an integrity receipt, and correct or withdraw your own record. It does not create a public post by default.</p><section className="member-grid"><article><h2>Private before public</h2><p>Use Member Space to create a private source-declared draft. A future publication path must be a separate, visible consent decision—not an automatic consequence of writing a draft.</p><p><b>Claim types:</b> report, firsthand account, opinion, analysis, correction, and question.</p></article><article><h2>TruthOK is posture, not a verdict</h2><p>Identity-bound, integrity-bound, sources-declared, and review-completed describe what evidence posture exists. ROOT does not call a person or claim universally true, false, employable, credible, or risky.</p><button className="pill" onClick={() => setView("member")}>Open private claim drafts</button></article></section></main>}
    {view === "proof" && <main className="page"><p className="eyebrow">PROOF LEDGER</p><h1>Receipts, not scores.</h1><p className="lede">ROOT creates deterministic integrity receipts for member-owned private records. A receipt can show that stored record facts have changed; it does not verify real-world identity, issue a CID, create a blockchain entry, or prove a statement true.</p><section className="member-grid"><article><h2>What a ROOT receipt can establish</h2><p><b>Account control:</b> a self-chosen handle and password created the ROOT account.</p><p><b>Integrity:</b> ROOT can detect that the stored private record facts changed after a receipt was created.</p><p><b>Consent state:</b> an internal ROOT-storage consent is active, revoked, or never created.</p><p><b>Correction:</b> a member can preserve a private correction chain instead of silently overwriting a record.</p></article><article><h2>What ROOT will not claim</h2><p>No legal, biometric, governmental, financial, or real-world identity verification occurs through account creation alone.</p><p>No external provider access exists by default. No CID, signature, blockchain transaction, or universal-truth determination is issued by the private receipt layer.</p><button className="pill" onClick={() => setView("member")}>Open my private receipts</button></article></section></main>}
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
