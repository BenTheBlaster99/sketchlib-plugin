# SketchLib — SketchUp Plugin

Ruby extension + HtmlDialog UI for the SketchLib furniture library API.

## On Ubuntu? Read this first

**SketchUp does not run natively on Ubuntu.** There is no “Extensions” menu in Linux, GNOME, or this repo — that menu lives **inside the SketchUp desktop app**, which only exists for **Windows** and **macOS**.

So Phase 1 is **not** tested by opening a file on Ubuntu. You need SketchUp running on Windows or Mac (same machine, another PC, or a VM).

| What you have now | What Phase 1 needs |
|-------------------|-------------------|
| Ubuntu + this repo | Windows or Mac **with SketchUp installed** |
| Edit Ruby/HTML here | Run SketchUp there and install the plugin folder |

**Where “Extensions → SketchLib” is:** open SketchUp → top menu bar → **Extensions** (between Tools and Help on many versions) → click **SketchLib**. That opens the panel with “Get hardware ID”.

**Practical options from Ubuntu:**

1. **Windows VM** (VirtualBox / VMware) — install SketchUp, copy `sketchlib-plugin` into the VM’s Plugins folder.
2. **Another PC** with SketchUp — copy the folder over USB / network share.
3. **Dual boot** Windows — install plugin on the Windows side.
4. **Skip Phase 1 UI test for now** — keep building Phase 2 on Ubuntu (`npm run build`); do the real bridge test the first time you open SketchUp on Windows/Mac.

SketchUp for Web (browser) does **not** load custom Ruby plugins like this one.

**Two-PC setup (Ubuntu + sister’s Windows PC):** totally fine.

1. **Your PC (Ubuntu):** edit code in Cursor, commit/copy files when ready.
2. **Her PC (Windows):** install SketchUp if not already, copy the whole `sketchlib-plugin` folder to her Plugins directory (USB, Google Drive, email zip, etc.).
3. On her PC: restart SketchUp → **Extensions → SketchLib** → run Phase 1 tests.
4. When you change the plugin on Ubuntu, copy the folder again (or only changed files) and restart SketchUp on her PC.

You do **not** need the Laravel API running on her PC for Phase 1 — only SketchUp. For Phase 2 login, either run `php artisan serve` on your Ubuntu machine and use your Ubuntu LAN IP in the plugin config (e.g. `http://192.168.1.42:8000/api`), or run the API on her network another way.

---

## Phase 1 (current): Ruby bridge test

**Only inside SketchUp** (Windows/Mac): **Extensions → SketchLib**. The placeholder panel should:

1. **Get hardware ID** — stable machine UUID (on Windows: WMIC; Mac: system_profiler; Linux path in code is for rare Linux hosts only).
2. **Save / Load / Clear token** — Ruby `Sketchup.write_default` / `read_default`.

Opening `ui/dist/index.html` in Firefox/Chrome on Ubuntu will **not** work (`window.sketchup` is missing). That is expected.

No React build required yet.

## Install in SketchUp

Copy or symlink this entire `sketchlib-plugin` folder into your SketchUp **Plugins** directory so SketchUp loads `sketchlib.rb` at startup.

| OS | Plugins path (adjust year: 2024, 2025, …) |
|----|-------------------------------------------|
| Windows | `%APPDATA%\SketchUp\SketchUp 20XX\SketchUp\Plugins\` |
| macOS | `~/Library/Application Support/SketchUp 20XX/SketchUp/Plugins/` |

**From Ubuntu → Windows VM (typical workflow):**

1. On Ubuntu: keep editing files in this repo (Cursor).
2. Share the folder with the VM (shared folder, `scp`, or copy `sketchlib-plugin` into the VM).
3. On Windows inside the VM, copy the folder to:
   `C:\Users\YOUR_USER\AppData\Roaming\SketchUp\SketchUp 20XX\SketchUp\Plugins\sketchlib-plugin`
   (create `Plugins` if it does not exist; `20XX` = your SketchUp year, e.g. 2025).
4. Restart SketchUp → **Extensions → SketchLib**.

**Symlink on Windows** (optional, if repo lives on a shared drive):

```powershell
# PowerShell on Windows — adjust paths and SketchUp year
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\SketchUp\SketchUp 2025\SketchUp\Plugins\sketchlib-plugin" -Target "Z:\path\to\sketchlib-plugin"
```

After install: **restart SketchUp** (extensions load on startup).

## Project layout

```
sketchlib-plugin/
├── sketchlib.rb          # Extension entry (SketchUp loads this)
├── sketchlib/
│   ├── main.rb           # HtmlDialog + menu
│   └── bridge.rb         # Hardware ID, API URL, insert (Phase 4)
├── ui/
│   └── dist/
│       └── index.html    # Phase 1 placeholder (Phase 2+ → Vite React build)
└── README.md
```

## API URL (later phases)

Default in `sketchlib/bridge.rb`:

- `http://localhost:8000/api` (local Laravel)

Optional override before starting SketchUp:

```bash
export SKETCHLIB_API_URL=https://api.yourdomain.com/api
```

## Phase 4 note (model insert)

Presigned R2 URLs are **not** passed directly to `definitions.load()`. `Bridge.download_and_insert` downloads to a temp `.skp`, loads from disk, inserts the instance, then deletes the temp file. Implemented in `bridge.rb` for Phase 4 testing.

## Backend for Phase 2+

```bash
cd "../sketchup-store-api"
php artisan serve
```

Test login: `test@example.com` / `password123` with `hardware_id` in the JSON body (plugin flow).

## Build phases

| Phase | Status |
|-------|--------|
| 1 | Ruby skeleton + bridge test HTML |
| 2 | React login + token |
| 3 | Library browse UI |
| 4 | Insert model (temp file download) |
| 5 | Polish + production config |
