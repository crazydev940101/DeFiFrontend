import React, { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import { connect } from "react-redux";
import { SocketContext } from './SocketContext';
import { globalVariables } from "../../variables/variable";

function SocketProvider(props) {
  const [socket, setSocket] = useState(null);
  const { apiConfig } = global;
  useEffect(() => {
    //set socket
    if(socket === null){
      if (props.credential.loginToken) {
        setSocket(
          io(globalVariables.BASE_URL, {
            auth: {
              token: props.credential.loginToken,
            },
            reconnection: true, // Enable reconnection
            reconnectionAttempts: 5, // Number of reconnection attempts
            reconnectionDelay: 1000, // Delay between reconnection attempts in milliseconds
          })
        );
      } else {
        setSocket(io(globalVariables.BASE_URL));
      }
    }
  }, [props.credential.loginToken, socket]);

  

  // useEffect(() => {
  //   if(socket){
  //     socket.on("connect", () => {
  //       console.log(socket.connected); // true
  //     });
  //     socket.on("reconnect", (attemptNumber) => {
  //       console.log("Socket reconnected after:", attemptNumber)      
  //     })

  //     return () => {
  //       socket.disconnect(); // Disconnect the socket when the component unmounts
  //     };
  //   }
  // }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {props.children}
    </SocketContext.Provider>
  );
}

function mapStateToProps(state) {
  const { LoginReducer } = state;
  return {
    credential: LoginReducer
  };
}

export default connect(mapStateToProps)(SocketProvider);
