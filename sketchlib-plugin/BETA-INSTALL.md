# SketchLib Plugin — Beta Install (v1.0.0-beta)

**Production API:** https://sketchup-store-api-main-cupply.laravel.cloud/api  
**Website:** https://sketchup-store-web.vercel.app  

Subscribe or register on the website first, then use the same email/password in SketchUp.

---

## Requirements

- **SketchUp desktop** (Windows or Mac) — Pro or trial. Not SketchUp for Web.
- **Internet** — plugin talks to the live API (no local Laravel needed).

---

## Install (Windows)

1. Quit SketchUp completely.
2. Press **Win + R**, type: `%APPDATA%\SketchUp`
3. Open your version folder, e.g. **SketchUp 2026** → **SketchUp** → **Plugins**
4. Copy from this zip:
   - **`load_sketchlib.rb`** → directly into **Plugins** (not inside a subfolder)
   - **`sketchlib-plugin`** folder → into **Plugins** as `Plugins\sketchlib-plugin\`
5. Check these files exist:
   - `Plugins\load_sketchlib.rb`
   - `Plugins\sketchlib-plugin\ui\dist\app.js` (~148 KB)
   - `Plugins\sketchlib-plugin\ui\dist\shell.html`
6. Open SketchUp → **Create new model** (not only the Home screen).
7. **Extensions → SketchLib** → sign in.

---

## Install (Mac)

`~/Library/Application Support/SketchUp 20XX/SketchUp/Plugins/`  
Same layout: `load_sketchlib.rb` + `sketchlib-plugin/` folder.

---

## Beta accounts

Use credentials from your SketchLib account on https://sketchup-store-web.vercel.app  
Beta seed users (if still valid): `*@beta.sketchlib.com` / `beta2024!`

**One PC per account** — plugin binds to the first machine you log in from.  
New PC with same login → contact support to reset device.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| No **SketchLib** in Extensions | Put `load_sketchlib.rb` in Plugins **root**; restart SketchUp |
| Blank / error panel | `app.js` must be ~148 KB; re-download zip |
| Cannot reach API | Check internet; API must be up |
| 403 device linked | Account already used on another PC |

---

## Support

Website: https://sketchup-store-web.vercel.app  
Admin (staff): https://sketchup-store-api-main-cupply.laravel.cloud/admin
