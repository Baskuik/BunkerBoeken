

export default function BetalenPage() {
  return (
    <div className="flex min-h-screen font-sans text-gray-800">
      {/* Linkerkant (wit) */}
      <div className="w-2/3 bg-white p-10">
        {/* Stappenbalk */}
        <div className="flex items-center gap-6 text-gray-700 text-sm mb-10">
          {["informatie", "Betalen", "Confirm"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                  i === 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-700"
                }`}
              >
                {i + 1}
              </div>
              <span className={i === 1 ? "font-semibold text-blue-600" : ""}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Betaalformulier */}
        <form className="space-y-6 max-w-lg">
          {/* Payment method */}
          <div>
            <label className="block text-sm mb-2 font-semibold">
              Payment method
            </label>
            <div className="space-y-2">
              {["PayPal", "Credit Card", "iDEAL", "Apple Pay"].map((method, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input type="radio" name="payment" className="accent-blue-600" />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Card info */}
          <div>
            <label className="block text-sm mb-1">Card number</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Expiration date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">CVC / CVV</label>
              <input
                type="text"
                placeholder="123"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Name on card</label>
            <input
              type="text"
              placeholder="William Adukpo"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Save option */}
          <div className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-600" />
            <span className="text-sm">Save for my next order</span>
          </div>

          <button h
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <a href="">Pay now</a>
          </button>
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
