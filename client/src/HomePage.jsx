// HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function HomePage() {
  const [content, setContent] = useState({
    title: "The title!",
    subtitle: "Some text describing the site or event.",
    intro:
      "Welkom bij onze bijzondere locatie waar verhalen tot leven komen...",
    sections: [
      {
        img: "https://tse1.mm.bing.net/th/id/OIP.cOuSJr_evsOMEOEiOJQgkwHaDU?rs=1&pid=ImgDetMain&o=7&rm=3",
        text: "Beschrijving van de eerste sectie.",
        link: "/verhaal",
        linkText: "Ontdek meer",
      },
      {
        img: "https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp",
        text: "Beschrijving van de tweede sectie.",
        link: "/boeken",
        linkText: "Tickets kopen",
      },
    ],
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [originalContent, setOriginalContent] = useState(content);

  // 📥 Ophalen opgeslagen content
  useEffect(() => {
    fetch(`${API_URL}/api/content/home`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          setContent(data.content);
          setOriginalContent(data.content); // bewaar originele content
        }
      })
      .catch((err) => console.error("Fout bij laden content:", err));
  }, []);

  // 📥 Controleren of gebruiker admin is
  useEffect(() => {
    fetch(`${API_URL}/api/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === "admin") setIsAdmin(true);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoadingAdmin(false));
  }, []);

  // 📤 Opslaan wijzigingen
  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/content/home`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Onbekende fout");
      }

      alert("Wijzigingen opgeslagen!");
      setEditing(false);
      setOriginalContent(content); // update originele content
    } catch (err) {
      console.error("Opslaan mislukt:", err);
      alert("Opslaan mislukt: " + err.message);
    }
    setSaving(false);
  }

  const startEditing = () => setEditing(true);

  const cancelEditing = () => {
    setContent(originalContent); // terug naar originele content
    setEditing(false);
  };

  const updateSection = (index, key, value) => {
    const newSections = [...content.sections];
    newSections[index][key] = value;
    setContent({ ...content, sections: newSections });
  };

  return (
    <div className="font-sans text-gray-800 relative">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-sm border-b z-30 relative">
        <div className="text-2xl font-bold">Bunker Museum</div>
        <ul className="flex space-x-8 text-gray-700 font-medium">
          <li><Link to="/">home</Link></li>
          <li><Link to="/verhaal">verhaal</Link></li>
          <li><Link to="/boeken">boeken</Link></li>
          <li><Link to="/contact">contact</Link></li>
        </ul>
      </nav>

      {/* Admin bewerk knop boven hero */}
      {!loadingAdmin && isAdmin && !editing && (
        <button
          onClick={startEditing}
          className="absolute right-10 top-[120px] z-20 px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600"
        >
          Pagina bewerken
        </button>
      )}

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-cover bg-center"
        style={{ backgroundImage: `url('${content.sections[1].img}')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-white max-w-2xl">
          {editing ? (
            <>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="text-5xl font-bold mb-4 text-center w-full bg-transparent border-b border-white focus:outline-none"
              />
              <textarea
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                className="text-lg mb-6 w-full bg-transparent border border-white/40 p-2 rounded"
              />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4">{content.title}</h1>
              <p className="text-lg mb-6">{content.subtitle}</p>
            </>
          )}
          <Link
            to="/boeken"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Boek nu
          </Link>
        </div>
      </section>

      {/* Intro & Sections */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        {editing ? (
          <textarea
            value={content.intro}
            onChange={(e) => setContent({ ...content, intro: e.target.value })}
            className="w-full p-4 border rounded mb-12"
            rows="5"
          />
        ) : (
          <p className="mb-12 text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {content.intro}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {content.sections.map((sec, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              {editing ? (
                <>
                  <input
                    type="text"
                    value={sec.img}
                    onChange={(e) => updateSection(i, "img", e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Afbeelding URL"
                  />
                  <img
                    src={sec.img}
                    alt=""
                    className="w-full h-56 object-cover mb-4 rounded"
                  />
                  <textarea
                    value={sec.text}
                    onChange={(e) => updateSection(i, "text", e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                    rows="3"
                  />
                  <input
                    type="text"
                    value={sec.linkText}
                    onChange={(e) => updateSection(i, "linkText", e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Link tekst"
                  />
                  <input
                    type="text"
                    value={sec.link}
                    onChange={(e) => updateSection(i, "link", e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Link URL"
                  />
                </>
              ) : (
                <>
                  <img
                    src={sec.img}
                    alt=""
                    className="w-full h-56 object-cover mb-4 rounded"
                  />
                  <p className="text-gray-600 mb-6">{sec.text}</p>
                  <Link
                    to={sec.link}
                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {sec.linkText}
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Admin buttons tijdens editing */}
      {!loadingAdmin && isAdmin && editing && (
        <div className="fixed bottom-5 right-5 flex gap-3">
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
        <p className="text-sm">
          © {new Date().getFullYear()} Bunkermuseum Terschelling.
        </p>
      </footer>
    </div>
  );
}
