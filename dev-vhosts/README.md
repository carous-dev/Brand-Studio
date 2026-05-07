# dev-vhosts/

Brand Studio's automation thread writes rendered Apache vhost configurations
to this directory when running in **dev mode** (i.e. `platform.system() == 'Windows'`
or `BRAND_AUTOMATION_DEV_MODE=1`). On a real Linux production host they go to
`/etc/apache2/sites-available/` and the same automation calls `a2ensite +
apache2ctl configtest + systemctl reload apache2`.

This directory is for **inspection only** — no Apache is reading from it.

## What you can verify locally with these files

- The vhost template renders correctly for a brand's domain
- The right SSL cert / key paths are interpolated for the matching base domain
  (managed templates under `managed_vhost_templates/` are picked by hostname)
- The HTTP→HTTPS redirect block is included
- The Next.js / WebSocket port placeholders match your env

## How to view what would be deployed

After creating a brand via the dashboard, inspect:

```
dev-vhosts/<brand-domain>.conf
```

Compare with what `managed_vhost_templates/<base>.vhost_template.conf` produced
to confirm the substitution is correct.

## Override the output dir

```
DEV_VHOSTS_DIR=/some/other/path
```

## Cleaning up

The dashboard's "Delete brand" flow will remove the matching `.conf` from this
directory in dev mode (mirrors the `a2dissite + unlink` flow on production).

## Why is this not committed?

The directory itself is committed (with this README + a `.gitkeep`) so the
checkout has somewhere to write to without a manual `mkdir`. Contents are
runtime artifacts and ignored — see `.gitignore`.
