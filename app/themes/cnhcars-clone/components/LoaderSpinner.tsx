"use client";

type LoaderSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  tone?: "neutral" | "light";
  showLabel?: boolean;
};

export default function LoaderSpinner({
  label = "Loading",
  size = "md",
  className = "",
  tone = "neutral",
  showLabel = false,
}: LoaderSpinnerProps) {
  const classes = ["loader-spinner", `is-${size}`, `is-${tone}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes} role="status" aria-live="polite" aria-label={label}>
      <span className="loader-spinner-ring" aria-hidden="true"></span>
      {showLabel ? <span className="loader-spinner-text">{label}</span> : <span className="loader-spinner-sr">{label}</span>}
    </span>
  );
}
