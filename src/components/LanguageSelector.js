import React, { useEffect, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import "../styles/LanguageSelector.css";

const LanguageSelector = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation(); // Get current route

  useEffect(() => {
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Function to initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "ta,ml,hi,te",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );

        // Hide Google's default UI
        setTimeout(() => {
          document.querySelector(".goog-te-gadget")?.remove();
        }, 1000);
      }
    };

    // Wait for Google Translate to load
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.translate) {
        clearInterval(checkGoogle);
        window.googleTranslateElementInit();
      }
    }, 500);

    return () => clearInterval(checkGoogle);
  }, []);

  // Function to change language
  const changeLanguage = (langCode) => {
    const selectElement = document.querySelector(".goog-te-combo");
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event("change"));
    } else {
      console.error("Google Translate dropdown not found!");
    }
  };

  return (
    <div className={`language-container ${location.pathname === "/" ? "navbar-lang" : "insight-lang"}`}>
      <button className="language-button" onClick={() => setShowDropdown(!showDropdown)}>
        <Globe size={20} className="icon" />
        Language
        <ChevronDown size={18} className="icon" />
      </button>

      {showDropdown && (
        <div className="language-dropdown">
          <button className="lang-option" onClick={() => changeLanguage("ta")}>
            🇮🇳 Tamil
          </button>
          <button className="lang-option" onClick={() => changeLanguage("ml")}>
            🇮🇳 Malayalam
          </button>
          <button className="lang-option" onClick={() => changeLanguage("hi")}>
            🇮🇳 Hindi
          </button>
          <button className="lang-option" onClick={() => changeLanguage("te")}>
            🇮🇳 Telugu
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
