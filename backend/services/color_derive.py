"""Palette derivation engine — 1 or 4 input colors in, full 8-color set out.

Two entry points feed the same 8-color contract themes consume
(--color-primary ... --color-border):

1. Single-primary (dashboard default): the dealer picks ONLY a primary color
   and derive_from_primary() generates Secondary, Accent and Background with
   color-theory rules, then Text/Surface/Border/Muted with WCAG contrast rules.
   No manual intervention — one hex in, a full contrast-safe palette out.

2. Four-input (AI drafts, preview endpoints): Primary/Secondary/Accent/
   Background are supplied and only Text/Surface/Border/Muted are derived.

Natural roles are preserved everywhere: background is always the page
background, text is always the foreground — no inversion. The generated
background is always a light near-white tint of the primary, so text derives
dark and the palette reads as a professional light-mode dealer site.

Mirrored in static/modules/color-utils.js (derivePalette / deriveFromPrimary)
for live preview in the dashboard. Both implementations must stay in lockstep:
same constants, same integer step loops, same half-up rounding. If you change
a rule here, change it there.

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

# --- Single-primary generation (color theory) ---
BG_TINT = 0.03           # background = primary mixed this much into white (light)
# Secondary: a deep, slightly-desaturated monochromatic tone of the primary hue
SECONDARY_SAT_FACTOR = 0.55
SECONDARY_SAT_MIN, SECONDARY_SAT_MAX = 16, 42
SECONDARY_L_FACTOR = 0.42
SECONDARY_L_MIN, SECONDARY_L_MAX = 20, 32
# Accent: split-complementary pop, lightness walked down until it clears bg contrast
ACCENT_HUE_SHIFT = 150
ACCENT_SAT_MIN, ACCENT_SAT_MAX = 62, 90
ACCENT_L_START, ACCENT_L_FLOOR, ACCENT_L_STEP = 56, 24, 4

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


def _clamp(value, lo, hi):
    return max(lo, min(hi, value))


def hex_to_hsl(hex_color):
    """#rrggbb -> (h, s, l) integers (h 0-360, s/l 0-100). Mirrors JS hexToHsl."""
    r, g, b = (c / 255.0 for c in _hex_to_rgb(hex_color))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2.0
    if mx == mn:
        h = s = 0.0
    else:
        d = mx - mn
        s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
        if mx == r:
            h = ((g - b) / d + (6 if g < b else 0)) / 6.0
        elif mx == g:
            h = ((b - r) / d + 2) / 6.0
        else:
            h = ((r - g) / d + 4) / 6.0
    return (_round_half_up(h * 360), _round_half_up(s * 100), _round_half_up(l * 100))


def hsl_to_hex(h, s, l):
    """(h, s, l) -> #rrggbb. Mirrors JS hslToHex exactly (same channel rounding)."""
    s = s / 100.0
    l = l / 100.0
    a = s * min(l, 1 - l)

    def f(n):
        k = (n + h / 30.0) % 12
        color = l - a * max(-1, min(k - 3, 9 - k, 1))
        return _round_half_up(255 * color)

    return _rgb_to_hex((f(0), f(8), f(4)))


def _derive_background(primary):
    """A light near-white background carrying a faint tint of the primary hue."""
    return mix_hex(primary, "#ffffff", BG_TINT)


def _derive_secondary(h, s, l):
    """Deep, slightly-desaturated monochromatic companion of the primary hue."""
    sec_s = _clamp(_round_half_up(s * SECONDARY_SAT_FACTOR), SECONDARY_SAT_MIN, SECONDARY_SAT_MAX)
    sec_l = _clamp(_round_half_up(l * SECONDARY_L_FACTOR), SECONDARY_L_MIN, SECONDARY_L_MAX)
    return hsl_to_hex(h, sec_s, sec_l)


def _derive_accent(h, s, bg):
    """Split-complementary pop; darken until it clears the UI contrast target on bg."""
    acc_h = (h + ACCENT_HUE_SHIFT) % 360
    acc_s = _clamp(s, ACCENT_SAT_MIN, ACCENT_SAT_MAX)
    for lightness in range(ACCENT_L_START, ACCENT_L_FLOOR - 1, -ACCENT_L_STEP):
        candidate = hsl_to_hex(acc_h, acc_s, lightness)
        if contrast_ratio(candidate, bg) >= UI_TARGET:
            return candidate
    return hsl_to_hex(acc_h, acc_s, ACCENT_L_FLOOR)


def derive_from_primary(primary=None):
    """Full 8-color dict generated from a single primary color.

    Secondary/Accent/Background come from color-theory rules; Text/Surface/
    Border/Muted from the same WCAG rules as the 4-input path. Invalid/missing
    primary falls back to DEFAULTS.
    """
    p = normalize_hex(primary) or DEFAULTS["primaryColor"]
    h, s, l = hex_to_hsl(p)
    bg = _derive_background(p)
    light = is_light_background(bg)
    text = _derive_text(p, bg, light)
    return {
        "primaryColor": p,
        "secondaryColor": _derive_secondary(h, s, l),
        "accentColor": _derive_accent(h, s, bg),
        "backgroundColor": bg,
        "textColor": text,
        "surfaceColor": _derive_surface(bg, text, light),
        "borderColor": mix_hex(text, bg, BORDER_MIX),
        "mutedColor": _derive_muted(text, bg),
    }


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


def resolve_colors(colors, auto=False, from_primary=False):
    """Normalize a theme.colors dict against the derivation engine.

    from_primary=True -> regenerate the ENTIRE palette (secondary/accent/
                  background + text/surface/border/muted) from primaryColor
                  alone via color-theory rules. This is the dashboard's
                  single-input mode; any stored secondary/accent/background is
                  intentionally overridden. Takes precedence over `auto`.
    auto=True  -> re-derive text/surface/border/muted from the 4 inputs,
                  overriding whatever was sent/stored (4-input auto mode).
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
    if from_primary and normalize_hex(colors.get("primaryColor")):
        derived = derive_from_primary(colors.get("primaryColor"))
        for key in INPUT_KEYS + DERIVED_KEYS:
            colors[key] = derived[key]
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
