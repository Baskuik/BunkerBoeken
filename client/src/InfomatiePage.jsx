

export default function InfoPage() {
  return (
    <div className="flex min-h-screen font-sans text-gray-800">
      {/* Linkerkant (wit) */}
      <div className="w-2/3 bg-white p-10">
        {/* Stappenbalk */}
        <div className="flex items-center gap-6 text-gray-700 text-sm mb-10">
          {["informatie ", "Betalen", "Confirm"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                  i === 0
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-700"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={i === 0 ? "font-semibold text-blue-600" : ""}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Formulier */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">First name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Last name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Date of birth</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Street</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">House number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Postal Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Place</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Country</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Addition</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="md:col-span-2 mt-6">
            <button
            href="/ContactPage"
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <a href="BetaalPage">Next</a>
            </button>
          </div>
        </form>
      </div>

      {/* Rechterkant (grijs) */}
      <div className="w-1/3 bg-gray-300 p-10 flex flex-col justify-center text-sm text-gray-800">
        <div className="space-y-6">
          <div>
            <p className="font-semibold">datum</p>
            <p>5 oktober 2025</p>
          </div>
          <div>
            <p className="font-semibold">tijd</p>
            <p>11:00</p>
          </div>
          <div>
            <p className="font-semibold">persoon</p>
            <p>1 persoon</p>
            <p>€ 60,00</p>
          </div>
          <hr className="border-gray-500 my-4" />
          <div className="flex justify-between font-semibold">
            <span>totaal</span>
            <span>€ 60,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
