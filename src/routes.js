import loadable from 'loadable-components'
import React from "react";
import { ClipLoader } from "react-spinners";
import { globalVariables } from './variables/variable.js';

const Loading = () => <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}><ClipLoader color={globalVariables.GREEN} size="100px"/> </div>

const Login = loadable(() => import('./views/pages/users/Login.js'), {
  LoadingComponent: Loading,
});
const Register = loadable(() => import('./views/pages/users/Register.js'), {
  LoadingComponent: Loading,
});
const Wallet = loadable(() => import('./views/pages/wallet/index.js'), {
  LoadingComponent: Loading,
});
const TraderLogs = loadable(() => import('./views/pages/wallet/component/TraderLogs.js'), {
  LoadingComponent: Loading,
});
const Logs = loadable(() => import('./views/pages/logs/index.js'), {
  LoadingComponent: Loading,
});
const User = loadable(() => import('./views/pages/setting/index.js'), {
  LoadingComponent: Loading,
});
const Sniper = loadable(() => import('./views/pages/sniper/index.js'), {
  LoadingComponent: Loading,
});
const Follow = loadable(() => import('./views/pages/follow/index.js'), {
  LoadingComponent: Loading,
});
const Mev = loadable(() => import('./views/pages/mev/index.js'), {
  LoadingComponent: Loading,
});
const Test = loadable(() => import('./views/pages/test/index.js'), {
  LoadingComponent: Loading,
});
const DetectTraderByToken = loadable(() => import('./views/pages/detecttraderbytoken/index.js'), {
  LoadingComponent: Loading,
});
const CompairToken = loadable(() => import('./views/pages/detecttraderbytoken/component/CompairToken.js'), {
  LoadingComponent: Loading,
});
const DetectTraderByWallet = loadable(() => import('./views/pages/detecttraderbywallet/index.js'), {
  LoadingComponent: Loading,
});
const TokenLogs = loadable(() => import('./views/pages/tokenlog/index.js'), {
  LoadingComponent: Loading,
});
const Auto = loadable(() => import('./views/pages/auto/index.js'), {
  LoadingComponent: Loading,
});
const Renounce = loadable(() => import('./views/pages/renounce/index.js'), {
  LoadingComponent: Loading,
});


const routes = [
  {
    path: "/mev",
    name: "Mev",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-money-coins",
    component: Mev,
    layout: "/bot"
  }, 
  {
    path: "/following",
    name: "Following",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-coins",
    component: Follow,
    layout: "/bot"
  }, 
  {
    path: "/sniper",
    name: "Sniper",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-spaceship",
    component: Sniper,
    layout: "/bot"
  },
  // {
  //   path: "/logs",
  //   name: "Pair Logs",
  //   rtlName: "لوحة القيادة",
  //   icon: "tim-icons icon-pencil",
  //   component: Logs,
  //   layout: "/bot"
  // },
  {
    path: "/login",
    name: "Login",
    rtlName: "هعذاتسجيل الدخول",
    mini: "L",
    rtlMini: "هعذا",
    component: Login,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    rtlName: "هعذاتسجيل الدخول",
    mini: "L",
    rtlMini: "هعذا",
    component: Register,
    layout: "/auth",
  },
  {
    path: "/wallet",
    name: "Wallet",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-bank",
    component: Wallet,
    layout: "/bot"
  },
  {
    path: "/trader_logs",
    name: "Trader Transaction History",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-bank",
    component: TraderLogs,
    layout: "/bot"
  },
  {
    name: "Analyze",    
    icon: "tim-icons icon-chart-bar-32",
    layout: "/bot",
    collapse: true, // Add the collapse property to create a submenu
    views: [
      {
        path: "/detect_trader_by_token",
        name: "Detect Trader By Token",
        rtlName: "لوحة القيادة",
        component: DetectTraderByToken,
        layout: "/bot",
        mini: "T",
        rtlMini: "هعذا",
      },
      {
        path: "/detect_trader_by_wallet",
        name: "Detect Trader By Wallet",
        rtlName: "لوحة القيادة",
        component: DetectTraderByWallet,
        layout: "/bot",
        mini: "W",
        rtlMini: "هعذا",
      },
    ]
  },  
  {
    path: "/compair_token",
    name: "Compair Token",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-bank",
    component: CompairToken,
    layout: "/bot"
  },
  {
    path: "/settings",
    name: "Settings",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-key-25",
    component: User,
    layout: "/bot"
  }, 
  {
    path: "/test-2",
    name: "Test-2",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-paper",
    component: Auto,
    layout: "/bot"
  },
  {
    path: "/renounce",
    name: "Renounce Events",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-paper",
    component: Renounce,
    layout: "/bot"
  },
  {
    name: "Logs",    
    icon: "tim-icons icon-pencil",
    layout: "/bot",
    collapse: true, // Add the collapse property to create a submenu
    views: [
      {
        path: "/logs",
        name: "Pair Logs",
        rtlName: "لوحة القيادة",
        component: Logs,
        layout: "/bot",
        mini: "P",
        rtlMini: "هعذا",
      },
      {
        path: "/tokenlogs",
        name: "Event Logs",
        rtlName: "لوحة القيادة",
        component: TokenLogs,
        layout: "/bot",
        mini: "E",
        rtlMini: "هعذا",
      },
      {
        path: "/test-1",
        name: "Test & Token Logs",
        rtlName: "لوحة القيادة",
        component: Test,
        layout: "/bot",
        mini: "T",
        rtlMini: "هعذا",
      },
    ]
  }
];

export default routes;
