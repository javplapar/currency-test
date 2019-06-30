const app = require('express')()
const APIRouter = require('./api-app')

// TODO: create config file with API URL and KEY 45bfc1f0f754a56d0c3477f0fce6c074

app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500)
})

app.use('/api', new APIRouter().getRouter())

app.listen(8080)

console.log('Listening on port 8080')