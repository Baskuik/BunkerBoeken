import React, { useState, useEffect } from "react";

export default function VerhaalPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState({
    heroBg:
      "https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp",
    headerTitle: "The title!",
    headerText: "Some text describing the site or event.",
    buttonText: "Button",
    paragraphs: [
      "In het hart van onze organisatie schuilt een verhaal dat verder gaat dan boeken en woorden. Het begon allemaal met een kleine groep gepassioneerde mensen die geloofden in de kracht van verhalen om mensen te verbinden, te inspireren en te veranderen.",
      "Door de jaren heen groeide dit initiatief uit tot een plek waar cultuur, creativiteit en geschiedenis samenkomen. Bezoekers worden uitgenodigd om niet alleen te lezen, maar te beleven — elke kamer, elk boek, elk detail vertelt een stukje van het grotere geheel.",
      "We nodigen je uit om zelf te ontdekken hoe onze collectie tot leven komt. Neem de tijd om rond te kijken, stil te staan bij de woorden, en de verhalen een eigen betekenis te geven."
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
        caption: "De eerste editie"
      },
      {
        src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
        caption: "Een kijkje achter de schermen"
      },
      {
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
        caption: "De makers aan het werk"
      },
      {
        src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
        caption: "Het verhaal leeft voort"
      }
    ]
  });

  const [originalContent, setOriginalContent] = useState(editableContent);

  // Check admin
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/me", {
      method: "GET",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, []);

  // Ophalen content van server voor persistency
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/settings/verhaalPage", {
      method: "GET",
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error("Kon content niet ophalen");
        return res.json();
      })
      .then(data => {
        if (data?.value) {
          setEditableContent(data.value);
          setOriginalContent(data.value);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const toggleEditing = () => setIsEditing(true);

  const saveChanges = async () => {
    try {
      await fetch("http://127.0.0.1:5000/api/settings/verhaalPage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ value: editableContent })
      });
      setOriginalContent(editableContent);
      alert("Wijzigingen opgeslagen!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Fout bij opslaan wijzigingen");
    }
  };

  const cancelChanges = () => {
    setEditableContent(originalContent);
    setIsEditing(false);
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-sm border-b">
        <div className="text-2xl font-bold">Bunker Museum</div>
        <ul className="flex space-x-8 text-gray-700 font-medium">
          <li><a href="/HomePage" className="hover:text-blue-600">home</a></li>
          <li><a href="/VerhaalPage" className="hover:text-blue-600">verhaal</a></li>
          <li><a href="/ContactPage" className="text-blue-600 font-semibold">contact</a></li>
        </ul>
      </nav>

      {/* Admin buttons */}
      {isAdmin && (
        <div className="flex justify-end max-w-5xl mx-auto px-4 py-4 space-x-2">
          {!isEditing ? (
            <button
              onClick={toggleEditing}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Pagina bewerken
            </button>
          ) : (
            <>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Wijzigingen opslaan
              </button>
              <button
                onClick={cancelChanges}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Annuleren
              </button>
            </>
          )}
        </div>
      )}

      {/* Header section */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-cover bg-center"
        style={{ backgroundImage: `url('${editableContent.heroBg}')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-white max-w-2xl">
          {isEditing && (
            <input
              type="text"
              value={editableContent.heroBg}
              onChange={e => setEditableContent({ ...editableContent, heroBg: e.target.value })}
              placeholder="Hero achtergrond URL"
              className="w-full mb-4 p-1 text-black rounded border"
            />
          )}
          {isEditing ? (
            <>
              <textarea
                value={editableContent.headerTitle}
                onChange={e => setEditableContent({ ...editableContent, headerTitle: e.target.value })}
                className="w-full mb-2 text-4xl font-bold p-2 rounded text-black"
              />
              <textarea
                value={editableContent.headerText}
                onChange={e => setEditableContent({ ...editableContent, headerText: e.target.value })}
                className="w-full mb-4 p-2 rounded text-black"
              />
              <textarea
                value={editableContent.buttonText}
                onChange={e => setEditableContent({ ...editableContent, buttonText: e.target.value })}
                className="w-full mb-2 p-2 rounded text-black"
              />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{editableContent.headerTitle}</h1>
              <p className="text-lg mb-6 drop-shadow-md">{editableContent.headerText}</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editableContent.buttonText}</button>
            </>
          )}
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Paragraphs */}
        <div className="mb-16 space-y-6 text-gray-700 leading-relaxed">
          {editableContent.paragraphs.map((p, i) => (
            isEditing ? (
              <textarea
                key={i}
                value={p}
                onChange={e => {
                  const newParagraphs = [...editableContent.paragraphs];
                  newParagraphs[i] = e.target.value;
                  setEditableContent({ ...editableContent, paragraphs: newParagraphs });
                }}
                className="w-full p-2 border rounded mb-2 text-black"
                rows={3}
              />
            ) : (
              <p key={i}>{p}</p>
            )
          ))}
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {editableContent.images.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {isEditing && (
                <input
                  type="text"
                  value={item.src}
                  onChange={e => {
                    const newImages = [...editableContent.images];
                    newImages[i].src = e.target.value;
                    setEditableContent({ ...editableContent, images: newImages });
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
                    const newImages = [...editableContent.images];
                    newImages[i].caption = e.target.value;
                    setEditableContent({ ...editableContent, images: newImages });
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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center border-t border-gray-700">
        <p className="text-sm">© {new Date().getFullYear()} Bunkermuseum Terschelling.</p>
      </footer>
    </div>
  );
}
