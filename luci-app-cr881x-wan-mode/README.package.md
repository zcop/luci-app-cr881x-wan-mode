# luci-app-cr881x-wan-mode

WAN/LAN port role switching UI for Xiaomi CR881x.

## Features

- LuCI page under `Network` to switch between:
  - `all-lan`
  - `single-wan`
  - `dual-wan`
- Revamped card-based UI:
  - live runtime metrics (`mode`, `wan`, `wan2`, `br-lan`)
  - mode selection cards with inline descriptions
  - topology preview before apply
  - conflict validation for dual-WAN port selection
- Backend RPC (`luci.cr881x_wan_mode`) via rpcd ucode
- CLI helper `/usr/sbin/cr881x-wan-mode`

## Build/install in OpenWrt tree

- Add feed source to `feeds.conf`:

```text
src-git cr881x-wan-mode <your-repo-url>
```

- Then install package:

```sh
./scripts/feeds update cr881x-wan-mode
./scripts/feeds install luci-app-cr881x-wan-mode
```
