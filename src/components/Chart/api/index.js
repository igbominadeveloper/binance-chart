import historyProvider from './historyProvider';
import { getBinanceSymbols } from './requests';
import stream from './stream';

const supportedResolutions = [
  '1',
  '3',
  '5',
  '15',
  '30',
  '60',
  '120',
  '240',
  '360',
  '480',
  '720',
  '1D',
  '3D',
  '1W',
  '1M',
];

const config = {
  supported_resolutions: supportedResolutions,
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
};

let allSymbols = [];

const Api = {
  onReady: async function (cb) {
    allSymbols = await getBinanceSymbols();

    setTimeout(() => cb(config), 0);
  },

  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    const matches = allSymbols.filter((symbol) =>
      symbol.full_name.toLowerCase().includes(userInput.toLowerCase())
    );

    onResultReadyCallback(matches);
  },

  resolveSymbol: (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    // expects a symbolInfo object in response
    console.log('======resolveSymbol running');
    const split_data = symbolName.split(/[:/]/);
    const symbol_stub = {
      name: symbolName,
      description: '',
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      ticker: symbolName,
      exchange: split_data[0],
      minmov: 1,
      pricescale: 100000000,
      has_intraday: true,
      intraday_multipliers: ['1', '60'],
      supported_resolution: config.supportedResolutions,
      volume_precision: 8,
      data_status: 'streaming',
    };

    if (split_data[2].match(/USD|EUR|JPY|AUD|GBP|KRW|CNY/)) {
      symbol_stub.pricescale = 100;
    }
    setTimeout(function () {
      onSymbolResolvedCallback(symbol_stub);
    }, 0);
  },

  getBars: function (
    symbolInfo,
    resolution,
    from,
    to,
    onHistoryCallback,
    onErrorCallback,
    firstDataRequest
  ) {
    historyProvider
      .getBars(symbolInfo, resolution, from, to, firstDataRequest)
      .then((bars) => {
        if (bars.length) {
          onHistoryCallback(bars, { noData: false });
        } else {
          onHistoryCallback(bars, { noData: true });
        }
      })
      .catch((err) => {
        console.log({ err });
        onErrorCallback(err);
      });
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {
    stream.subscribeBars(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback
    );
  },
  unsubscribeBars: (subscriberUID) => {
    stream.unsubscribeBars(subscriberUID);
  },
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    //optional
    // console.log('=====calculateHistoryDepth running');
    // while optional, this makes sure we request 24 hours of minute data at a time
    // CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
    return resolution < 60
      ? { resolutionBack: 'D', intervalBack: '1' }
      : undefined;
  },
  getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //optional
    // console.log('=====getMarks running');
  },
  getTimeScaleMarks: (
    symbolInfo,
    startDate,
    endDate,
    onDataCallback,
    resolution
  ) => {
    //optional
    // console.log('=====getTimeScaleMarks running');
  },
  getServerTime: (cb) => {
    console.log('=====getServerTime running');
  },
};

export default Api;
