const express = require('express')
const http = require('http')

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
        return jsonResp.rates
      })
  }

}

module.exports = APIRouter