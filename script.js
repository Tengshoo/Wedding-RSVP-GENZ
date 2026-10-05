
const weddingConfig = {
  groom: "Muhammad Atif",
  bride: "Ismasari",
  // EDITABLE: Set your actual wedding date/time (ISO 8601)
  date: "2025-06-15T12:00:00",
  // EDITABLE: Display-format date string
  dateDisplay: "15 June 2025",
  timeDisplay: "12:00 PM — 8:00 PM",
  // EDITABLE: Venue details
  venue: "The Grand Ballroom",
  address: "123 Wedding Lane, Kuala Lumpur, Malaysia",
  // EDITABLE: Navigation URLs (update to real coordinates/venues)
  mapsUrl: "https://maps.google.com/?q=Kuala+Lumpur+Malaysia",
  wazeUrl: "https://waze.com/ul?ll=3.1390,101.6869&navigate=yes",
  // EDITABLE: Your music URL (mp3, ogg, or streaming link)
  musicUrl: "", // e.g. "assets/music/our-song.mp3"
  // EDITABLE: Social hashtag
  hashtag: "#AtifIsmaForever",
  // EDITABLE: Dress code summary
  dressCode: "Smart Casual · Earth Tones",

  // ── BACKEND INTEGRATIONS ──
  // 1. Google Sheets Web App URL (Deploy Apps Script as Web App with access: Anyone)
  googleSheetsUrl: "https://script.google.com/macros/s/AKfycbz56-11-cQ99SKLN6uIMJQ4b0L4pCDfDDKlvcqgyvYqxs4epQMFht9z5-vAINQv3cRA/exec",

  // 2. Firebase Configuration (Firebase Console > Project Settings > General > Your apps)
  firebaseConfig: {
    apiKey: "AIzaSyAkfsu97nRvp2_NfXukNHok8QlpNKXrCvM",
    authDomain: "wedding-rsvp-genz-template.firebaseapp.com",
    projectId: "wedding-rsvp-genz-template",
    storageBucket: "wedding-rsvp-genz-template.firebasestorage.app",
    messagingSenderId: "501909002032",
    appId: "1:501909002032:web:f288ab17db3cd3bb6c9af5",
    measurementId: "G-C32WWH7WQ8"
  }
};

// Firebase Firestore instance helper
let firestoreDb = null;
function getFirestore() {
  if (!firestoreDb && window.firebase && weddingConfig.firebaseConfig && weddingConfig.firebaseConfig.projectId) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(weddingConfig.firebaseConfig);
      }
      firestoreDb = firebase.firestore();
    } catch (err) {
      console.warn("Firebase initialization error:", err);
    }
  }
  return firestoreDb;
}

/**
 * ============================================================
 * RSVP SUBMIT FUNCTION — Dual Google Sheets + Firebase Firestore
 * ============================================================
 */
