# SketchLib — SketchUp Plugin

Ruby extension + HtmlDialog UI for the SketchLib furniture library API.

## On Ubuntu? Read this first

**SketchUp does not run natively on Ubuntu.** There is no “Extensions” menu in Linux, GNOME, or this repo — that menu lives **inside the SketchUp desktop app**, which only exists for **Windows** and **macOS**.

So Phase 1 is **not** tested by opening a file on Ubuntu. You need SketchUp running on Windows or Mac (same machine, another PC, or a VM).

| What you have now | What Phase 1 needs |
|-------------------|-------------------|
| Ubuntu + this repo | Windows or Mac **with SketchUp installed** |
| Edit Ruby/HTML here | Run SketchUp there and install the plugin folder |

**Where “Extensions → SketchLib” is:** you must be **inside a 3D model**, not on the start screen.

1. Open SketchUp — you may only see **Home** and **Learn** (no File / Extensions). That is normal on the launcher.
2. Click **Create new model** (or pick any template / blank file).
3. Wait until you see the **3D workspace** (axes, ground plane, toolbar on the left).
4. Now the top menu should show **File, Edit, View, … Extensions, … Help**.
5. **Extensions → SketchLib** → “Get hardware ID”.

If the menu bar is still hidden on Windows, press **Alt** once to show it, or click the **≡** menu (top-left) and look for **Extensions**.

Still no **SketchLib** under Extensions? See **Troubleshooting** below.

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
3. On Windows, copy the **`sketchlib-plugin`** folder into Plugins, **and** copy **`load_sketchlib.rb`** into the Plugins **root** (same level as the folder, not inside it):

   ```
   Plugins\
     load_sketchlib.rb          ← required loader (many SketchUp versions)
     sketchlib-plugin\
       sketchlib.rb
       sketchlib\main.rb
       sketchlib\bridge.rb
       ui\dist\index.html
   ```

   Path example: `C:\Users\YOU\AppData\Roaming\SketchUp\SketchUp 2025\SketchUp\Plugins\`

4. Restart SketchUp → create a model → **Extensions → SketchLib**.

   **Do not** use Extension Manager → “Install extension” for this project — that button expects a **`.rbz`** package from Extension Warehouse, not your dev folder.

**Symlink on Windows** (optional, if repo lives on a shared drive):

```powershell
# PowerShell on Windows — adjust paths and SketchUp year
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\SketchUp\SketchUp 2025\SketchUp\Plugins\sketchlib-plugin" -Target "Z:\path\to\sketchlib-plugin"
```

After install: **restart SketchUp** (extensions load on startup).

## Project layout

```
sketchlib-plugin/
├── load_sketchlib.rb     # Copy to Plugins ROOT (loader — required on many PCs)
├── sketchlib.rb          # Real extension entry (loaded by loader above)
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

## Troubleshooting (Windows)

**Only Home / Learn, no Extensions**
- You are on the **start screen**. Create or open a model first (see above).

**Extensions exists but no SketchLib**
- **Most common fix:** copy `load_sketchlib.rb` to the **Plugins root** (next to the `sketchlib-plugin` folder). SketchUp often ignores `.rb` files inside subfolders.
- Confirm: `%APPDATA%\SketchUp\SketchUp 20XX\SketchUp\Plugins\load_sketchlib.rb` and `...\Plugins\sketchlib-plugin\ui\dist\index.html` (year must match installed SketchUp).
- Fully **quit** SketchUp (File → Exit), reopen, open a model again.
- **Window → Extension Manager**: see if **SketchLib** is listed and enabled (checkbox on).
- **Window → Ruby Console** after startup: look for red errors mentioning `sketchlib`.

**Wrong app**
- **SketchUp Viewer** or browser-only SketchUp cannot load this plugin. You need **SketchUp Pro** or **desktop trial** from [sketchup.com/download](https://www.sketchup.com/download).

**Errors on startup**
- Ruby Console: **Window → Ruby Console** — red errors about `sketchlib` help debug (copy the message back to dev).

## Build phases

| Phase | Status |
|-------|--------|
| 1 | Ruby skeleton + bridge test HTML |
| 2 | React login + token |
| 3 | Library browse UI |
| 4 | Insert model (temp file download) |
| 5 | Polish + production config |
