import * as types from "./types";

export const LoginSuccess = (loginData) => ({
  type: types.LOGIN_SUCCESS,
  loginData,
});

export const setNewPairData = (newPairData) => ({  
    type: types.NEW_PAIR_DATA,
    newPairData,
});

export const setNewFollowTokenData = (newFollowTokenData) => ({  
  type: types.NEW_FOLLOW_TOKEN,
  newFollowTokenData,
});

export const setNewAutoTokenData = (newAutoTokenData) => ({  
  type: types.NEW_AUTO_TOKEN,
  newAutoTokenData,
});