async function submitRSVP(data) {
  console.log("📋 RSVP Data:", data);
  const db = getFirestore();
  let savedToBackend = false;

  // 1. Save to Firebase Firestore (if configured)
  if (db) {
    try {
      const rsvpDoc = {
        name: data.name,
        attendance: data.attendance,
        guestCount: data.guestCount,
        guestNames: data.guestNames && data.guestNames.length ? data.guestNames.join(", ") : "",
        dietary: data.dietary || "",
        emoji: data.emoji || "❤️",
        message: data.message || "",
        songRequest: data.songRequest || "",
        timestamp: data.timestamp || new Date().toISOString()
      };

      await db.collection("rsvps").add(rsvpDoc);
      savedToBackend = true;

      // If guest left a wish message, also add to wishes collection for live public board
      if (data.message && data.message.trim()) {
        const wishDoc = {
          name: data.name,
          emoji: data.emoji || (data.attendance === "yes" ? "🎉" : "💙"),
          message: data.message.trim(),
          attendance: data.attendance,
          timestamp: data.timestamp || new Date().toISOString()
        };
        await db.collection("wishes").add(wishDoc);
      }
    } catch (err) {
      console.warn("Firestore error during RSVP:", err);
    }
  }

  // 2. Save to Google Sheets (if configured)
  if (weddingConfig.googleSheetsUrl) {
    try {
      const payload = {
        action: "rsvp",
        name: data.name,
        attendance: data.attendance,
        guestCount: data.guestCount,
        guestNames: data.guestNames && data.guestNames.length ? data.guestNames.join(", ") : "",
        dietary: data.dietary || "",
        emoji: data.emoji || "❤️",
        message: data.message || "",
        songRequest: data.songRequest || "",
        timestamp: data.timestamp || new Date().toISOString()
      };

      await fetch(weddingConfig.googleSheetsUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      savedToBackend = true;
    } catch (err) {
      console.warn("Google Sheets RSVP error:", err);
    }
  }

  // 3. Fallback demo simulation if neither is configured yet
  if (!savedToBackend && !db && !weddingConfig.googleSheetsUrl) {
    console.log("ℹ️ Demo mode: set googleSheetsUrl or firebaseConfig in weddingConfig to persist data.");
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  return { success: true };
}

/**
 * ============================================================
 * GUESTBOOK SUBMIT FUNCTION — Dual Google Sheets + Firebase Firestore
 * ============================================================
 */
async function submitGuestbookEntry(entry) {
  console.log("💌 Guestbook Entry:", entry);
  const db = getFirestore();
  let savedToBackend = false;

  // 1. Save to Firebase Firestore (if configured)
  if (db) {
    try {
      const wishDoc = {
        name: entry.name,
        emoji: entry.emoji || "❤️",
        message: entry.text,
        attendance: entry.attendance || "",
        timestamp: entry.timestamp || new Date().toISOString()
      };
      await db.collection("wishes").add(wishDoc);
      savedToBackend = true;
    } catch (err) {
      console.warn("Firestore wish error:", err);
    }
  }

  // 2. Save to Google Sheets (if configured)
  if (weddingConfig.googleSheetsUrl) {
    try {
      const payload = {
        action: "wish",
        name: entry.name,
        emoji: entry.emoji || "❤️",
        message: entry.text,
        attendance: entry.attendance || "",
        timestamp: entry.timestamp || new Date().toISOString()
      };
      await fetch(weddingConfig.googleSheetsUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      savedToBackend = true;
    } catch (err) {
      console.warn("Google Sheets wish error:", err);
    }
  }

  // Fallback demo simulation
  if (!savedToBackend && !db && !weddingConfig.googleSheetsUrl) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { success: true };
}

/* ============================================================
   INITIAL SETUP — Populate from weddingConfig
   ============================================================ */
function initConfig() {
  // Dates
  const d = document.getElementById("heroDate");
  if (d) d.textContent = weddingConfig.dateDisplay;

  const dd = document.getElementById("detailDate");
  if (dd) dd.textContent = weddingConfig.dateDisplay;

  const dt = document.getElementById("detailTime");
  if (dt) dt.textContent = weddingConfig.timeDisplay;

  const dv = document.getElementById("detailVenue");
  if (dv) dv.textContent = weddingConfig.venue;

  const da = document.getElementById("detailAddress");
  if (da) da.textContent = weddingConfig.address;

  const dc = document.getElementById("detailDressCode");
  if (dc) dc.textContent = weddingConfig.dressCode;

  const mb = document.getElementById("mapsBtn");
  if (mb) mb.href = weddingConfig.mapsUrl;

  const wb = document.getElementById("wazeBtn");
  if (wb) wb.href = weddingConfig.wazeUrl;

  const fh = document.getElementById("footerHashtag");
  if (fh) fh.textContent = weddingConfig.hashtag;

  const fd = document.getElementById("footerDate");
  if (fd) fd.textContent = weddingConfig.dateDisplay;

  const fy = document.getElementById("footerYear");
  if (fy) fy.textContent = new Date().getFullYear();

  // Music
  const audio = document.getElementById("weddingAudio");
  if (audio && weddingConfig.musicUrl) {
    audio.src = weddingConfig.musicUrl;
  }
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function initCountdown() {
  const target = new Date(weddingConfig.date).getTime();

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      document.getElementById("cdDays").textContent = "00";
      document.getElementById("cdHours").textContent = "00";
      document.getElementById("cdMins").textContent = "00";
      document.getElementById("cdSecs").textContent = "00";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const fmt = n => String(n).padStart(2, "0");
    document.getElementById("cdDays").textContent = fmt(days);
    document.getElementById("cdHours").textContent = fmt(hours);
    document.getElementById("cdMins").textContent = fmt(mins);
    document.getElementById("cdSecs").textContent = fmt(secs);
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav() {
  const nav = document.getElementById("mainNav");
  const links = document.querySelectorAll(".nav-link, .bottom-nav-item");
  const sections = document.querySelectorAll("section[id]");

  // Scroll: add scrolled class & highlight active link
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);

    let current = "";
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      const href = l.getAttribute("href")?.replace("#", "");
      l.classList.toggle("active", href === current);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Logo click scrolls to top
  document.getElementById("navLogo")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor = document.getElementById("cursor");
  const follower = document.getElementById("cursorFollower");
  if (!cursor || !follower) return;

  // Only on devices with fine pointer
  if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

  let cx = 0, cy = 0, fx = 0, fy = 0;
  let raf;

  document.addEventListener("mousemove", e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    cursor.style.display = "block";
    follower.style.display = "block";
  });

  const animate = () => {
    fx += (cx - fx) * 0.12;
    fy += (cy - fy) * 0.12;
    follower.style.transform = `translate(${fx}px, ${fy}px)`;
    raf = requestAnimationFrame(animate);
  };
  animate();

  document.querySelectorAll("a, button, [tabindex]").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hovering");
      follower.classList.add("hovering");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hovering");
      follower.classList.remove("hovering");
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const items = document.querySelectorAll(".reveal-up");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("revealed");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach(el => io.observe(el));
}

/* ============================================================
   RSVP HOOK (YES / NO buttons)
   ============================================================ */
function initRsvpHook() {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const hookBtns = document.getElementById("rsvpHookBtns");
  const yesReaction = document.getElementById("yesReaction");
  const noReaction = document.getElementById("noReaction");
  const comebackBtn = document.getElementById("comebackBtn");

  function showYes() {
    hookBtns.style.display = "none";
    noReaction.classList.remove("show");
    yesReaction.classList.add("show");
    yesReaction.removeAttribute("aria-hidden");
    setTimeout(() => {
      document.getElementById("rsvp-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
  }

  function showNo() {
    hookBtns.style.display = "none";
    yesReaction.classList.remove("show");
    noReaction.classList.add("show");
    noReaction.removeAttribute("aria-hidden");
  }

  function reset() {
    noReaction.classList.remove("show");
    noReaction.setAttribute("aria-hidden", "true");
    hookBtns.style.display = "flex";
  }

  yesBtn?.addEventListener("click", showYes);
  noBtn?.addEventListener("click", showNo);
  comebackBtn?.addEventListener("click", () => {
    reset();
    setTimeout(showYes, 200);
  });
}

/* ============================================================
   MULTI-STEP RSVP FORM
   ============================================================ */
function initRsvpForm() {
  const form = document.getElementById("rsvpForm");
  const progress = document.getElementById("rsvpProgressBar");
  const progressLbl = document.getElementById("rsvpProgressLabel");
  const successEl = document.getElementById("rsvpSuccess");
  const successMsg = document.getElementById("successMsg");

  const steps = [
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3"),
  ];
  let currentStep = 0;
  const TOTAL_STEPS = 3;

  // Progress helpers
  function setStep(n) {
    steps.forEach((s, i) => {
      s.style.display = i === n ? "block" : "none";
      s.classList.toggle("rsvp-step--active", i === n);
      s.setAttribute("aria-hidden", i !== n);
    });
    currentStep = n;
    const pct = ((n + 1) / TOTAL_STEPS) * 100;
    progress.style.width = pct + "%";
    progressLbl.textContent = `STEP ${n + 1} OF ${TOTAL_STEPS}`;

    // Scroll form into view on step change
    document.getElementById("rsvp-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── VALIDATION ──
  function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  }
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function validateStep1() {
    let valid = true;
    clearError("guestNameError");
    clearError("attendanceError");

    const name = document.getElementById("guestName").value.trim();
    if (!name) {
      showError("guestNameError", "Oops 😭 we need your name first.");
      document.getElementById("guestName").classList.add("error");
      valid = false;
    } else {
      document.getElementById("guestName").classList.remove("error");
    }

    const att = document.querySelector('input[name="attendance"]:checked');
    if (!att) {
      showError("attendanceError", "Are you coming or nah? Pick one. 👀");
      valid = false;
    }
    return valid;
  }

  function validateStep2() {
    clearError("guestCountError");
    const cnt = parseInt(document.getElementById("guestCount").value, 10);
    if (isNaN(cnt) || cnt < 1 || cnt > 10) {
      showError("guestCountError", "Enter a valid number between 1 and 10. 🙏");
      return false;
    }
    return true;
  }

  // Step navigation
  document.getElementById("step1Next")?.addEventListener("click", () => {
    if (validateStep1()) setStep(1);
  });
  document.getElementById("step2Back")?.addEventListener("click", () => setStep(0));
  document.getElementById("step2Next")?.addEventListener("click", () => {
    if (validateStep2()) setStep(2);
  });
  document.getElementById("step3Back")?.addEventListener("click", () => setStep(1));

  // ── GUEST COUNT COUNTER ──
  const guestCountInput = document.getElementById("guestCount");
  const additionalGroup = document.getElementById("additionalGuestsGroup");

  function renderAdditionalGuests() {
    const count = parseInt(guestCountInput.value, 10) || 1;
    const extra = count - 1;
    additionalGroup.innerHTML = "";
    if (extra <= 0) return;

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = "Guest Name(s)";
    additionalGroup.appendChild(label);

    for (let i = 1; i <= extra; i++) {
      const inp = document.createElement("input");
      inp.className = "form-input";
      inp.type = "text";
      inp.name = `guest_${i}`;
      inp.id = `guest_${i}`;
      inp.placeholder = `Guest ${i} name...`;
      inp.style.marginTop = "0.5rem";
      inp.autocomplete = "name";
      additionalGroup.appendChild(inp);
    }
  }

  document.getElementById("guestCountMinus")?.addEventListener("click", () => {
    const v = parseInt(guestCountInput.value, 10) || 1;
    if (v > 1) { guestCountInput.value = v - 1; renderAdditionalGuests(); }
  });
  document.getElementById("guestCountPlus")?.addEventListener("click", () => {
    const v = parseInt(guestCountInput.value, 10) || 1;
    if (v < 10) { guestCountInput.value = v + 1; renderAdditionalGuests(); }
  });
  guestCountInput?.addEventListener("change", renderAdditionalGuests);

  // ── STEP 3 EMOJI PICKER ──
  let rsvpEmoji = "❤️";
  document.querySelectorAll(".rsvp-emoji-picker .emoji-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".rsvp-emoji-picker .emoji-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      rsvpEmoji = btn.dataset.emoji;
      const hiddenInput = document.getElementById("rsvpEmoji");
      if (hiddenInput) hiddenInput.value = rsvpEmoji;
    });
  });

  // ── SUBMIT ──
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Locking in... 🔒";

    // Collect guest names
    const guestNames = [];
    document.querySelectorAll("[id^='guest_']").forEach(inp => {
      if (inp.value.trim()) guestNames.push(inp.value.trim());
    });

    const emojiVal = document.getElementById("rsvpEmoji")?.value || rsvpEmoji || "❤️";
    const data = {
      name: document.getElementById("guestName").value.trim(),
      attendance: document.querySelector('input[name="attendance"]:checked')?.value || "",
      guestCount: parseInt(document.getElementById("guestCount").value, 10) || 1,
      guestNames,
      dietary: document.getElementById("dietary").value.trim(),
      emoji: emojiVal,
      message: document.getElementById("guestMessage").value.trim(),
      songRequest: document.getElementById("songRequest").value.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await submitRSVP(data);
      if (result.success) {
        // Show success screen
        form.style.display = "none";
        successEl.style.display = "block";
        successEl.classList.add("show");
        successEl.removeAttribute("aria-hidden");

        const att = data.attendance;
        if (att === "yes") {
          successMsg.textContent = `See you on ${weddingConfig.dateDisplay}! 🎉`;
        } else {
          successMsg.textContent = "We'll miss you. Thanks for letting us know. 💙";
        }

        // If guest left a wish message, post to the Live Wishes Wall!
        const wishNote = document.getElementById("successWishNote");
        if (data.message) {
          const wishEntry = {
            name: data.name,
            emoji: data.emoji || (att === "yes" ? "🎉" : "💙"),
            text: data.message,
            attendance: att,
          };
          renderGuestbookMessage(wishEntry);
          updateWishesCount();
          if (wishNote) {
            wishNote.textContent = "Your wish has been posted to the wall below! 💌";
            wishNote.style.display = "block";
          }
        } else {
          if (wishNote) wishNote.style.display = "none";
        }

        launchConfetti();
        showToast("RSVP locked in! 🔒");
      }
    } catch (err) {
      console.error("RSVP submission error:", err);
      submitBtn.disabled = false;
      submitBtn.textContent = "RSVP LOCKED IN 🔒";
      showToast("Something went wrong. Please try again! 😅");
    }
  });
}

/* ============================================================
   CONFETTI
   ============================================================ */
function launchConfetti() {
  const container = document.getElementById("successConfetti");
  if (!container) return;

  // Check reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colours = ["#E8533A", "#F5C842", "#5BAD7A", "#4A90D9", "#FF9E7A", "#FFD700"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("div");
    p.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 20}%;
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      background: ${colours[Math.floor(Math.random() * colours.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation: confettiDrop ${1 + Math.random() * 2}s ease-out ${Math.random() * 0.8}s forwards;
    `;
    container.appendChild(p);
  }

  // Inject keyframes once
  if (!document.getElementById("confettiStyles")) {
    const style = document.createElement("style");
    style.id = "confettiStyles";
    style.textContent = `
      @keyframes confettiDrop {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(300px) rotate(${360 + Math.random() * 360}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => { container.innerHTML = ""; }, 4000);
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFaq() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const answerId = btn.getAttribute("aria-controls");
      const answer = document.getElementById(answerId);

      // Close all
      document.querySelectorAll(".faq-question").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls"))?.setAttribute("hidden", "");
      });

      // Toggle clicked
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        answer?.removeAttribute("hidden");
      }
    });
  });
}

