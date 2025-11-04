// ContactPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ContactPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [content, setContent] = useState({
    heroBg: "https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp",
    heroTitle: "The title!",
    heroText: "Some text describing the site or event.",
    heroButton: "Button",
    contactInfo: {
      title: "Neem contact op",
      description:
        "Heb je vragen, opmerkingen of wil je meer informatie? Vul het formulier in of neem direct contact met ons op via onderstaande gegevens.",
      address: "williams huis",
      phone: "+31687070287",
      email: "admin@4.nl",
    },
    formLabels: {
      name: "Naam",
      email: "E-mail",
      message: "Bericht",
      submit: "Verstuur bericht",
    },
  });

  const [originalContent, setOriginalContent] = useState(content);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Ophalen opgeslagen content
  useEffect(() => {
    fetch(`${API_URL}/api/settings/contactPage`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.value) {
          setContent(data.value);
          setOriginalContent(data.value);
        }
      })
      .catch(err => console.error("Fout bij laden content:", err));
  }, []);

  // Check admin
  useEffect(() => {
    fetch(`${API_URL}/api/admin/me`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.role === "admin") setIsAdmin(true);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoadingAdmin(false));
  }, []);

  const startEditing = () => setEditing(true);
  const cancelEditing = () => {
    setContent(originalContent);
    setEditing(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/contactPage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: content }),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      setOriginalContent(content);
      setEditing(false);
      alert("Wijzigingen opgeslagen!");
    } catch (err) {
      console.error(err);
      alert("Opslaan mislukt: " + err.message);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      navigate("/adminlogin");
    }
  };

  return (
    <div className="font-sans text-gray-800">
      
<nav className="fixed top-0 left-0 w-full z-50 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-gray-500 bg-opacity-95 backdrop-blur-md shadow-md space-y-2 sm:space-y-0">
  <div className="text-xl sm:text-2xl font-bold text-white">Bunker rondleidingen</div>
  <ul className="flex flex-wrap justify-center gap-3 sm:space-x-6 text-gray-200 font-medium text-sm sm:text-base">
    <li>
      <a href="/" className="hover:text-blue-300">home</a>
    </li>
    <li>
      <a href="/Verhaal" className="hover:text-blue-300">verhaal</a>
    </li>
    <li>
      <a href="/boeken" className="hover:text-blue-300">boeken</a>
    </li>
    <li>
      <a href="/Contact" className="hover:text-blue-300 font-semibold">contact</a>
    </li>
  </ul>

        {/* Admin dropdown */}
        {isAdmin && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Account menu"
            >
              <i className="fa-solid fa-circle-user text-xl"></i>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => { setMenuOpen(false); navigate("/account"); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
                >
                  Account
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                >
                  Terug naar dashboard
                </button>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-b-lg"
                >
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Admin "Pagina bewerken" knop onder navbar */}
      {!loadingAdmin && isAdmin && !editing && (
        <div className="flex justify-end px-10 py-4 bg-white border-b">
          <button
            onClick={startEditing}
            className="px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600"
          >
            Pagina bewerken
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-cover bg-center"
        style={{ backgroundImage: `url('${content.heroBg}')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-white max-w-2xl space-y-2">
          {editing ? (
            <>
              <input
                type="text"
                value={content.heroBg}
                onChange={(e) => setContent({ ...content, heroBg: e.target.value })}
                className="w-full mb-2 p-1 text-black rounded border"
                placeholder="Hero achtergrond URL"
              />
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                className="text-5xl font-bold mb-4 text-center w-full bg-transparent border-b border-white focus:outline-none"
              />
              <textarea
                value={content.heroText}
                onChange={(e) => setContent({ ...content, heroText: e.target.value })}
                className="text-lg mb-6 w-full bg-transparent border border-white/40 p-2 rounded"
              />
              <input
                type="text"
                value={content.heroButton}
                onChange={(e) => setContent({ ...content, heroButton: e.target.value })}
                className="px-6 py-2 bg-blue-600 text-white rounded cursor-text"
              />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4">{content.heroTitle}</h1>
              <p className="text-lg mb-6">{content.heroText}</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {content.heroButton}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Contact info & form */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          {editing ? (
            <input
              type="text"
              value={content.contactInfo.title}
              onChange={(e) =>
                setContent({ ...content, contactInfo: { ...content.contactInfo, title: e.target.value } })
              }
              className="w-full text-2xl font-semibold border p-1 rounded"
            />
          ) : (
            <h2 className="text-2xl font-semibold">{content.contactInfo.title}</h2>
          )}

          {editing ? (
            <textarea
              value={content.contactInfo.description}
              onChange={(e) =>
                setContent({ ...content, contactInfo: { ...content.contactInfo, description: e.target.value } })
              }
              className="w-full border p-1 rounded"
            />
          ) : (
            <p>{content.contactInfo.description}</p>
          )}

          {["address", "phone", "email"].map((field) => (
            <div key={field}>
              {editing ? (
                <input
                  type="text"
                  value={content.contactInfo[field]}
                  onChange={(e) =>
                    setContent({ ...content, contactInfo: { ...content.contactInfo, [field]: e.target.value } })
                  }
                  className="w-full border p-1 rounded"
                />
              ) : (
                <p>
                  <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {content.contactInfo[field]}
                </p>
              )}
            </div>
          ))}

          <div className="mt-8">
            <iframe
              title="Locatie"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.688825490655!2d4.89516831580145!3d52.37021597978798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609e30c2d6f01%3A0xa6a7f9c9384c4c!2sAmsterdam!5e0!3m2!1snl!2snl!4v1638359828123!5m2!1snl!2snl"
              width="100%"
              height="250"
              allowFullScreen
              loading="lazy"
              className="rounded border"
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {["name", "email", "message"].map((field) => (
            <div key={field}>
              {editing ? (
                <input
                  type="text"
                  value={content.formLabels[field]}
                  onChange={(e) =>
                    setContent({ ...content, formLabels: { ...content.formLabels, [field]: e.target.value } })
                  }
                  className="w-full border p-1 rounded"
                  placeholder={`Label voor ${field}`}
                />
              ) : (
                <>
                  <label className="block font-medium mb-1">{content.formLabels[field]}</label>
                  {field !== "message" ? (
                    <input
                      type={field === "email" ? "email" : "text"}
                      placeholder={content.formLabels[field]}
                      className="w-full border p-2 rounded"
                    />
                  ) : (
                    <textarea
                      rows="5"
                      placeholder={content.formLabels[field]}
                      className="w-full border p-2 rounded"
                    />
                  )}
                </>
              )}
            </div>
          ))}
          {editing ? (
            <input
              type="text"
              value={content.formLabels.submit}
              onChange={(e) =>
                setContent({ ...content, formLabels: { ...content.formLabels, submit: e.target.value } })
              }
              className="w-full border p-1 rounded mt-1"
            />
          ) : (
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {content.formLabels.submit}
            </button>
          )}
        </div>
      </section>

      {/* Admin buttons tijdens editing */}
      {!loadingAdmin && isAdmin && editing && (
        <div className="fixed bottom-5 right-5 flex gap-3 z-50">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Wijzigingen behouden"}
          </button>
          <button
            onClick={cancelEditing}
            className="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500"
          >
            Annuleren
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center border-t border-gray-700">
        <p className="text-sm">© {new Date().getFullYear()} Bunkermuseum Terschelling.</p>
      </footer>
    </div>
  );
}
