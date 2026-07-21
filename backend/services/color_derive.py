"""Palette derivation engine — 4 input colors in, full 8-color set out.

The dashboard collects Primary, Secondary, Accent, Background. This module
derives Text, Surface, Border, Muted from them using WCAG contrast rules so
every persistence path stores the full 8-color contract that themes consume
(--color-primary ... --color-border). Natural roles are preserved: background
is always the page background, text is always the foreground — no inversion.

Mirrored in static/modules/color-utils.js (derivePalette) for live preview in
the dashboard. Both implementations must stay in lockstep: same constants,
same integer step loops, same half-up rounding. If you change a rule here,
change it there.

WCAG math matches tools/check-palette-policy.mjs (0.03928 sRGB threshold).
"""

DEFAULTS = {
    "primaryColor": "#2563eb",
    "secondaryColor": "#64748b",
    "accentColor": "#f59e0b",
    "backgroundColor": "#ffffff",
}

# Ink base matches the light-tier textStrong neutral in check-palette-policy.mjs
LIGHT_INK = "#0f1623"

TEXT_TARGET = 7.0        # derived text vs bg
MUTED_TARGET = 4.5       # derived muted vs bg
UI_TARGET = 3.0          # warn threshold for primary/secondary/accent vs bg

PRIMARY_TINT = 0.08      # how much primary hue bleeds into derived text
SURFACE_LIFT_DARK = 0.07  # dark mode: surface = bg lightened by this
SURFACE_DIP_LIGHT = 0.03  # light mode on white bg: surface = bg dipped toward text
BORDER_MIX = 0.12        # border = text mixed this much into bg
MUTED_MIX_START = 60     # muted starts at text 60% / bg 40%, steps of 5 toward text

DERIVED_KEYS = ("textColor", "surfaceColor", "borderColor", "mutedColor")
INPUT_KEYS = ("primaryColor", "secondaryColor", "accentColor", "backgroundColor")


def normalize_hex(value):
    """Return #rrggbb (lowercase) or None if not a valid hex color."""
    if not isinstance(value, str):
        return None
    raw = value.strip().lower()
    if raw.startswith("#"):
        raw = raw[1:]
    if len(raw) == 3 and all(c in "0123456789abcdef" for c in raw):
        raw = "".join(c * 2 for c in raw)
    if len(raw) != 6 or not all(c in "0123456789abcdef" for c in raw):
        return None
    return "#" + raw


def _hex_to_rgb(hex_color):
    h = hex_color.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def _rgb_to_hex(rgb):
    return "#" + "".join(format(max(0, min(255, c)), "02x") for c in rgb)


def _round_half_up(x):
    # Python round() is banker's rounding; the JS mirror uses Math.round
    # (half-up). Use half-up here so both emit identical hexes.
    return int(x + 0.5)


def mix_hex(a, b, weight_of_a):
    """sRGB channel mix, like CSS color-mix(in srgb, a W%, b)."""
    ra, ga, ba = _hex_to_rgb(a)
    rb, gb, bb = _hex_to_rgb(b)
    w = weight_of_a
    return _rgb_to_hex((
        _round_half_up(ra * w + rb * (1 - w)),
        _round_half_up(ga * w + gb * (1 - w)),
        _round_half_up(ba * w + bb * (1 - w)),
    ))


def _srgb_to_linear(c):
    x = c / 255.0
    return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color):
    r, g, b = _hex_to_rgb(hex_color)
    return 0.2126 * _srgb_to_linear(r) + 0.7152 * _srgb_to_linear(g) + 0.0722 * _srgb_to_linear(b)


def contrast_ratio(a, b):
    la = relative_luminance(a)
    lb = relative_luminance(b)
    bright, dim = (la, lb) if la >= lb else (lb, la)
    return (bright + 0.05) / (dim + 0.05)


def is_light_background(bg):
    """Light mode when black text beats white text on this background."""
    return contrast_ratio(bg, "#000000") >= contrast_ratio(bg, "#ffffff")


def _derive_text(primary, bg, light):
    base = LIGHT_INK if light else "#ffffff"
    extreme = "#000000" if light else "#ffffff"
    tinted = mix_hex(primary, base, PRIMARY_TINT)
    # Walk from the brand-tinted ink toward the pure extreme until the
    # contrast target is met; mid-tone backgrounds may end at the extreme.
    for step in range(0, 11):
        candidate = mix_hex(extreme, tinted, step / 10.0)
        if contrast_ratio(candidate, bg) >= TEXT_TARGET:
            return candidate
    return extreme


