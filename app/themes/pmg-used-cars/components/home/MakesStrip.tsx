"use client";

import { useState } from "react";

const MAKES: Array<{ name: string; slug: string }> = [
  { name: "Audi", slug: "audi" },
  { name: "BMW", slug: "bmw" },
  { name: "Ford", slug: "ford" },
  { name: "Vauxhall", slug: "vauxhall" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Mercedes-Benz", slug: "mercedes" },
  { name: "Nissan", slug: "nissan" },
  { name: "Toyota", slug: "toyota" },
  { name: "Mazda", slug: "mazda" },
];

const CDN = "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons";

function MakeItem({ name, slug }: { name: string; slug: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="make-item">
      {failed ? (
        <b className="make-fallback" style={{ display: "inline" }}>{name}</b>
      ) : (
        <img
          className="make-logo"
          src={`${CDN}/${slug}.svg`}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function MakesStrip() {
  return (
    <section className="makes">
      <div className="pmg-shell">
        <div className="row">
          {MAKES.map((m) => (
            <MakeItem key={m.slug} name={m.name} slug={m.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
