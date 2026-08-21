import Link from "next/link";
import { dealer } from "../../data/site-config";

const phoneHref = `tel:${(dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? "").replace(/\s+/g, "")}`;

export function SourcingBand() {
  return (
    <section className="sourcing" id="sourcing">
      <div className="pmg-shell">
        <div className="stext">
          <h2>Can&apos;t find the right car? We&apos;ll source it.</h2>
          <p>
            Tell us what you&apos;re after and our vehicle procurement service will track down the
            right car at the right price — saving you the time, effort and stress.
          </p>
        </div>
        <div className="sbtns">
          <Link href="/car-sourcing" className="pmg-btn pmg-btn-dark pmg-btn-lg">Request a car</Link>
          <a href={phoneHref} className="pmg-btn pmg-btn-ghost pmg-btn-lg">Call the team</a>
        </div>
      </div>
    </section>
  );
}
