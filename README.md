# 💍 Atif & Isma — Gen Z Wedding RSVP Website

> **"WE'RE GETTING MARRIED."**
> A modern, playful, internet-native wedding invitation for Muhammad Atif & Ismasari.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 **Design** | Gen Z Digital Scrapbook aesthetic — Polaroids, tape, stickers, annotations |
| 📱 **Mobile-first** | Fully responsive. Bottom nav on mobile, sticky nav on desktop |
| ⏳ **Live Countdown** | Real-time countdown to the wedding date |
| 💌 **RSVP Form** | 3-step guided form with validation, guest names, dietary, song request |
| 📖 **Our Story** | Scrapbook timeline of the relationship milestones |
| 💑 **Couple Profiles** | Playful profile cards for Atif & Isma |
| 📸 **Receipts Gallery** | Asymmetric photo gallery with polaroid-style captions |
| 📋 **Wedding Details** | Clean card layout — Date, Time, Venue, Dress Code |
| 🗺️ **Navigation Links** | One-tap Google Maps + Waze buttons |
| ❓ **FAQ Accordion** | Accessible, animated accordion for common questions |
| 💌 **Digital Guestbook** | Leave messages with emoji vibes |
| 🤣 **Meme Wall** | Editable meme cards for "things we need to address" |
| 🎵 **Music Player** | Optional floating play button — muted by default |
| 🥚 **Easter Eggs** | Konami code, secret sticker, floating hearts, DO NOT CLICK |
| ♿ **Accessible** | ARIA labels, keyboard nav, focus styles, reduced-motion support |

---

## 🚀 Quick Start

1. **Open locally** — just double-click `index.html`
2. **Deploy to GitHub Pages** — push to a repo, enable Pages on `main` branch root
3. **Deploy to Netlify/Vercel** — drag the folder or connect the repo

No build step. No dependencies. No framework. Just open and go.

---

## ✏️ How to Customise

### 1. Edit Wedding Details — `script.js`

Open `script.js` and update the config object at the top:

```js
const weddingConfig = {
  groom:       "Muhammad Atif",
  bride:       "Ismasari",
  date:        "2025-06-15T12:00:00",   // ISO 8601 wedding datetime
  dateDisplay: "15 June 2025",           // Human-readable date
  timeDisplay: "12:00 PM — 8:00 PM",
  venue:       "The Grand Ballroom",
  address:     "123 Wedding Lane, Kuala Lumpur",
  mapsUrl:     "https://maps.google.com/?q=YOUR+VENUE",
  wazeUrl:     "https://waze.com/ul?ll=LAT,LNG&navigate=yes",
  musicUrl:    "assets/music/our-song.mp3",  // Leave empty to hide music button
  hashtag:     "#AtifIsmaForever",
  dressCode:   "Smart Casual · Earth Tones",
};
```

### 2. Replace Photo Placeholders — `index.html`

Search for `<!-- EDITABLE -->` comments throughout `index.html`.

To replace an emoji placeholder with a real photo:

```html
<!-- Before -->
<div class="polaroid-img-placeholder">
  <span class="polaroid-emoji">💑</span>
</div>

<!-- After -->
<img src="assets/images/couple-photo.jpg" alt="Atif and Isma" class="polaroid-img" />
```

Add this CSS to `style.css`:
```css
.polaroid-img { width: 100%; height: 100%; object-fit: cover; }
```

### 3. Add Real Meme Images

In `index.html`, find the `.meme-img-placeholder` elements and replace with:
```html
<img src="assets/images/meme1.jpg" alt="Meme description" loading="lazy" />
```

### 4. Connect RSVP to a Backend — `script.js`

Find the `submitRSVP(data)` function and replace the mock with:

**Google Sheets (via Apps Script):**
```js
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
const res = await fetch(SCRIPT_URL, {
  method: "POST",
  body: JSON.stringify(data),
});
return res.json();
```

**Supabase:**
```js
const { error } = await supabase.from("rsvps").insert([data]);
if (error) throw error;
return { success: true };
```

**Firebase Firestore:**
```js
await addDoc(collection(db, "rsvps"), data);
return { success: true };
```

### 5. Add Music

Place your song at `assets/music/our-song.mp3` and set `musicUrl` in `weddingConfig`.

### 6. Customise Story Timeline

Edit the `.timeline-item` blocks in `index.html`. Add real dates and personalised captions.

### 7. Update Dress Code Colours

Find the `.dresscode-card` blocks and update the `style="background:..."` on each `.color-swatch` to match your actual colour palette.

---

## 📁 File Structure

```
/
├── index.html          ← Main HTML (all sections)
├── style.css           ← All styles, design tokens, animations
├── script.js           ← All interactivity, config, backend-ready RSVP
├── README.md
└── assets/
    ├── images/         ← Couple photos, gallery, OG image
    │   └── og-image.jpg
    ├── music/          ← Wedding song (mp3)
    └── icons/          ← Custom icons if needed
```

---

## 🥚 Easter Eggs

| Easter Egg | How to Trigger |
|---|---|
| 🎊 Floating Hearts | Click the ♥ in the hero 3+ times, or double-click/tap a gallery photo |
| 👀 Secret Sticker | Click the ❤️ sticker in the hero scrapbook 3 times |
| 💀 DO NOT CLICK | Click the "DO NOT CLICK ⚠️" button at the bottom |
| 🕹️ Konami Code | ↑ ↑ ↓ ↓ ← → ← → B A |

---

## ♿ Accessibility

- Semantic HTML5 structure
- ARIA roles, labels, and `aria-live` regions
- Keyboard navigable (Tab, Enter, Space, Escape)
- Visible focus indicators
- `prefers-reduced-motion` respected — all decorative animations disabled
- Form validation with friendly, descriptive error messages
- Screen-reader friendly buttons and form controls

---

## 🎨 Design Tokens

Customise the entire visual theme in one place at the top of `style.css`:

```css
:root {
  --bg:      #FFFDF7;   /* Main background */
  --accent:  #E8533A;   /* Primary accent (red-orange) */
  --accent2: #F5C842;   /* Secondary accent (yellow) */
  --text:    #1A1A1A;   /* Main text */
  /* ... */
}
```

---

## 📱 Tested Breakpoints

- 320px (iPhone SE)
- 375px (iPhone 14)
- 390px (iPhone 14 Pro)
- 430px (iPhone 14 Plus)
- 768px (iPad)
- 1024px (iPad Pro / small laptop)
- 1440px (Desktop)

---

## 💙 Made with love (and wedding planning stress)

Muhammad Atif & Ismasari

*Your presence > presents. Always.*
