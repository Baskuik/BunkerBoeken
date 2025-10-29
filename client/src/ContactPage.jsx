export default function ContactPage() {
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

      {/* Header */}
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

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact informatie */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Neem contact op</h2>
          <p>
            Heb je vragen, opmerkingen of wil je meer informatie? Vul het formulier in of neem direct contact met ons op via onderstaande gegevens.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Adres</h3>
              <p>williams huis</p>
            </div>

            <div>
              <h3 className="font-semibold">Telefoon</h3>
              <p>+31687070287</p>
            </div>

            <div>
              <h3 className="font-semibold">E-mail</h3>
              <p>admin@4.nl</p>
            </div>
          </div>

          <div className="mt-8">
            <iframe
              title="Locatie"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.688825490655!2d4.89516831580145!3d52.37021597978798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c609e30c2d6f01%3A0xa6a7f9c9384c4c!2sAmsterdam!5e0!3m2!1snl!2snl!4v1638359828123!5m2!1snl!2snl"
              width="100%"
              height="250"
              allowFullScreen=""
              loading="lazy"
              className="rounded border"
            ></iframe>
          </div>
        </div>

        {/* Contactformulier */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Stuur ons een bericht</h2>
          <form className="space-y-5">
            <div>
              <label htmlFor="name" className="block font-medium mb-1">Naam</label>
              <input
                type="text"
                id="name"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Jouw naam"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-medium mb-1">E-mail</label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="jouw@email.nl"
              />
            </div>

            <div>
              <label htmlFor="message" className="block font-medium mb-1">Bericht</label>
              <textarea
                id="message"
                rows="5"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Typ je bericht hier..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Verstuur bericht
            </button>
          </form>
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
