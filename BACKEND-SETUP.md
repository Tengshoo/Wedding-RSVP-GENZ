# 🛠️ Dual Backend Setup Guide (Google Sheets + Firebase Firestore)

This website is built to use **both Google Sheets and Firebase Firestore simultaneously**:
- **Google Sheets**: Your private master guest spreadsheet (headcount, dietary notes, guest names, attendance breakdown).
- **Firebase Firestore**: Google's real-time cloud database powering the live public wishes wall so all guests see new messages immediately.

---

## 1. 📊 Google Sheets Setup (Takes ~2 minutes)

### Step 1: Create a Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new sheet.
2. Name it e.g. **"Atif & Isma Wedding RSVP"**.

### Step 2: Open Apps Script
1. In the menu bar, click **Extensions** > **Apps Script**.
2. Delete any existing code and paste the following script:

```javascript
/**
 * Wedding RSVP & Wishes Webhook for Google Sheets
 * Automatically handles RSVP submissions and Wishes into separate tabs.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === "wish") {
      appendWish(ss, data);
    } else {
      appendRsvp(ss, data);
      if (data.message && data.message.trim()) {
        appendWish(ss, {
          name: data.name,
          emoji: data.emoji || (data.attendance === "yes" ? "🎉" : "💙"),
          message: data.message,
          attendance: data.attendance,
          timestamp: data.timestamp
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendRsvp(ss, data) {
  let sheet = ss.getSheetByName("RSVPs");
  if (!sheet) {
    sheet = ss.insertSheet("RSVPs");
    sheet.appendRow([
      "Timestamp",
      "Full Name",
      "Attending?",
      "Guest Count",
      "Additional Guest Names",
      "Dietary Requirements",
      "Song Request",
      "Vibe Emoji",
      "Message"
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#FFF3EE");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp || new Date(),
    data.name || "",
    data.attendance === "yes" ? "YES 🎉" : "NO 💙",
    data.guestCount || 1,
    data.guestNames || "",
    data.dietary || "",
    data.songRequest || "",
    data.emoji || "❤️",
    data.message || ""
  ]);
}

function appendWish(ss, data) {
  let sheet = ss.getSheetByName("Wishes");
  if (!sheet) {
    sheet = ss.insertSheet("Wishes");
    sheet.appendRow([
      "Timestamp",
      "Guest Name",
      "Vibe",
      "Attendance",
      "Message"
    ]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#F0F7FF");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp || new Date(),
    data.name || "",
    data.emoji || "❤️",
    data.attendance === "yes" ? "Attending" : (data.attendance === "no" ? "Can't make it" : "Wish only"),
    data.message || ""
  ]);
}
```

### Step 3: Deploy as a Web App
1. Click the blue **Deploy** button at top right > **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `Wedding RSVP Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **`Anyone`** *(Important: Must be "Anyone" so guests can submit without signing in)*
4. Click **Deploy**.
5. Grant permissions if prompted by Google (click *Advanced* > *Go to Untitled project (unsafe)* > *Allow*).
6. Copy the **Web App URL** (starts with `https://script.google.com/macros/s/.../exec`).

### Step 4: Paste URL into `script.js`
In `script.js`, set `googleSheetsUrl`:
```javascript
googleSheetsUrl: "https://script.google.com/macros/s/YOUR_DEPLOYED_ID/exec",
```

---

## 2. 🔥 Firebase Firestore Setup (Takes ~2 minutes)

Firestore provides a real-time live database so newly submitted wishes appear instantly on any visitor's screen.

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project** (or create one for free).
2. Give it a name (e.g. `atif-isma-wedding`) and continue.

### Step 2: Create a Firestore Database
1. In the left sidebar, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your guests (e.g. `asia-southeast1` for Singapore/Malaysia) and click Next.
4. Choose **Start in test mode** (or set the security rules below in the **Rules** tab):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can submit RSVPs:
    match /rsvps/{document} {
      allow create: if true;
      allow read: if false; // Private: viewable only in Firebase Console or Google Sheets
    }
    // Anyone can read and post to the public wishes wall:
    match /wishes/{document} {
      allow read, create: if true;
    }
  }
}
```

### Step 3: Get Your Web App Keys
1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview" > **Project settings**.
2. Under the **General** tab, scroll down to **Your apps**.
3. Click the Web icon **`</>`** to register a web app (give it any nickname, e.g. `Wedding Website`).
4. You will see your `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 4: Paste Credentials into `script.js`
In [`script.js`](script.js), paste your keys into `weddingConfig.firebaseConfig`:
```javascript
firebaseConfig: {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}
```

---

## 🎯 Verification & Testing

1. Open `index.html` in your browser.
2. Submit an RSVP or post a wish.
3. Open your **Google Sheet** → See the new row in `RSVPs` and `Wishes` tabs!
4. Open **Firebase Console > Firestore Database** → See the document in `rsvps` and `wishes` collections!
5. Open the website on your phone or in an incognito window → Wishes update live in real-time!
