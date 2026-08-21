import Link from "next/link";

export function Promos() {
  return (
    <section className="section promos">
      <div className="pmg-shell">
        <div className="promo finance" id="finance">
          <div className="pmedia" />
          <div className="pinner">
            <span className="eyebrow">Finance available</span>
            <h3>Drive now,<br />pay monthly</h3>
            <p>Get pre-approved in minutes and spread the cost with a plan that suits your budget.</p>
            <Link href="/contact" className="pmg-btn pmg-btn-dark">Check eligibility</Link>
          </div>
        </div>
        <div className="promo trade" id="trade">
          <div className="pmedia" />
          <div className="pinner">
            <span className="eyebrow">Part exchange</span>
            <h3>What&apos;s your<br />car worth?</h3>
            <p>Get a fair market valuation for your current car and put it towards your next one.</p>
            <Link href="/sell-my-car" className="pmg-btn pmg-btn-primary">Value your car</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