/* ============================================================
   RSVP / WISHES TABS
   ============================================================ */
function initRsvpWishesTabs() {
  const tabRsvp = document.getElementById("tabRsvp");
  const tabWishOnly = document.getElementById("tabWishOnly");
  const panelRsvp = document.getElementById("rsvpTabPanel");
  const panelWishOnly = document.getElementById("wishOnlyTabPanel");

  if (!tabRsvp || !tabWishOnly || !panelRsvp || !panelWishOnly) return;

  function setMode(wishOnly) {
    tabRsvp.classList.toggle("active", !wishOnly);
    tabRsvp.setAttribute("aria-selected", !wishOnly);
    tabWishOnly.classList.toggle("active", wishOnly);
    tabWishOnly.setAttribute("aria-selected", wishOnly);

    panelRsvp.hidden = wishOnly;
    panelWishOnly.hidden = !wishOnly;
  }

  tabRsvp.addEventListener("click", () => setMode(false));
  tabWishOnly.addEventListener("click", () => setMode(true));
}

/* ============================================================
   LIVE WISHES WALL & GUESTBOOK
   ============================================================ */
const demoMessages = [
  { name: "Sarah K.", emoji: "❤️", text: "Congratulations Atif & Isma! So happy for you both. Can't wait to celebrate!", attendance: "yes" },
  { name: "Zaid M.", emoji: "🎉", text: "Finally!! The group chat has been waiting for this announcement for YEARS 💀", attendance: "yes" },
  { name: "Nurul A.", emoji: "🥹", text: "This is the cutest wedding invitation I've ever seen. You two are so perfect for each other.", attendance: "yes" },
];

