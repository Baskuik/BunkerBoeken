// HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function HomePage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [content, setContent] = useState({
    title: "The title!",
    subtitle: "Some text describing the site or event.",
    intro: "Welkom bij onze bijzondere locatie waar verhalen tot leven komen...",
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [originalContent, setOriginalContent] = useState(content);

  // 📥 Ophalen opgeslagen content
  useEffect(() => {
    fetch(`${API_URL}/api/content/home`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) {
          setContent(data.content);
          setOriginalContent(data.content);
        }
      })
      .catch((err) => console.error("Fout bij laden content:", err));
  }, []);

  // 📥 Controleren of gebruiker admin is
  useEffect(() => {
    fetch(`${API_URL}/api/admin/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setIsAdmin(true))
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
      setOriginalContent(content);
    } catch (err) {
      console.error("Opslaan mislukt:", err);
      alert("Opslaan mislukt: " + err.message);
    }
    setSaving(false);
  }

  const startEditing = () => setEditing(true);

  const cancelEditing = () => {
    setContent(originalContent);
    setEditing(false);
  };

  const updateSection = (index, key, value) => {
    const newSections = [...content.sections];
    newSections[index][key] = value;
    setContent({ ...content, sections: newSections });
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, { method: "POST", credentials: "include" });
    } catch (e) {}
    navigate("/adminlogin");
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
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Bunker Rondleiding</h1>
          <p className="text-lg mb-6 drop-shadow-md">
            De site om bunkers te boeken
          </p>
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
          {/* Box 1 */}
          <div className="bg-grey rounded-lg shadow-md p-6 flex flex-col items-center">
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.cOuSJr_evsOMEOEiOJQgkwHaDU?rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Eerste sectie"
              className="w-full h-56 object-cover mb-4 rounded"
            />
            <p className="text-gray-600 mb-6">
              Beschrijving van de eerste sectie. Korte tekst over wat dit
              inhoudt.
            </p>
            <Link
              to="/verhaal"
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ontdek meer
            </Link>
          </div>

          {/* Box 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
            <img
              src="https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp"
              alt="Tweede sectie"
              className="w-full h-56 object-cover mb-4 rounded"
            />
            <p className="text-gray-600 mb-6">
              Beschrijving van de tweede sectie. Wat meer info of context.
            </p>
            <Link
              to="/boeken"
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tickets kopen
            </Link>
          </div>
        </div>

        {/* Bottom image grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              src: "https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp",
              caption: "Korte beschrijving 1",
            },
            {
              src: "https://www.bunkermuseumterschelling.nl/wp-content/uploads/2025/05/background.jpg",
              caption: "Bunkermuseum: buitenkant",
            },
            {
              src: "https://tse1.mm.bing.net/th/id/OIP.dZTu0UUBa0fGWKPHbwKHqgHaDV?rs=1&pid=ImgDetMain&o=7&rm=3",
              caption: "Bunkermuseum: interieur expositie",
            },
            {
              src: "https://1.bp.blogspot.com/-jwvVxxaMYOY/XwpFCR_xZGI/AAAAAAAABb0/IJvRbGr9b-A2mejqfiAZi4uxudbZpC7rACNcBGAsYHQ/w1200-h630-p-k-no-nu/20180701_140510.jpg",
              caption: "Bunkermuseum: historische artefacten",
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <img
                src={item.src}
                alt={item.caption}
                className="w-full h-56 object-cover mb-4 rounded"
              />
              <p className="text-sm text-gray-700">{item.caption}</p>
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
