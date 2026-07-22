import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supportedCurrencies, convertCurrency, formatCurrency, exchangeRates } from '../../utils/currency';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [convertedAmount, setConvertedAmount] = useState(null);

  const handleConvert = () => {
    const result = convertCurrency(amount, fromCurrency, toCurrency);
    setConvertedAmount(result);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">💱 Currency Converter</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            From
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {supportedCurrencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-500 rotate-90" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            To
          </label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {supportedCurrencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConvert}
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          🔄 Convert
        </button>

        {convertedAmount !== null && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-center">
              <span className="text-gray-600">
                {formatCurrency(amount, fromCurrency)}
              </span>
              <span className="mx-2 text-gray-400">=</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(convertedAmount, toCurrency)}
              </span>
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              Rate: 1 {fromCurrency} = {(1 / exchangeRates[fromCurrency] * exchangeRates[toCurrency]).toFixed(4)} {toCurrency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;