function updateWishesCount() {
  const messages = document.getElementById("guestbookMessages");
  const countText = document.getElementById("wishesCountText");
  if (!messages || !countText) return;
  const count = messages.querySelectorAll(".guestbook-msg").length;
  countText.textContent = `${count} ${count === 1 ? "wish" : "wishes"} received`;
}

function renderGuestbookMessage(entry) {
  const messages = document.getElementById("guestbookMessages");
  if (!messages) return;

  const card = document.createElement("div");
  card.className = "guestbook-msg";

  const badgeHtml = entry.attendance
    ? `<span class="guestbook-msg-badge ${entry.attendance === 'yes' ? 'badge-yes' : 'badge-no'}">
        ${entry.attendance === 'yes' ? '🎉 Attending' : '💙 Can\'t make it'}
       </span>`
    : '';

  card.innerHTML = `
    <div class="guestbook-msg-top">
      <div class="guestbook-msg-emoji">${entry.emoji || '💌'}</div>
      ${badgeHtml}
    </div>
    <div class="guestbook-msg-name">${escapeHtml(entry.name)}</div>
    <div class="guestbook-msg-text">${escapeHtml(entry.text)}</div>
  `;
  messages.prepend(card);
}

function initGuestbook() {
  const db = getFirestore();

  // Real-time listener for wishes from Firestore
  if (db) {
    try {
      db.collection("wishes")
        .orderBy("timestamp", "asc")
        .limit(100)
        .onSnapshot(snapshot => {
          if (!snapshot.empty) {
            const messages = document.getElementById("guestbookMessages");
            if (messages) messages.innerHTML = "";
            snapshot.forEach(doc => {
              const row = doc.data();
              renderGuestbookMessage({
                name: row.name,
                emoji: row.emoji || "❤️",
                text: row.message || row.text,
                attendance: row.attendance || ""
              });
            });
            updateWishesCount();
          }
        }, err => {
          console.warn("Firestore onSnapshot error:", err);
          demoMessages.forEach(renderGuestbookMessage);
          updateWishesCount();
        });
    } catch (err) {
      console.warn("Could not listen to Firestore wishes:", err);
      demoMessages.forEach(renderGuestbookMessage);
      updateWishesCount();
    }
  } else {
    // Load demo messages if Firebase is not configured yet
    demoMessages.forEach(renderGuestbookMessage);
    updateWishesCount();
  }

  // Emoji picker for Wish Only form
  let selectedEmoji = "❤️";
  document.querySelectorAll(".gb-emoji-picker .emoji-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gb-emoji-picker .emoji-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      selectedEmoji = btn.dataset.emoji;
      const gbInput = document.getElementById("gbEmoji");
      if (gbInput) gbInput.value = selectedEmoji;
    });
  });

  // Form submit
  document.getElementById("guestbookForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;
    const nameEl = document.getElementById("gbName");
    const msgEl = document.getElementById("gbMessage");

    document.getElementById("gbNameError").textContent = "";
    document.getElementById("gbMessageError").textContent = "";

    if (!nameEl.value.trim()) {
      document.getElementById("gbNameError").textContent = "Oops 😭 we need your name.";
      nameEl.classList.add("error");
      valid = false;
    } else { nameEl.classList.remove("error"); }

    if (!msgEl.value.trim()) {
      document.getElementById("gbMessageError").textContent = "Leave us a message! Don't be shy. 🙏";
      msgEl.classList.add("error");
      valid = false;
    } else { msgEl.classList.remove("error"); }

    if (!valid) return;

    const entry = {
      name: nameEl.value.trim(),
      emoji: selectedEmoji,
      text: msgEl.value.trim(),
      timestamp: new Date().toISOString(),
    };

    const submitBtn = document.getElementById("gbSubmitBtn") || e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting... 💌";

    try {
      await submitGuestbookEntry(entry);
      renderGuestbookMessage(entry);
      updateWishesCount();
      e.target.reset();
      selectedEmoji = "❤️";
      document.querySelectorAll(".gb-emoji-picker .emoji-btn").forEach((b, i) => {
        b.classList.toggle("active", i === 0);
        b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      });
      const gbInput = document.getElementById("gbEmoji");
      if (gbInput) gbInput.value = "❤️";
      launchConfetti();
      showToast("Wish posted to the wall! 💌");

      // Scroll gently to see the wish
      setTimeout(() => {
        document.getElementById("wishesWall")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch {
      showToast("Something went wrong. Try again! 😅");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "POST MY WISH 💌";
    }
  });
}

/* ============================================================
   MUSIC PLAYER
   ============================================================ */
function initMusic() {
  const btn = document.getElementById("musicBtn");
  const audio = document.getElementById("weddingAudio");
  if (!btn || !audio) return;

  // Hide button if no music URL configured
  if (!weddingConfig.musicUrl) {
    btn.style.display = "none";
    return;
  }

  let playing = false;

  btn.addEventListener("click", async () => {
    try {
      if (playing) {
        audio.pause();
        playing = false;
        btn.classList.remove("playing");
        btn.querySelector(".music-label").textContent = "PLAY OUR SONG";
      } else {
        await audio.play();
        playing = true;
        btn.classList.add("playing");
        btn.querySelector(".music-label").textContent = "NOW PLAYING ♪";
      }
    } catch (err) {
      console.warn("Music playback error:", err);
      showToast("Couldn't play audio 😅 Try again.");
    }
  });
}

/* ============================================================
   FLOATING HEARTS CANVAS
   ============================================================ */
let heartClickCount = 0;
let heartsActive = false;

class Heart {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = 12 + Math.random() * 24;
    this.speedY = 1.5 + Math.random() * 2;
    this.speedX = (Math.random() - 0.5) * 1.5;
    this.opacity = 0.7 + Math.random() * 0.3;
    this.sway = Math.random() * Math.PI * 2;
  }

  update() {
    this.y -= this.speedY;
    this.x += Math.sin(this.sway) * 0.8;
    this.sway += 0.04;
    this.opacity -= 0.005;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.font = `${this.size}px serif`;
    ctx.fillText("♥", this.x, this.y);
    ctx.restore();
  }

  isDead() { return this.opacity <= 0 || this.y < -this.size; }
}

