import { createStore, applyMiddleware } from 'redux'
import reduxPromiseMiddleware from 'redux-promise-middleware'
import { createLogger } from 'redux-logger'
import reducer from './reducer'

const middlewares = [
  reduxPromiseMiddleware(),
]

if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger())
}

export const store = createStore(
  reducer,
  {},
  applyMiddleware(...middlewares)
)

