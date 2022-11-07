import {combineReducers} from 'redux'
import login from './login'
import post from './post'
import content from './content'
import stats from './stats'
import setting from './setting'
import editor from './editor'
import insight from './insight'
import circle from './circle'
import newsletter from './newsletter'

export default combineReducers({
  login,
  post,
  content,
  stats,
  setting,
  editor,
  insight,
  circle,
  newsletter,
})
