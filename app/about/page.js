export default function About() {
  return (
    <main className="wrap">
      <div className="top"><span>finalsay.lol</span></div>
      <p className="say" style={{fontSize: "clamp(26px, 6vw, 44px)"}}>One sentence. Pay to replace it. Until someone replaces you.</p>
      <div className="hint" style={{fontSize: 14, color: "#333", marginTop: 24}}>
        <p>The first sentence costs $5. Every replacement costs a dollar more for the first twenty, then 10% more each time after that. The money goes to whoever runs this site, not to the person you erased.</p>
        <p>Pay double and your sentence is locked for one hour. Nobody can touch it. After the hour it's fair game again.</p>
        <p>If two people pay at once, the first one wins and the second is refunded automatically.</p>
        <p>Every erased sentence stays on the page with what it cost. That's the point.</p>
        <p>No slurs, no edits, no refunds once you're up. Links are allowed and are nofollow.</p>
        <p><a href="/">Back</a></p>
      </div>
    </main>
  );
}