function initFloatingHearts() {
  const canvas = document.getElementById("heartsCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let hearts = [];
  let animId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function startHearts() {
    if (heartsActive) return;
    heartsActive = true;
    canvas.classList.add("active");

    const spawnInterval = setInterval(() => {
      hearts.push(new Heart(canvas));
      if (!heartsActive) clearInterval(spawnInterval);
    }, 80);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#E8533A";
      hearts = hearts.filter(h => !h.isDead());
      hearts.forEach(h => { h.update(); h.draw(ctx); });
      animId = requestAnimationFrame(loop);
    }
    loop();

    setTimeout(() => {
      heartsActive = false;
      canvas.classList.remove("active");
      cancelAnimationFrame(animId);
      hearts = [];
    }, 4000);
  }

  // Multiple targets that trigger hearts
  const triggers = [
    document.getElementById("heartLogo"),
    document.getElementById("heartClickTarget"),
  ];

  triggers.forEach(el => {
    el?.addEventListener("click", () => {
      heartClickCount++;
      if (heartClickCount >= 3 || el.id === "heartClickTarget") {
        startHearts();
        heartClickCount = 0;
      }
    });
  });

  // Double-tap on gallery items also triggers hearts
  let lastTap = 0;
  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {
      const now = Date.now();
      if (now - lastTap < 300) startHearts();
      lastTap = now;
    });
    // Desktop: double-click
    item.addEventListener("dblclick", startHearts);
  });
}

