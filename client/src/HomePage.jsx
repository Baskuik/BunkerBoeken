export default function HomePage() {
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

      {/* Hero section */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-32 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

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
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="mb-12 text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Welkom bij onze bijzondere locatie waar verhalen tot leven komen. 
          Hier ontdek je de geschiedenis achter de boeken, de mensen die ze schreven 
          en de wereld waarin ze zijn ontstaan. Tijdens onze rondleidingen nemen we je mee 
          achter de schermen, delen we unieke anekdotes en laten we je ervaren hoe kunst en 
          literatuur elkaar versterken. Of je nu een fervent lezer bent of gewoon nieuwsgierig, 
          er is altijd iets nieuws te ontdekken.
        </p>

        {/* Two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {/* Box 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
            <img
              src="https://tse1.mm.bing.net/th/id/OIP.cOuSJr_evsOMEOEiOJQgkwHaDU?rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="Eerste sectie"
              className="w-full h-56 object-cover mb-4 rounded"
            />
            <p className="text-gray-600 mb-6">
              Beschrijving van de eerste sectie. Korte tekst over wat dit inhoudt.
            </p>
            <a href="/VerhaalPage" className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Ontdek meer
            </a>
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
            <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Tickets kopen
            </button>
          </div>
        </div>

        {/* Bottom image grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              src: "https://terschelling-cdn.travelbase.nl/image-transforms/hero/2560x1920/3f2624ba9ffc5ebd40c98284e1379e99.webp",
              caption: "Korte beschrijving 1"
            },
            {
              src: "https://www.bunkermuseumterschelling.nl/wp-content/uploads/2025/05/background.jpg",
              caption: "Bunkermuseum: buitenkant"
            },
            {
              src: "https://tse1.mm.bing.net/th/id/OIP.dZTu0UUBa0fGWKPHbwKHqgHaDV?rs=1&pid=ImgDetMain&o=7&rm=3",
              caption: "Bunkermuseum: interieur expositie"
            },
            {
              src: "https://1.bp.blogspot.com/-jwvVxxaMYOY/XwpFCR_xZGI/AAAAAAAABb0/IJvRbGr9b-A2mejqfiAZi4uxudbZpC7rACNcBGAsYHQ/w1200-h630-p-k-no-nu/20180701_140510.jpg",
              caption: "Bunkermuseum: historische artefacten"
            }
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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center border-t border-gray-700">
        <p className="text-sm">
          © {new Date().getFullYear()} Bunkermuseum Terschelling.
        </p>
      </footer>
    </div>
  );
}
