import { combineReducers } from 'redux';
import LoginReducer from './login.reducer.jsx';
import SocketReducer from './socket.reducer.jsx';

export const reducer = combineReducers({
  LoginReducer, SocketReducer
  });
  