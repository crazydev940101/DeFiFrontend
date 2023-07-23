const INITIAL_STATE = {
    newPairData: '',
    newFollowTokenData: '',
    newAutoTokenData: '',
  };
  
  const SocketReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case "NEW_PAIR_DATA":
        return {
            ...state,
            newPairData: action.newPairData,
          };
      case "NEW_FOLLOW_TOKEN":
        return {
            ...state,
            newFollowTokenData: action.newFollowTokenData,
          };
      case "NEW_AUTO_TOKEN":
        return {
            ...state,
            newAutoTokenData: action.newAutoTokenData,
          };
      default:
        return state;
    }
  };
  export default SocketReducer;
 
