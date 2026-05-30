# Install the SketchLib Plugin

You need: **SketchUp 2020–2026** (Windows or Mac) and a SketchLib account.

Models from the library are saved in recent SketchUp versions. **2022 and newer** can open them automatically. On **2020–2021**, only models exported for your version will insert.

## Easy install (.rbz — recommended)

1. Download **`sketchlib-1.0.1-beta.rbz`** from the website or GitHub release.
2. Open SketchUp → **Window → Preferences → Extensions**.
3. Click **Install Extension…** and choose the `.rbz` file.
4. If SketchUp asks about loading unsigned extensions, allow it (Extension Manager → **Unrestricted** or approve when prompted).
5. Open a model → **Extensions → SketchLib** → sign in with your website email and password.

No unzipping, no Plugins folder, no restart required (SketchUp loads it after install).

## Manual install (zip — developers only)

Only if you cannot use `.rbz`: unzip, then copy `load_sketchlib.rb` and the `sketchlib-plugin` folder into your SketchUp **Plugins** folder. Restart SketchUp.

---

One computer per account. Open a 3D model first — the Extensions menu appears after you leave the Home screen.
