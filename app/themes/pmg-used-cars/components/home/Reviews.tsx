const Star = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const Stars = () => (
  <span className="stars"><Star /><Star /><Star /><Star /><Star /></span>
);

const REVIEWS: Array<{ quote: string; who: string; meta: string }> = [
  {
    quote:
      "Amazing experience, lovely dealership — would definitely recommend. Khawar was very helpful throughout and gave me real peace of mind buying my first car.",
    who: "Josh P.",
    meta: "Bought an Audi A1",
  },
  {
    quote:
      "Absolutely decent and transparent folks. I'm satisfied with the car I purchased and they did everything they said they would before the sale.",
    who: "Verified buyer",
    meta: "Invited customer review",
  },
  {
    quote:
      "Really pleased with the Corsa we bought. Fantastic service. The car came exactly as advertised and was delivered quickly and professionally.",
    who: "Verified buyer",
    meta: "Delivered nationwide",
  },
];

export function Reviews() {
  return (
    <section className="section reviews" id="reviews">
      <div className="pmg-shell">
        <div className="section-head">
          <span className="eyebrow center">What our customers say</span>
          <h2>Rated 4.5 / 5 on Feefo</h2>
          <div className="rev-head">
            <span className="rev-score">
              <Stars /> <b>4.5</b> · Independent reviews
            </span>
          </div>
        </div>
        <div className="rev-grid">
          {REVIEWS.map((r) => (
            <div className="rev" key={r.who + r.meta}>
              <div className="stars"><Star /><Star /><Star /><Star /><Star /></div>
              <p className="quote">&ldquo;{r.quote}&rdquo;</p>
              <div className="rmeta">
                <div className="who">{r.who}<small>{r.meta}</small></div>
                <span className="feefo">Feefo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
