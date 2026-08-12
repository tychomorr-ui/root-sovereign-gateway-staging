import { useMemo, useState } from "react";
import { publicSources, type Source } from "./policy";

type View = "home" | "reclaim" | "member" | "steward" | "truth" | "services" | "proof" | "emergency";
type PathItem = { id: string; title: string; nextStep: string };

const links = [
  ["XINUS MonarchOS", "https://xinus.one/"],
  ["Tesseract", "https://tesseract.manus.space/"],
  ["NEXINUS Dashboard", "https://xinusdash-doy5g86k.manus.space/"],
  ["Sovereign App", "https://sovereignapp-hkcgwye7.manus.space/"],
  ["Resonate Earth", "https://resonate-earth.live/"],
  ["Universal Truth", "https://universaltruth.life/"],
] as const;

function App() {
  const [view, setView] = useState<View>("home");
  const [pathway, setPathway] = useState<PathItem[]>([]);
  const [notice, setNotice] = useState("");
  const sources = useMemo(() => publicSources(), []);
  const save = (source: Source) => {
    setPathway(items => items.some(item => item.id === source.id) ? items : [...items, { id: source.id, title: source.title, nextStep: "Read the official source" }]);
    setView("member");
    setNotice("Saved to this private preview pathway. ROOT has not contacted anyone.");
  };

  return <div className="app">
    <header>
      <button className="brand" onClick={() => setView("home")}><span>R</span><b>ROOT <small>SOVEREIGN GATEWAY</small></b></button>
      <nav><button onClick={() => setView("home")}>Gateway</button><button onClick={() => setView("reclaim")}>Project Reclaim</button><button onClick={() => setView("truth")}>Truth Talk</button><button onClick={() => setView("member")}>Member space</button></nav>
      <button className="pill" onClick={() => setView("member")}>Open ROOT ↗</button>
    </header>

    {view === "home" && <main>
      <section className="hero"><p className="eyebrow">PRIVATE BY DEFAULT</p><h1>ROOT is the gateway.<br /><i>You remain the owner.</i></h1><p className="lede">A simple home for your permissions, trusted sources, and the next steps you choose. No behavioral tracking. No advertising identifiers. No public member record without permission.</p><div className="actions"><button className="pill" onClick={() => setView("member")}>Open member space</button><button className="line" onClick={() => setView("reclaim")}>Explore Project Reclaim</button></div></section>
      <section className="principles"><article><b>Truth</b><span>Sources and corrections stay visible.</span></article><article><b>Responsibility</b><span>Authority is limited and reviewable.</span></article><article><b>Restoration</b><span>Members choose their own pathway.</span></article><article><b>Stewardship</b><span>Regional sources are reviewed, not invented.</span></article></section>
      <section className="control-surface"><p className="eyebrow">ROOT CONTROL SURFACE</p><h2>Private controls, not hidden scoring.</h2><div><button onClick={() => setView("member")}><b>Permissions</b><span>Human-readable grants</span></button><button onClick={() => setView("proof")}><b>Proof ledger</b><span>Receipts, not scores</span></button><button onClick={() => setView("truth")}><b>Truth Talk</b><span>Provenance and corrections</span></button><button onClick={() => setView("services")}><b>Services</b><span>Minimum proof only</span></button></div></section>
      <section className="connections"><p className="eyebrow">ECOSYSTEM HANDOFFS</p><h2>Open a destination by choice.</h2><p>These links do not carry your ROOT profile, permissions, session, or pathway data.</p><div>{links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer"><b>{label} ↗</b><small>Link only · no ROOT data transfer</small></a>)}</div></section>
    </main>}

    {view === "reclaim" && <main className="page"><p className="eyebrow">PROJECT RECLAIM</p><h1>A pathway you choose.</h1><p className="lede">Reviewed public sources for work and housing in Mendocino County. ROOT organizes information; the official source decides eligibility, availability, applications, and outcomes.</p><section className="boundary"><div><b>Mendocino County</b><span>Active reviewed public pathways</span></div><div><b>Lake County</b><span>Verified watchlist only — not published in ROOT</span></div></section><div className="cards">{sources.map(source => <article key={source.id}><p className="tag">{source.category} · Mendocino County</p><h2>{source.title}</h2><p>{source.note}</p><a href={source.url} target="_blank" rel="noreferrer">Official source ↗</a><button className="text" onClick={() => save(source)}>Save to my private pathway</button><button className="text" onClick={() => setNotice("A source issue is private to ROOT’s review queue and does not contact the provider.")}>Report source issue</button></article>)}</div></main>}

    {view === "member" && <main className="page"><p className="eyebrow">MEMBER SPACE</p><h1>My private pathway</h1><p className="lede">Nothing saved here is shared with a provider, employer, county agency, or operator unless you later make a separate explicit grant.</p>{notice && <p className="notice">{notice}</p>}<section className="member-grid"><article><h2>Next steps</h2>{pathway.length === 0 ? <p>There are no saved pathways. Browse a reviewed public source when you are ready.</p> : pathway.map(item => <div className="path" key={item.id}><b>{item.title}</b><span>{item.nextStep}</span><button onClick={() => setPathway(items => items.filter(candidate => candidate.id !== item.id))}>Remove</button></div>)}<button className="pill" onClick={() => setView("reclaim")}>Browse sources</button></article><article><h2>Permission Center</h2><p><b>Pathway:</b> visible to you only.</p><p><b>Source directory:</b> official public cards only.</p><p><b>External access:</b> none without a separate grant.</p><button className="line" onClick={() => setView("proof")}>View permission receipt</button><button className="text" onClick={() => setView("emergency")}>One-time emergency location boundary</button></article></section></main>}

    {view === "steward" && <main className="page"><p className="eyebrow">DIRECTORY STEWARD</p><h1>Clear limits, visible review.</h1><section className="member-grid"><article><h2>Authority</h2><p>Review Mendocino County source issues.</p><p>Excluded: operator roster, Monarch nodes, attestations, and Lake County publication.</p><button className="line" onClick={() => setNotice("Review queue preview: private member notes are never displayed on public source cards.")}>Open review queue</button></article><article><h2>Lake County gate</h2><p>Lake County remains watchlist-only until a separately authorized publication scope exists.</p><button disabled>Publish Lake County source</button></article></section></main>}

    {view === "truth" && <main className="page"><p className="eyebrow">TRUTH TALK</p><h1>Provenance before amplification.</h1><p className="lede">Truth Talk is ROOT’s linked public conversation layer. A post must identify its claim type, sources, and correction path; TruthOK signals describe evidence posture, never a binary verdict.</p><section className="member-grid"><article><h2>Public provenance feed</h2><p>The public ledger is quiet. The first post will declare its claim type and create its own integrity receipt.</p><p><b>Signals:</b> identity-bound, integrity-bound, sources-declared, review-completed.</p></article><article><h2>Linked, not fused</h2><p>ROOT holds consent and member controls. Truth Talk carries public provenance, corrections, and structured discussion without importing a member’s private pathway.</p><button className="line" onClick={() => setNotice("Truth Talk remains a linked public layer; no private pathway information is carried into it.")}>View boundary</button></article></section></main>}

    {view === "services" && <main className="page"><p className="eyebrow">SERVICE ACCESS</p><h1>Minimum proof, maximum choice.</h1><p className="lede">A service should ask for the least information needed for the stated purpose. ROOT does not disclose a private dossier or an event history by default.</p><section className="member-grid"><article><h2>Consent receipt</h2><p>Every future grant must state what is shared, why it is shared, who receives it, when it expires, and how it can be revoked.</p><button className="line" onClick={() => setView("proof")}>Open receipt boundary</button></article><article><h2>Current status</h2><p>No external service access is active in this clean preview. Public ecosystem destinations remain link-only.</p></article></section></main>}

    {view === "proof" && <main className="page"><p className="eyebrow">PROOF LEDGER</p><h1>Receipts, not scores.</h1><p className="lede">ROOT records a human-readable explanation of consent. It does not turn a member into a behavioral, employability, risk, or universal-truth score.</p><section className="member-grid"><article><h2>Current receipt</h2><p><b>External access:</b> none.</p><p><b>Member pathway:</b> private to the member.</p><p><b>Revocation:</b> available before any future external grant begins.</p></article><article><h2>Correction boundary</h2><p>When a public claim changes, a correction remains attached to the record. Private member data never becomes a public correction artifact.</p></article></section></main>}

    {view === "emergency" && <main className="page"><p className="eyebrow">EMERGENCY BOUNDARY</p><h1>One-time location consent only.</h1><p className="lede">ROOT may use a member’s location only after a specific, time-limited emergency request. It does not create a location history, a movement profile, or automatic emergency dispatch.</p><section className="member-grid"><article><h2>Before sharing location</h2><p>ROOT must show the purpose, request a fresh confirmation, and tell the member that the location is not retained after the immediate lookup.</p></article><article><h2>Current status</h2><p>No emergency location access is active in this clean preview.</p><button className="line" onClick={() => setNotice("No location request was made. A production emergency flow must request one-time consent before any lookup.")}>Review consent rule</button></article></section></main>}

    <footer><span>ROOT clean restart preview</span><button onClick={() => setView("steward")}>Directory Steward view</button><span className="status">● Connection active</span></footer>
  </div>;
}

export default App;