/* ============================================================
   EASTER EGGS
   ============================================================ */
function initEasterEggs() {
  // ── Secret sticker ──
  let stickerClicks = 0;
  document.getElementById("secretSticker")?.addEventListener("click", () => {
    stickerClicks++;
    if (stickerClicks >= 3) {
      showEasterEgg("easterEggOverlay");
      stickerClicks = 0;
    }
  });

  // ── DO NOT CLICK button ──
  document.getElementById("dneBtn")?.addEventListener("click", () => {
    showEasterEgg("dneOverlay");
  });

  // ── Close overlays ──
  document.getElementById("closeEasterEgg")?.addEventListener("click", () => {
    hideEasterEgg("easterEggOverlay");
  });
  document.getElementById("closeDne")?.addEventListener("click", () => {
    hideEasterEgg("dneOverlay");
  });

  // Close on backdrop click
  document.querySelectorAll(".easter-egg-overlay").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target === el) hideEasterEgg(el.id);
    });
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".easter-egg-overlay.show").forEach(el => {
        hideEasterEgg(el.id);
      });
    }
  });

  // ── Konami code ──
  const konamiCode = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let konamiIdx = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === konamiCode[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiCode.length) {
        konamiIdx = 0;
        showToast("🕹️ Konami code! You absolute legend.");
        setTimeout(() => {
          const canvas = document.getElementById("heartsCanvas");
          if (canvas) {
            heartClickCount = 99;
            document.getElementById("heartLogo")?.click();
          }
        }, 500);
      }
    } else { konamiIdx = 0; }
  });
}

