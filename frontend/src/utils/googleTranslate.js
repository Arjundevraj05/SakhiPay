const PAGE_LANGUAGE = "en";
const STORAGE_KEY = "sakhipay_lang";

const GOOGLE_UI_SELECTORS = [
  ".goog-te-banner-frame",
  ".goog-te-menu-frame",
  ".goog-te-ftab",
  "#goog-gt-tt",
  ".goog-te-balloon-frame",
  ".goog-tooltip",
  ".goog-logo-link",
  "iframe.goog-te-banner-frame",
  "body > iframe.skiptranslate",
  "body > .skiptranslate",
].join(", ");

export function hideGoogleTranslateUI() {
  document.querySelectorAll(GOOGLE_UI_SELECTORS).forEach((element) => {
    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("height", "0", "important");
    element.style.setProperty("max-height", "0", "important");
    element.style.setProperty("overflow", "hidden", "important");
  });

  document.documentElement.style.marginTop = "0px";
  document.body.style.top = "0px";
  document.body.style.marginTop = "0px";
  document.body.style.paddingTop = "0px";
  document.body.style.position = "static";
}

export function isPageTranslated() {
  return (
    document.body.classList.contains("translated-ltr") ||
    document.body.classList.contains("translated-rtl")
  );
}

export function waitForTranslationComplete(langCode, timeoutMs = 10000) {
  const wantsEnglish = !langCode || langCode === PAGE_LANGUAGE;

  return new Promise((resolve) => {
    const started = Date.now();

    const check = () => {
      hideGoogleTranslateUI();

      const translated = isPageTranslated();
      const ready = wantsEnglish ? !translated : translated;

      if (ready || Date.now() - started >= timeoutMs) {
        hideGoogleTranslateUI();
        resolve();
        return;
      }

      window.setTimeout(check, 150);
    };

    check();
  });
}

export function getActiveLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("googtrans="));

  if (!cookie) return PAGE_LANGUAGE;

  const value = decodeURIComponent(cookie.split("=")[1] || "");
  const parts = value.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[1] !== PAGE_LANGUAGE) return parts[1];
  return PAGE_LANGUAGE;
}

export function clearTranslateCookies() {
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; expires=${expires}; path=/`;

  const host = window.location.hostname;
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    document.cookie = `googtrans=; expires=${expires}; path=/; domain=${host}`;
    document.cookie = `googtrans=; expires=${expires}; path=/; domain=.${host}`;
  }
}

export function setTranslateCookie(langCode) {
  if (!langCode || langCode === PAGE_LANGUAGE) {
    clearTranslateCookies();
    return;
  }

  const cookieValue = `/${PAGE_LANGUAGE}/${langCode}`;
  document.cookie = `googtrans=${cookieValue}; path=/`;
}

export function applyGoogleTranslate(langCode, { reload = true } = {}) {
  const base = window.location.pathname + window.location.search;

  if (!langCode || langCode === PAGE_LANGUAGE) {
    clearTranslateCookies();
    localStorage.setItem(STORAGE_KEY, PAGE_LANGUAGE);
    if (reload) {
      window.scrollTo(0, 0);
      window.location.replace(base);
    }
    return;
  }

  setTranslateCookie(langCode);
  localStorage.setItem(STORAGE_KEY, langCode);

  if (reload) {
    window.scrollTo(0, 0);
    window.location.replace(base);
  }
}

if (typeof window !== "undefined") {
  window.hideGoogleTranslateUI = hideGoogleTranslateUI;
}
