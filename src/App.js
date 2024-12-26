import React, { useEffect, useState } from "react";
import "./App.css";
import CurrencyRow from "./CurrencyRow";

const BASE_URL = "https://api.exchangerate-api.com/v4/latest/MYR";

function App() {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currencyData, setCurrencyData] = useState({
    fromCurrency: undefined,
    toCurrency: undefined,
    exchangeRate: undefined,
    amount: 1,
    amountInFromCurrency: true,
  });

  const [darkMode, setDarkMode] = useState(false);

  const {
    fromCurrency,
    toCurrency,
    exchangeRate,
    amount,
    amountInFromCurrency,
  } = currencyData;

  const toAmount = amountInFromCurrency ? amount * exchangeRate : amount;
  const fromAmount = amountInFromCurrency ? amount : amount / exchangeRate;

  useEffect(() => {
    const fetchCurrencyData = async () => {
      try {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        if (data?.rates) {
          const firstCurrency = Object.keys(data.rates)[0];
          setCurrencyOptions(Object.keys(data.rates));
          setCurrencyData((prev) => ({
            ...prev,
            fromCurrency: data.base,
            toCurrency: firstCurrency,
            exchangeRate: data.rates[firstCurrency],
          }));
        } else {
          console.error("Rates are undefined or null");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCurrencyData();
  }, []);

  // dark/light mode toggle
  useEffect(() => {
    console.log("Dark Mode toggled:", darkMode);
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (fromCurrency && toCurrency) {
        try {
          const res = await fetch(
            `${BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}`
          );
          const data = await res.json();
          setCurrencyData((prev) => ({
            ...prev,
            exchangeRate: data.rates[toCurrency],
          }));
        } catch (error) {
          console.error("Error fetching exchange rate:", error);
        }
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (e, isFromCurrency) => {
    const newAmount = e.target.value;
    setCurrencyData((prev) => ({
      ...prev,
      amount: newAmount,
      amountInFromCurrency: isFromCurrency,
    }));
  };

  // swapping the currencies
  const handleSwap = () => {
    setCurrencyData((prev) => ({
      ...prev,
      fromCurrency: toCurrency,
      toCurrency: fromCurrency,
    }));
  };

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      <header className="header">
        <h1>🌍 Currency Converter</h1>
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="container">
        <h2>Convert Your Currency</h2>
        <CurrencyRow
          currencyOptions={currencyOptions}
          selectedCurrency={fromCurrency}
          onChangeCurrency={(e) =>
            setCurrencyData((prev) => ({
              ...prev,
              fromCurrency: e.target.value,
            }))
          }
          onChangeAmount={(e) => handleAmountChange(e, true)}
          amount={fromAmount}
        />

        <button className="swap-button" onClick={handleSwap}>
          🔄
        </button>

        <CurrencyRow
          currencyOptions={currencyOptions}
          selectedCurrency={toCurrency}
          onChangeCurrency={(e) =>
            setCurrencyData((prev) => ({ ...prev, toCurrency: e.target.value }))
          }
          onChangeAmount={(e) => handleAmountChange(e, false)}
          amount={toAmount}
        />

        {exchangeRate && (
          <p className="exchange-rate">
            1 {fromCurrency} = {exchangeRate.toFixed(2)} {toCurrency}
          </p>
        )}
      </div>

      <footer className="footer">
        <p>Data provided by ExchangeRate-API</p>
      </footer>
    </div>
  );
}

export default App;
