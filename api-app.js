const express = require('express')
const http = require('http')

const FAKE_RESPONSE = '{"success":true,"timestamp":1561925944,"base":"EUR","date":"2019-06-30","rates":{"AED":4.172559,"AFN":92.59379,"ALL":122.432677,"AMD":542.714022,"ANG":2.131879,"AOA":386.549753,"ARS":48.299418,"AUD":1.616628,"AWG":2.044804,"AZN":1.936898,"BAM":1.953697,"BBD":2.295747,"BDT":96.071917,"BGN":1.954604,"BHD":0.428284,"BIF":2097.060138,"BMD":1.136002,"BND":1.534508,"BOB":7.856875,"BRL":4.370425,"BSD":1.136854,"BTC":9.2488533e-5,"BTN":78.316849,"BWP":12.096162,"BYN":2.320061,"BYR":22265.64394,"BZD":2.291827,"CAD":1.486001,"CDF":1886.900108,"CHF":1.112067,"CLF":0.027893,"CLP":769.658558,"CNY":7.800702,"COP":3650.543204,"CRC":662.187158,"CUC":1.136002,"CUP":30.104059,"CVE":110.590084,"CZK":25.430579,"DJF":201.890405,"DKK":7.464438,"DOP":57.947301,"DZD":134.780981,"EGP":18.98484,"ERN":17.039776,"ETB":33.057805,"EUR":1,"FJD":2.422241,"FKP":0.895414,"GBP":0.894471,"GEL":3.231933,"GGP":0.894342,"GHS":6.162809,"GIP":0.895414,"GMD":56.458616,"GNF":10479.621012,"GTQ":8.760566,"GYD":237.873164,"HKD":8.873652,"HNL":28.067454,"HRK":7.389804,"HTG":106.599076,"HUF":322.943848,"IDR":16045.520465,"ILS":4.051669,"IMP":0.894342,"INR":78.327693,"IQD":1351.842668,"IRR":47831.374161,"ISK":141.58033,"JEP":0.894342,"JMD":148.418364,"JOD":0.805464,"JPY":122.830258,"KES":116.258188,"KGS":78.943971,"KHR":4623.529331,"KMF":492.031006,"KPW":1022.528622,"KRW":1313.707139,"KWD":0.34472,"KYD":0.947579,"KZT":432.771164,"LAK":9844.595349,"LBP":1713.090824,"LKR":200.49303,"LRD":222.940788,"LSL":16.006488,"LTL":3.354319,"LVL":0.687156,"LYD":1.579114,"MAD":10.883132,"MDL":20.550849,"MGA":4092.450536,"MKD":61.525316,"MMK":1722.576927,"MNT":2994.991787,"MOP":9.145784,"MRO":405.552921,"MUR":40.500185,"MVR":17.551473,"MWK":863.361867,"MXN":21.766201,"MYR":4.695146,"MZN":70.499623,"NAD":16.005715,"NGN":408.960643,"NIO":37.99921,"NOK":9.683431,"NPR":125.704355,"NZD":1.690487,"OMR":0.437316,"PAB":1.137081,"PEN":3.74029,"PGK":3.84253,"PHP":58.214415,"PKR":185.168795,"PLN":4.243532,"PYG":7044.06614,"QAR":4.136204,"RON":4.718124,"RSD":117.800102,"RUB":71.772792,"RWF":1033.76204,"SAR":4.26035,"SBD":9.362647,"SCR":15.514949,"SDG":51.291652,"SEK":10.550609,"SGD":1.535466,"SHP":1.500551,"SLL":10138.820086,"SOS":662.850476,"SRD":8.472309,"STD":24493.105776,"SVC":9.949278,"SYP":585.041065,"SZL":16.005776,"THB":34.883786,"TJS":10.727384,"TMT":3.976008,"TND":3.269377,"TOP":2.58628,"TRY":6.513266,"TTD":7.695904,"TWD":35.185405,"TZS":2612.119153,"UAH":29.738293,"UGX":4195.605022,"USD":1.136002,"UYU":40.032772,"UZS":9718.498715,"VEF":11.345826,"VND":26480.212257,"VUV":129.591567,"WST":3.018012,"XAF":655.257892,"XAG":0.074183,"XAU":0.000806,"XCD":3.070103,"XDR":0.817144,"XOF":655.473034,"XPF":119.639483,"YER":284.348279,"ZAR":15.997753,"ZMK":10225.39829,"ZMW":14.582293,"ZWL":365.792723}}' // TODO: REMOVE

/**
 * Creates a router with several API endpoints
 */
class APIRouter {
  constructor (dataUrl) {
    this.dataUrl = dataUrl
    this.router = express.Router()
    this._setRouterEndpoints()
  }

  _setRouterEndpoints() {
    this.router.get('/currency', (req, res) => {
      let base = req.query.base
      if (base == undefined || base == null) {
        throw new Error("Missing 'base' parameter");
      }
      this.fetchRates(base)
        .then(response => res.json(response))
        .catch(e => res.status(500).json(e.message))
    })
  }

  _doHttpRequest(url) {
    return new Promise(function (resolve, reject) {
      http.get(url, function (response) {
        let rawData = ''
        response.on('data', function (chunk) {
          rawData += chunk.toString('utf-8')
        }).on('error', function (err) {
          reject(err)
        }).on('end', function () {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject({
              message: 'Failed with status code: ' + response.statusCode,
              error: response.statusCode
            })
            return
          }
          resolve(rawData)
        })
      }).on('error', reject).end()
    })
  }

  getRouter() {
    return this.router
  }

  fetchRates(base) {
    let url = this.dataUrl + '&base=' + base 
    return this._doHttpRequest(url)
      .then(response => {
        let jsonResp = JSON.parse(response)
        if (jsonResp.success != true) {
          console.error('Failed to fetch data from external server: ' + response)
          throw new Error('Could not fetch currency data from servers')
        }
        return jsonResp
      })
  }

}

module.exports = APIRouter