def _derive_surface(bg, text, light):
    if light:
        if contrast_ratio(bg, "#ffffff") < 1.05:
            # bg is (near-)white: dip the surface slightly so cards read
            return mix_hex(text, bg, SURFACE_DIP_LIGHT)
        return "#ffffff"
    return mix_hex("#ffffff", bg, SURFACE_LIFT_DARK)


def _derive_muted(text, bg):
    for pct in range(MUTED_MIX_START, 101, 5):
        candidate = mix_hex(text, bg, pct / 100.0)
        if contrast_ratio(candidate, bg) >= MUTED_TARGET:
            return candidate
    return text


def derive_palette(primary=None, secondary=None, accent=None, background=None):
    """Full 8-color dict (form field names) from up to 4 inputs.

    Invalid or missing inputs fall back to DEFAULTS. Inputs are returned
    normalized (#rrggbb lowercase); derived values are computed fresh.
    """
    p = normalize_hex(primary) or DEFAULTS["primaryColor"]
    s = normalize_hex(secondary) or DEFAULTS["secondaryColor"]
    a = normalize_hex(accent) or DEFAULTS["accentColor"]
    bg = normalize_hex(background) or DEFAULTS["backgroundColor"]

    light = is_light_background(bg)
    text = _derive_text(p, bg, light)

    return {
        "primaryColor": p,
        "secondaryColor": s,
        "accentColor": a,
        "backgroundColor": bg,
        "textColor": text,
        "surfaceColor": _derive_surface(bg, text, light),
        "borderColor": mix_hex(text, bg, BORDER_MIX),
        "mutedColor": _derive_muted(text, bg),
    }


def resolve_colors(colors, auto=False):
    """Normalize a theme.colors dict against the derivation engine.

    auto=True  -> re-derive text/surface/border/muted from the 4 inputs,
                  overriding whatever was sent/stored (dashboard Auto mode).
    auto=False -> keep explicit valid derived values, fill only absent or
                  invalid ones (non-destructive: /new-theme payloads and
                  legacy records with hand-tuned palettes stay untouched).

    Keys outside the 8-color contract (legacy bgPrimary, accentChrome, ...)
    pass through unchanged. Returns a new dict; does not mutate the input.

    A dict carrying NO valid brand input (none of the 4 input keys is a hex)
    is returned unchanged — records without colors keep the theme's own
    defaults instead of getting a generic derived-from-defaults palette.
    """
    colors = dict(colors or {})
    if not any(normalize_hex(colors.get(key)) for key in INPUT_KEYS):
        return colors
    derived = derive_palette(
        colors.get("primaryColor"),
        colors.get("secondaryColor"),
        colors.get("accentColor"),
        colors.get("backgroundColor"),
    )
    for key in INPUT_KEYS:
        colors[key] = derived[key]
    for key in DERIVED_KEYS:
        kept = None if auto else normalize_hex(colors.get(key))
        colors[key] = kept if kept else derived[key]
    return colors


def derive_missing(colors):
    """Fill only absent/invalid derived keys (alias for resolve_colors auto=False)."""
    return resolve_colors(colors, auto=False)


def contrast_warnings(colors):
    """Non-destructive advisories: brand colors that read poorly on the bg.

    Returns a list of {role, color, ratio, message} dicts. Never mutates
    colors — dealers' brand colors are theirs; we warn, we don't fix.
    """
    bg = normalize_hex((colors or {}).get("backgroundColor")) or DEFAULTS["backgroundColor"]
    warnings = []
    for role, key in (("primary", "primaryColor"), ("secondary", "secondaryColor"), ("accent", "accentColor")):
        value = normalize_hex((colors or {}).get(key))
        if not value:
            continue
        ratio = contrast_ratio(value, bg)
        if ratio < UI_TARGET:
            warnings.append({
                "role": role,
                "color": value,
                "ratio": round(ratio, 2),
                "message": f"{role.capitalize()} color {value} has {ratio:.2f}:1 contrast on the background (below 3:1) — it may be hard to see when used for buttons or links.",
            })
    return warnings
