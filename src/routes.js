/*!

=========================================================
* LOTTERY Chakra - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-chakra
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-chakra/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// import
import SubAdminManagement from "views/Admin/SubAdminManagement.js";
import MainMenuComponent from "views/Pages/MainMenu.js";
import PercentageLimitComponent from "views/SubAdmin/PercentageLimit.js";
import LotteryCategoryManagement from "views/Admin/LottoCategoryManagement.js";
import WinningNumberManagement from "views/Admin/WinningNumberManagement.js";
import PaymentAlertManagement from "views/Admin/PaymentAlertManagement";

import SellerManagement from "views/SubAdmin/SellerManagement.js";
import SupervisorManagement from "views/SubAdmin/SupervisorManagement.js";
import BlockNumber from "views/SubAdmin/BlockNumber.js";
import LimitNumber from "views/SubAdmin/LimitNumber.js";
import PaymentCondition from "views/SubAdmin/PaymentCondition.js";
import WinNumber from "views/SubAdmin/WinNumber.js";
import SoldTickets from "views/SubAdmin/SoldTickets.js";
import DeletedTickets from "views/SubAdmin/DeletedTickets";
import WinnerTickets from "views/SubAdmin/WinnerTickets.js";
import SaleDetails from "views/SubAdmin/SaleDetails.js";
import SaleReports from "views/SubAdmin/SaleReports.js";
import SubAdminChat from "views/SubAdmin/Chat";

// supervisor components.
import SupervisorSellerManagement from "views/SuperVisor/SuperVisorSellerManagement.js";
import SupervisorSaleDetails from "views/SuperVisor/SuperVisorSaleDetails";
import SuperVisorSaleReports from "views/SuperVisor/SuperVisorSaleReports";
import SupervisorSoldTickets from "views/SuperVisor/SuperVisorSoldTickets";
import SupervisorWinNumber from "views/SuperVisor/SuperVisorWinNumber.js";


import SignIn from "views/Pages/SignIn.js";

import { ImUsers } from "react-icons/im";
import { GiPodium } from "react-icons/gi";
import { GoSignOut } from "react-icons/go";
import { HiViewGridAdd } from "react-icons/hi";
import { FaMoneyBill, FaUserSecret } from "react-icons/fa";
import { FaFortAwesome } from "react-icons/fa";
import { MdFactCheck } from "react-icons/md";
import { MdPayments } from "react-icons/md";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { SiAdblock } from "react-icons/si";
import { RiNumbersFill } from "react-icons/ri";
import { FaInfoCircle } from "react-icons/fa";
import { FaFacebookMessenger} from "react-icons/fa";
import { BsTicketDetailedFill } from "react-icons/bs";
import { RiDeleteBin5Fill } from "react-icons/ri";

var dashRoutes = [
  {
    path: "/main-menu",
    name: "Admin",
    icon: <ImUsers color='inherit' size={22}/>,
    component: MainMenuComponent,
    layout: "/admin",
  },
  {
    path: "/PercentageLimit",
    name: "Percentage Limit",
    icon: <ImUsers color='inherit' size={22}/>,
    component: PercentageLimitComponent,
    layout: "/subadmin",
  },
  {
    path: "/SubAdminManagement",
    name: "Sub Admin",
    icon: <ImUsers color='inherit' size={22}/>,
    component: SubAdminManagement,
    layout: "/admin",
  },
  {
    path: "/PaymentAlert",
    name: "Payment Alerts",
    icon: <FaMoneyBill color='inherit' size={22}/>,
    component: PaymentAlertManagement,
    layout: "/admin",
  },
  {
    path: "/LotteryCategoryManagement",
    name: "Lottery Category",
    icon: <HiViewGridAdd color='inherit' size={22}/>,
    component: LotteryCategoryManagement,
    layout: "/admin",
  },
  {
    path: "/WinningNumberManagement",
    name: "Winning Numbers",
    icon: <GiPodium color='inherit' size={22}/>,
    component: WinningNumberManagement,
    layout: "/admin",
  },
  {
    path: "/SellerManagement",
    name: "Seller",
    icon: <FaUserTie color='inherit' size={22}/>,
    component: SellerManagement,
    layout: "/subadmin",
  },
  {
    path: "/SupervisorManagement",
    name: "Supervisor",
    icon: <FaUserSecret color='inherit' size={22}/>,
    component: SupervisorManagement,
    layout: "/subadmin",
  },
  {
    path: "/paymentcondition",
    name: "Payment Condition",
    icon: <MdPayments color='inherit' size={22}/>,
    component: PaymentCondition,
    layout: "/subadmin",
  },
  {
    path: "/blocknumber",
    name: "Block Number",
    icon: <SiAdblock color='inherit' size={22}/>,
    component: BlockNumber,
    layout: "/subadmin",
  },
  {
    path: "/addlimit",
    name: "Add Limit",
    icon: <MdProductionQuantityLimits color='inherit' size={22}/>,
    component: LimitNumber,
    layout: "/subadmin",
  },
  {
    path: "/winningnumberviews",
    name: "Win Number View",
    icon: <RiNumbersFill color='inherit' size={22}/>,
    component: WinNumber,
    layout: "/subadmin",
  },
  {
    path: "/soldtickets",
    name: "Sold Tickets",
    icon: <MdFactCheck color='inherit' size={22}/>,
    component: SoldTickets,
    layout: "/subadmin",
  },
  {
    path: "/deleteticket",
    name: "Deleted Ticket",
    icon: <RiDeleteBin5Fill color='inherit' size={22}/>,
    component: DeletedTickets,
    layout: "/subadmin",
  },
  {
    path: "/winningtickets",
    name: "Winning Tickets",
    icon: <FaFortAwesome color='inherit' size={22}/>,
    component: WinnerTickets,
    layout: "/subadmin",
  },
  {
    path: "/saledetails",
    name: "Sale Details",
    icon: <BsTicketDetailedFill color='inherit' size={22}/>,
    component: SaleDetails,
    layout: "/subadmin",
  },
  {
    path: "/salereports",
    name: "Sale Reports",
    icon: <FaInfoCircle color='inherit' size={22}/>,
    component: SaleReports,
    layout: "/subadmin",
  },
  {
    path: "/sellerManagement",
    name: "Seller",
    icon: <FaInfoCircle color='inherit' size={22}/>,
    component: SupervisorSellerManagement,
    layout: "/supervisor",
  },
  {
    path: "/saleDetails",
    name: "Sale Details",
    icon: <FaInfoCircle color='inherit' size={22}/>,
    component: SupervisorSaleDetails,
    layout: "/supervisor",
  },
  {
    path: "/saleReports",
    name: "Sale Reports",
    icon: <FaInfoCircle color='inherit' size={22}/>,
    component: SuperVisorSaleReports,
    layout: "/supervisor",
  },
  {
    path: "/soldTickets",
    name: "Sold Tickets",
    icon: <FaInfoCircle color='inherit' size={22}/>,
    component: SupervisorSoldTickets,
    layout: "/supervisor",
  },
  {
    path: "/winNumber",
    name: "Win Number",
    icon: <FaInfoCircle color='inherit' size={22}/>,
    component: SupervisorWinNumber,
    layout: "/supervisor",
  },
  {
    path: "/chat",
    name: "Chat",
    icon: <FaFacebookMessenger color='inherit' size={22}/>,
    component: SubAdminChat,
    layout: "/subadmin",
  },
  // {
  //   path: "/dashboard",
  //   name: "Dashboard",
  //   icon: <HomeIcon color='inherit' />,
  //   component: Dashboard,
  //   layout: "/admin",
  // },
  {
    name: "ACCOUNT PAGES",
    category: "account",
    state: "pageCollapse",
    views: [
      {
        path: "/signin",
        name: "Sign Out",
        icon: <GoSignOut color='inherit' size={22}/>,
        component: SignIn,
        layout: "/auth",
      },
      // {
      //   path: "/signup",
      //   name: "Sign Up",
      //   icon: <RocketIcon color='inherit' />,
      //   secondaryNavbar: true,
      //   component: SignUp,
      //   layout: "/auth",
      // },
    ],
  },
];
export default dashRoutes;
