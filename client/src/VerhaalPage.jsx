// VerhaalPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function VerhaalPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [editableContent, setEditableContent] = useState({
    heroBg:
      "https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp",
    headerTitle: "The title!",
    headerText: "Some text describing the site or event.",
    buttonText: "Button",
    paragraphs: [
      "In het hart van onze organisatie schuilt een verhaal dat verder gaat dan boeken en woorden...",
      "Door de jaren heen groeide dit initiatief uit tot een plek waar cultuur, creativiteit en geschiedenis samenkomen.",
      "We nodigen je uit om zelf te ontdekken hoe onze collectie tot leven komt."
    ],
    images: [
      { src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80", caption: "De eerste editie" },
      { src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80", caption: "Een kijkje achter de schermen" },
      { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", caption: "De makers aan het werk" },
      { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80", caption: "Het verhaal leeft voort" }
    ]
  });

  const [draftContent, setDraftContent] = useState(editableContent);

  // Check admin
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/me", { method: "GET", credentials: "include" })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, []);

  // Load persisted content
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/settings/verhaalPage", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.value) {
          setEditableContent(data.value);
          setDraftContent(data.value);
        }
      })
      .catch(err => console.error("Kon content niet ophalen:", err));
  }, []);

  const startEditing = () => {
    const draftCopy = {
      ...editableContent,
      paragraphs: [...editableContent.paragraphs],
      images: editableContent.images.map(img => ({ ...img }))
    };
    setDraftContent(draftCopy);
    setIsEditing(true);
  };

  const saveChanges = async () => {
    try {
      await fetch("http://127.0.0.1:5000/api/settings/verhaalPage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: draftContent })
      });
      setEditableContent(draftContent);
      alert("Wijzigingen opgeslagen!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Fout bij opslaan wijzigingen");
    }
  };

  const cancelChanges = () => {
    setDraftContent(editableContent);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include"
      });
    } finally {
      navigate("/adminlogin");
    }
  };

  const contentToShow = isEditing ? draftContent : editableContent;

  return (
    <div className="font-sans text-gray-800">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 bg-gray-500 bg-opacity-95 backdrop-blur-md shadow-md space-y-2 sm:space-y-0">
        <div className="text-xl sm:text-2xl font-bold text-white">Bunker Museum</div>

        <ul className="flex flex-wrap justify-center gap-3 sm:space-x-6 text-gray-200 font-medium text-sm sm:text-base">
          <li><Link to="/" className="hover:text-blue-300">home</Link></li>
          <li><Link to="/verhaal" className="hover:text-blue-300 font-semibold">verhaal</Link></li>
          <li><Link to="/boeken" className="hover:text-blue-300">boeken</Link></li>
          <li><Link to="/contact" className="hover:text-blue-300">contact</Link></li>
        </ul>

        {/* Admin Dropdown */}
        {isAdmin && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              title="Account menu"
            >
              <i className="fa-solid fa-circle-user text-xl" aria-hidden="true"></i>
              <span className="sr-only">Open account menu</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
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

      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-cover bg-center"
        style={{ backgroundImage: `url('${contentToShow.heroBg}')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Pagina bewerken knop bovenop hero */}
        {isAdmin && !isEditing && (
          <button
            onClick={startEditing}
            className="absolute right-10 top-[80px] z-20 px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600"
          >
            Pagina bewerken
          </button>
        )}

        <div className="relative z-10 text-white max-w-2xl">
          {isEditing ? (
            <>
              <input
                type="text"
                value={contentToShow.heroBg}
                onChange={e => setDraftContent({ ...draftContent, heroBg: e.target.value })}
                placeholder="Hero achtergrond URL"
                className="w-full mb-4 p-1 text-black rounded border"
              />
              <textarea
                value={contentToShow.headerTitle}
                onChange={e => setDraftContent({ ...draftContent, headerTitle: e.target.value })}
                className="w-full mb-2 text-4xl font-bold p-2 rounded text-black"
              />
              <textarea
                value={contentToShow.headerText}
                onChange={e => setDraftContent({ ...draftContent, headerText: e.target.value })}
                className="w-full mb-4 p-2 rounded text-black"
              />
              <textarea
                value={contentToShow.buttonText}
                onChange={e => setDraftContent({ ...draftContent, buttonText: e.target.value })}
                className="w-full mb-2 p-2 rounded text-black"
              />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{contentToShow.headerTitle}</h1>
              <p className="text-lg mb-6 drop-shadow-md">{contentToShow.headerText}</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{contentToShow.buttonText}</button>
            </>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-16 space-y-6 text-gray-700 leading-relaxed">
          {contentToShow.paragraphs.map((p, i) =>
            isEditing ? (
              <textarea
                key={i}
                value={p}
                onChange={e => {
                  const newParagraphs = [...draftContent.paragraphs];
                  newParagraphs[i] = e.target.value;
                  setDraftContent({ ...draftContent, paragraphs: newParagraphs });
                }}
                className="w-full p-2 border rounded mb-2 text-black"
                rows={3}
              />
            ) : (
              <p key={i}>{p}</p>
            )
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {contentToShow.images.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {isEditing && (
                <input
                  type="text"
                  value={item.src}
                  onChange={e => {
                    const newImages = [...draftContent.images];
                    newImages[i].src = e.target.value;
                    setDraftContent({ ...draftContent, images: newImages });
                  }}
                  className="w-full border p-1 rounded mb-2"
                  placeholder="Afbeelding URL"
                />
              )}
              <img src={item.src} alt={item.caption} className="w-full h-48 object-cover rounded mb-3" />
              {isEditing ? (
                <input
                  type="text"
                  value={item.caption}
                  onChange={e => {
                    const newImages = [...draftContent.images];
                    newImages[i].caption = e.target.value;
                    setDraftContent({ ...draftContent, images: newImages });
                  }}
                  className="w-full border p-1 rounded mb-2 text-center"
                />
              ) : (
                <p className="text-sm text-gray-700">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Admin buttons tijdens editing */}
      {isAdmin && isEditing && (
        <div className="fixed bottom-5 right-5 flex gap-3 z-50">
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Wijzigingen opslaan
          </button>
          <button
            onClick={cancelChanges}
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
