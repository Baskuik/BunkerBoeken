import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gray-100 shadow-sm">
        <div className="text-2xl font-bold">Bunker rondleidingen</div>
        <ul className="flex space-x-8 text-gray-700 font-medium">
          <li><Link to="/" className="hover:text-blue-500">home</Link></li>
          <li><a href="#overons" className="hover:text-blue-500">over ons</a></li>
          <li><a href="#verhaal" className="hover:text-blue-500">verhaal</a></li>
          <li><a href="#rondleiding" className="hover:text-blue-500">rondleiding</a></li>
          <li><Link to="/boeken" className="hover:text-blue-500">boeken</Link></li>
          <li><a href="#contact" className="hover:text-blue-500">contact</a></li>
        </ul>
      </nav>

      {/* Hero section */}
      <section className="text-center py-16 bg-gray-50">
        <h1 className="text-4xl font-bold mb-4">Welkom!</h1>
        <p className="text-gray-600 mb-6"></p>
        <br></br>
        <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Boek nu uw rondleiding
        </button>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="mb-10 text-gray-700">
         
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Box 1 */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">
              <img src="/images/Bunkerfoto1.png" alt="Placeholder" width="500" height="450" />
              Beschrijving van de eerste sectie. Korte tekst over wat dit inhoudt.
            </p>
            <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Ontdek meer
            </button>
          </div>

          {/* Box 2 */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="w-full h-48 bg-gray-200 mb-4"></div>
            <p className="text-gray-600 mb-4">
              <img src="/images/placeholder.png" alt="Placeholder" width="300" height="200" />
              Beschrijving van de tweede sectie. Wat meer info of context.
            </p>
            <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Tickets kopen
            </button>
          </div>
        </div>

        {/* Bottom image grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </section>
    </div>
  );
}