function showEasterEgg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("show");
  el.removeAttribute("aria-hidden");
  el.querySelector("button, a")?.focus();
}

function hideEasterEgg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
let toastTimer;
function showToast(msg, duration = 2800) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add("show");
  toast.removeAttribute("aria-hidden");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, duration);
}

/* ============================================================
   GALLERY: Subtle random rotations
   ============================================================ */
function initGallery() {
  document.querySelectorAll(".gallery-item").forEach(item => {
    const deg = (Math.random() - 0.5) * 2.5;
    item.style.setProperty("--gallery-rot", `${deg}deg`);
  });
}

/* ============================================================
   RSVP FROM HOOK AUTO-SCROLL
   ============================================================ */
function initHeroRsvp() {
  // Pre-select "YES" if user comes from the Yes button in hook
  // (handled in initRsvpHook via scroll)
}

/* ============================================================
   UTILITY
   ============================================================ */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").replace("#", "");
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const offset = 80; // nav height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ============================================================
   INIT — Run everything
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initConfig();
  initCountdown();
  initNav();
  initCursor();
  initReveal();
  initRsvpHook();
  initRsvpWishesTabs();
  initRsvpForm();
  initFaq();
  initGuestbook();
  initMusic();
  initFloatingHearts();
  initEasterEggs();
  initGallery();
  initSmoothScroll();

  // Trigger initial reveal for above-fold elements
  setTimeout(() => {
    document.querySelectorAll(".hero .reveal-up").forEach((el, i) => {
      setTimeout(() => el.classList.add("revealed"), i * 100);
    });
  }, 100);
});

/**
 * Wedding RSVP — script.js
 * Muhammad Atif & Ismasari
 * ============================================================
 * CONFIGURATION — Edit everything here!
 * ============================================================
 */
