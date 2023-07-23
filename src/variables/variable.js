/**
 *  Created by Dragonslayer 6/5/2023
 */
import React from 'react';

export const globalVariables = {
    // BASE_URL: "",
    // BASE_URL_WS: "",
    
    BASE_URL: "http://192.168.116.132:7777",
    BASE_URL_WS: "ws://192.168.116.132:7777",

    ETHERSCAN_IO: "https://etherscan.io/address/",
    ETHERSCAN_IO_TX: "https://etherscan.io/tx/",
    DEXTOOL_PAIR_EXPLORER: "https://www.dextools.io/app/uniswap/pair-explorer/",
    BASE_TOKEN_SYMBOL: "ETH",
    RED: "#d74274",
    GREEN: "#14a800",
    BLUE: "#34acb3",
    BACKGROUND_COLOR: "#c4c9c5"
}

export const alertShow = (title, content1, type, content2, conten3, ) => {
    var item = '';
    switch (type) {
        case 'logs':
            item = <div style={{color: 'white', textTransform: 'capitalize'}}>Token'name: {title} <br/>Supply: {content1}</div>       
            break;
        case 'follow':
            item = <div style={{color: 'white', textTransform: 'capitalize'}}>Follow'address: {title} <br/>Token'address: {content1}</div>
            break;
        case 'auto':
            item = <div style={{color: 'white', textTransform: 'capitalize'}}>Follow'address: {title} <br/>Token'address: {content1}</div>
            break;
        default:
            break;
    }
    return item;
}

export const reduceString = (str, maxLength) => {
    var res = '';
    if(typeof str === 'number') str = str.toString();
    if(str){
        if(str.length > maxLength) {
            res = str.slice(0, maxLength) + '...';
        } else {
            res = str;
        }
    }
    return res;
}

export const validateString = (value, type) => {
    var regex = '';
    if( type === 'email') regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    else if( type === 'public' ) regex = /^0x[a-fA-F0-9]{40}$/;
    // else if( type === 'private' ) regex = /^[a-fA-F0-9]{60}$/;
    return regex.test(value);
}

export const onSetLimitHtmlInput = (value, minValue, maxValue) => {
    let correctedValue = parseFloat(value);
    if(maxValue) {
        if (correctedValue < minValue) {
            correctedValue = minValue;
        } else if (correctedValue > maxValue) {
            correctedValue = maxValue;
        }
    }else {
        if (correctedValue < minValue || !correctedValue) {
            correctedValue = minValue
        }
    }
     
    return correctedValue;
  };

  export const onOnlyAllowNumeric = (event) => {
    const regex = /^[0-9\.]*$/; // Only allow numeric
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  };

  export const setColorToLabel = (flag) => {
    if(flag == 1){
        return "#fd5d93"
    }else if(flag == 0){
        return "#14a800"
    }else {
        return "#000000"
    }
  }

  export const setColorToI = (flag) => {
    if(flag == 1){
        return (
        <>&nbsp; true</>)
    }else if(flag == 0){
        return (
            <>&nbsp; false</>
        )
    }else {
        return  <>&nbsp;?</>
    }
  }

  export const setColorToLabelByCount = (count) => {
    if(count > 0){
        return "#14a800"
    }else if(count === 0){
        return "#fd5d93"
    }else{
        return "#000000"
    }
  }

  export const setColorToIByCount = (count) => {
    if(count > 0){
        return (
        <>&nbsp; {count}</>)
    }else if(count === 0){
        return (
            <>&nbsp; {count}</>
        )
    }else{
        return  <>&nbsp;?</>
    }
  }