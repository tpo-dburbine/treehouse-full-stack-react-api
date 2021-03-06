'use strict'

// load modules
const express = require('express')
const morgan = require('morgan')
const routes = require('./routes/routes')
const cors = require('cors') // Enables connection to React application

/**
 * From Sequelize documentation - used for testing database connection (~line 67)
 */
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:')

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true'

// create the Express app
const app = express()

// Enable CORS Requests
app.use(cors())

// Setup request body JSON parsing.
app.use(express.json())

// setup morgan which gives us http request logging
app.use(morgan('dev'))

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!'
  })
})

// Use routes
app.use(routes)

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`)
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const validationErrors = err.errors.map(err => err.message)
    res.status(400).json({ validationErrors })
  } else {
    res.status(err.status || 500).json({
      message: err.message,
      error: {}
    })
  }
})

// set our port
app.set('port', process.env.PORT || 5000)

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`)
})

/**
 * From Sequelize documentation - testing database connection
 */
async function testConnection () {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}
testConnection()
