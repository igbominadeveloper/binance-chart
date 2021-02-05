const rp = require('request-promise').defaults({ json: true });

const api_root = 'https://min-api.cryptocompare.com';

const generateSymbol = (exchange, fromSymbol, toSymbol) => {
  const short = `${fromSymbol}/${toSymbol}`;
  const full = `${exchange}:${short}`;
  const symbol = { short, full };

  return {
    symbol: short,
    full_name: symbol.full,
    description: short,
    exchange,
    type: 'crypto',
  };
};

export const getBinanceSymbols = async () => {
  const symbolsSupported = await rp({
    url: `${api_root}/data/v4/all/exchanges`,
  });
  let allSymbols = [];

  const exchanges = [
    {
      value: 'Binance',
      name: 'Binance',
      desc: 'Binance',
    },
  ];

  for (const exchange of exchanges) {
    const pairs = symbolsSupported.Data.exchanges[exchange.value].pairs;

    for (const leftPairPart of Object.keys(pairs)) {
      const symbolPairs = Object.keys(pairs[leftPairPart].tsyms);
      const symbols = symbolPairs.map((rightPairPart) =>
        generateSymbol('Binance', leftPairPart, rightPairPart)
      );

      allSymbols = [...allSymbols, ...symbols];
    }
  }
  return allSymbols;
};
