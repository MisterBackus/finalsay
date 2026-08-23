export default function Success() {
  return (
    <main className="wrap">
      <div className="top"><span>finalsay.lol</span></div>
      <p className="say">Paid. Your sentence goes up the moment Stripe confirms, usually within a few seconds.</p>
      <div className="hint" style={{marginTop: 20}}>If someone paid a split second before you, the price moved and you're automatically refunded. <a href="/">Go see it.</a></div>
    </main>
  );
}
