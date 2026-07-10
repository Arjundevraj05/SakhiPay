import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe, ChevronDown, Loader2 } from "lucide-react";
import {
  applyGoogleTranslate,
  getActiveLanguage,
  hideGoogleTranslateUI,
  waitForTranslationComplete,
} from "../utils/googleTranslate";
import "../styles/LanguageSelector.css";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "ml", label: "Malayalam" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
];

function triggerSelectChange(select) {
  if (!select) return false;

  select.dispatchEvent(new Event("change", { bubbles: true }));

  if (document.createEvent) {
    const event = document.createEvent("HTMLEvents");
    event.initEvent("change", true, true);
    select.dispatchEvent(event);
  }

  return true;
}

function getTranslateSelect() {
  return document.querySelector("select.goog-te-combo");
}

const LanguageSelector = ({ variant = "navbar" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Translating…");
  const containerRef = useRef(null);

  useEffect(() => {
    setActiveLang(getActiveLanguage());
    hideGoogleTranslateUI();

    const observer = new MutationObserver(() => {
      hideGoogleTranslateUI();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyLanguage = async (langCode) => {
    const label = LANGUAGES.find((lang) => lang.code === langCode)?.label || "language";
    setLoadingLabel(langCode === "en" ? "Switching to English…" : `Translating to ${label}…`);
    setIsTranslating(true);
    hideGoogleTranslateUI();

    const tryCombo = () => {
      const select = getTranslateSelect();
      if (!select) return false;

      const value = langCode === "en" ? "" : langCode;
      const hasOption = Array.from(select.options).some((opt) => opt.value === value);
      if (!hasOption && langCode !== "en") return false;

      select.value = value;
      triggerSelectChange(select);
      applyGoogleTranslate(langCode, { reload: false });
      return true;
    };

    if (!tryCombo()) {
      let attempts = 0;
      await new Promise((resolve) => {
        const retry = setInterval(() => {
          attempts += 1;
          if (tryCombo() || attempts >= 15) {
            clearInterval(retry);
            if (attempts >= 15) {
              applyGoogleTranslate(langCode, { reload: true });
            }
            resolve();
          }
        }, 200);
      });
    }

    await waitForTranslationComplete(langCode);
    hideGoogleTranslateUI();
    setActiveLang(langCode);
    setIsTranslating(false);
  };

  const changeLanguage = (langCode) => {
    setShowDropdown(false);
    if (langCode === activeLang || isTranslating) return;
    applyLanguage(langCode);
  };

  const activeLabel =
    LANGUAGES.find((lang) => lang.code === activeLang)?.label || "Language";

  return (
    <>
      {isTranslating &&
        createPortal(
          <div className="translate-loading-overlay" role="status" aria-live="polite">
            <Loader2 className="translate-loading-spinner" size={36} />
            <p className="translate-loading-text">{loadingLabel}</p>
          </div>,
          document.body
        )}

      <div
        ref={containerRef}
        className={`language-container ${variant === "navbar" ? "navbar-lang" : "insight-lang"}`}
      >
        <button
          type="button"
          className="language-button"
          onClick={() => setShowDropdown((open) => !open)}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          disabled={isTranslating}
        >
          <Globe size={18} className="icon" />
          {activeLang === "en" ? "Language" : activeLabel}
          <ChevronDown size={16} className={`icon chevron ${showDropdown ? "open" : ""}`} />
        </button>

        {showDropdown && (
          <div className="language-dropdown" role="listbox">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                className={`lang-option ${activeLang === code ? "active" : ""}`}
                onClick={() => changeLanguage(code)}
                disabled={isTranslating}
              >
                {label}
                {activeLang === code ? " ✓" : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageSelector;
