const INITIAL_STATE = {
  loginToken: "",
  loginUserName: "",
  expiresAt: "",
};

const LoginReducer = (state = INITIAL_STATE, action) => {
  let loginToken;
  let loginUserName;
  let expiresAt;

  let data;
  switch (action.type) {
    case "LOGIN_SUCCESS":
      data = action.loginData;
      loginToken = data.token;
      loginUserName = data.userInfo._id;    
      expiresAt = data.expiresAt;
      return {
        ...state,
        loginToken,
        loginUserName,       
        expiresAt,
      };
    
    case "LOGOUT_SUCCESS":
      return {
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};
export default LoginReducer;
