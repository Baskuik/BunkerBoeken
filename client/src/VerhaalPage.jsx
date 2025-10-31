export default function VerhaalPage() {
  return (
    <div className="font-sans text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-sm border-b">
        <div className="text-2xl font-bold">name</div>
        <ul className="flex space-x-8 text-gray-700 font-medium">
         <li><a href="/HomePage" className="hover:text-blue-600">home</a></li>
          <li><a href="/VerhaalPage" className="hover:text-blue-600">verhaal</a></li>
          <li><a href="/ContactPage" className="text-blue-600 font-semibold">contact</a></li>
        </ul>
      </nav>

      {/* Header section */}
<section
  className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp')",
  }}
>
  {/* Donkere overlay voor betere leesbaarheid */}
  <div className="absolute inset-0 bg-black bg-opacity-40"></div>

  {/* Tekst boven de afbeelding */}
  <div className="relative z-10 text-white max-w-2xl">
    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">The title!</h1>
    <p className="text-lg mb-6 drop-shadow-md">
      Some text describing the site or event.
    </p>
    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Button
    </button>
  </div>
</section>

      {/* Main content */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Verhaal tekst */}
        <div className="mb-16 space-y-6 text-gray-700 leading-relaxed">
          <p>
            In het hart van onze organisatie schuilt een verhaal dat verder gaat dan boeken en woorden.
            Het begon allemaal met een kleine groep gepassioneerde mensen die geloofden in de kracht van verhalen
            om mensen te verbinden, te inspireren en te veranderen.
          </p>
          <p>
            Door de jaren heen groeide dit initiatief uit tot een plek waar cultuur, creativiteit en geschiedenis
            samenkomen. Bezoekers worden uitgenodigd om niet alleen te lezen, maar te beleven — elke kamer, elk boek,
            elk detail vertelt een stukje van het grotere geheel.
          </p>
          <p>
            We nodigen je uit om zelf te ontdekken hoe onze collectie tot leven komt. Neem de tijd om rond te kijken,
            stil te staan bij de woorden, en de verhalen een eigen betekenis te geven.
          </p>
        </div>

        {/* Afbeeldingen rij */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            {
              src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
              caption: "De eerste editie",
            },
            {
              src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
              caption: "Een kijkje achter de schermen",
            },
            {
              src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
              caption: "De makers aan het werk",
            },
            {
              src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
              caption: "Het verhaal leeft voort",
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <img
                src={item.src}
                alt={item.caption}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <p className="text-sm text-gray-700">{item.caption}</p>
            </div>
          ))}
        </div>

        {/* Knop onderaan */}
        <div className="text-center">
          <button className="px-8 py-3 border border-gray-700 rounded hover:bg-gray-100 transition">
            More info
          </button>
        </div>
      </section>
          {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center border-t border-gray-700">
        <p className="text-sm">
          © {new Date().getFullYear()} Bunkermuseum Terschelling.
        </p>
      </footer>
    </div>
  );
}
