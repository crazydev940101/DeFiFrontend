import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { alertShow } from "../../variables/variable";
import { globalVariables } from "../../variables/variable";
import { useAlert } from "react-alert";
import './withsocket.css'

const withSocket = (WrappedComponent) => {
  const WithSocket = (props) => {
    const [socket, setSocket] = useState(null);
    const alert = useAlert();
    const [logsOneNewPair, setLogsOneNewPair] = useState(null);
    const [testBlockNumber, setTestBlockNumber] = useState(null);
    const [followsNewToken, setFollowsNewToken] = useState(null);
    const [newLog, setNewLog] =useState(null);
    const [updateCount, setUpdateCount] = useState(0); // add state variable to force re-render
    useEffect(() => {
      //set socket
      if (props.credential.loginToken) {
        setSocket(
          io(globalVariables.BASE_URL_WS, {
            auth: {
              token: props.credential.loginToken,
            },
          })
        );
      } else {
        setSocket(io(globalVariables.BASE_URL_WS));
      }
    }, [props.credential.loginToken]);

    // useEffect(() => {
    //   // no-op if the socket is already connected
    //   socket.on("connect", (event) => {

    //   });
  
    //   return () => {
    //     socket.disconnect();
    //   };
    // }, []);

    useEffect(() => {
      if (socket) { 
        socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          // Handle the error, e.g., display an error message to the user
        });
        socket.on("Connecting ", (error) => {
          console.error("WebSocket connection error:", error);
          // Handle the error, e.g., display an error message to the user
        });
        socket.on("Connect_failed ", (error) => {
          console.error("WebSocket connection error:", error);
          // Handle the error, e.g., display an error message to the user
        });
        socket.on("Error ", (error) => {
          console.error("WebSocket connection error:", error);
          // Handle the error, e.g., display an error message to the user
        });
        socket.on("Reconnect ", (error) => {
          console.error("WebSocket connection error:", error);
          // Handle the error, e.g., display an error message to the user
        });
        socket.on("Reconnect_failed  ", (error) => {
          console.error("WebSocket connection error:", error);
          // Handle the error, e.g., display an error message to the user
        });
        // socket.on("connect", () => {
          socket.on("logs:one:newPair", (data) => {
            if (data) alert.show(alertShow(data.name, data.totalsupply, 'logs'));
            setLogsOneNewPair(data); // update the data state here
            // setUpdateCount((prevCount) => prevCount + 1); // update state variable to force re-render
          });
          socket.on("test:one:newLog", (data) => {
            // if (data) alert.show(alertShow(data.name, data.totalsupply));
            setNewLog(data); // update the data state here
          });
          socket.on("test:blocknumber", (data) => {
            setTestBlockNumber(data);
          })
          socket.on("follows:newToken", (data) => {
            const _data = data;
            console.log("why alert can be called two times? ", _data);
            // alert.show(alertShow("---TEST---", "---TEST---", 'follow'));
            if (_data.newToken) {
              alert.show(alertShow(_data.newToken.follow_id, _data.newToken.token_id, 'follow'));
           }

            const parentElement = document.querySelector('.sidebar');
            const childElement = parentElement.querySelector('.socket-message');
            // if (removeElement) {
              // parentElement.removeChild(removeElement);
            // }
            if (data.newTokenCount > 0) {
              childElement.style.display = 'block';
              childElement.innerText = data.newTokenCount;
              // const createElement = document.createElement('span');
              // createElement.textContent = data.newTokenCount;
              // createElement.className = 'socket-message';
              // parentElement.appendChild(createElement);
            }else if(data.newTokenCount  <= 0) {
              console.log()
              childElement.style.display = 'none';
            }
            setFollowsNewToken(data);            
          });
        // })
       
      }
      return () => {
        if (socket){
          // socket.off("logs:one:newPair");
          // socket.off("test:blocknumber");
          // socket.off("follows:newToken");
          socket.disconnect();
        } 
      };
    }, [socket]);

    return <WrappedComponent {...props} socket={socket}  logsOneNewPair={logsOneNewPair} testBlockNumber={testBlockNumber} followsNewToken={followsNewToken} newLog = {newLog}/>;
  };

  return WithSocket;
};

export default withSocket;
