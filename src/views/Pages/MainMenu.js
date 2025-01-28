import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Flex,
  Text,
  VStack,
  SimpleGrid,
  Box,
  Heading,
  useBreakpointValue,
} from "@chakra-ui/react";
import { GoSignOut } from "react-icons/go";
import { ImUsers } from "react-icons/im";
import { GiPodium } from "react-icons/gi";
import { HiViewGridAdd } from "react-icons/hi";
import {
  FaUserSecret,
  FaFortAwesome,
  FaUserTie,
  FaInfoCircle,
} from "react-icons/fa";
import {
  MdFactCheck,
  MdPayments,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { SiAdblock } from "react-icons/si";
import { RiNumbersFill, RiDeleteBin5Fill } from "react-icons/ri";
import { BsTicketDetailedFill } from "react-icons/bs";
import CustomMainMenu from "components/CustomMainMenu/CustomMainMenu";

const MainMenu = () => {
  const history = useHistory();

  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Define responsive icon sizes
  const iconSize = useBreakpointValue({
    base: "20px",
    sm: "24px",
    md: "28px",
    lg: "32px",
  });

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    const name = sessionStorage.getItem("userName");
    const company = sessionStorage.getItem("company");
    setUserRole(role);
    setUserName(name);
    setCompanyName(company);

    // Fetch company name from the backend
    // axios
    //   .get("http://localhost:8080/api/company-name")
    //   .then((response) => setCompanyName(response.data.companyName))
    //   .catch((error) => console.error("Error fetching company name", error));
  }, []);

  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    history.push("/auth/signin");
  };

  const roleBasedFunctions = {
    admin: [
      {
        path: "/admin/SubAdminManagement",
        name: "SubAdmin",
        icon: ImUsers,
      },
      {
        path: "/admin/LotteryCategoryManagement",
        name: "Lottery Category",
        icon: HiViewGridAdd,
      },
      {
        path: "/admin/WinningNumberManagement",
        name: "Win Numbers",
        icon: GiPodium,
      },
      {
        path: "/admin/SubAdminSaleReport",
        name: "Sales Report",
        icon: FaInfoCircle,
      },
    ],
    subAdmin: [
      {
        path: "/subadmin/SellerManagement",
        name: "Seller",
        icon: FaUserTie,
      },
      {
        path: "/subadmin/SupervisorManagement",
        name: "Supervisor",
        icon: FaUserSecret,
      },
      {
        path: "/subadmin/paymentcondition",
        name: "Pay Condition",
        icon: MdPayments,
      },
      {
        path: "/subadmin/blocknumber",
        name: "Block Number",
        icon: SiAdblock,
      },
      {
        path: "/subadmin/addlimit",
        name: "Add Limit",
        icon: MdProductionQuantityLimits,
      },
      {
        path: "/subadmin/winningnumberviews",
        name: "Win Number",
        icon: RiNumbersFill,
      },
      {
        path: "/subadmin/PercentageLimit",
        name: "Percentage Limit",
        icon: FaInfoCircle,
      },
      {
        path: "/subadmin/soldtickets",
        name: "Sold Tickets",
        icon: MdFactCheck,
      },
      {
        path: "/subadmin/deleteticket",
        name: "Deleted Ticket",
        icon: RiDeleteBin5Fill,
      },
      {
        path: "/subadmin/winningtickets",
        name: "Win Tickets",
        icon: FaFortAwesome,
      },
      {
        path: "/subadmin/saledetails",
        name: "Sale Details",
        icon: BsTicketDetailedFill,
      },
      {
        path: "/subadmin/salereports",
        name: "Sale Reports",
        icon: FaInfoCircle,
      },
    ],
    superVisor: [
      {
        path: "/superVisor/SuperVisorSellerManagement",
        name: "Seller",
        icon: FaUserTie,
      },
      {
        path: "/superVisor/SuperVisorSaleDetails",
        name: "Sale Details",
        icon: BsTicketDetailedFill,
      },
      {
        path: "/superVisor/SuperVisorWinNumber",
        name: "Win Number",
        icon: FaFortAwesome,
      },
      {
        path: "/superVisor/SuperVisorSoldTickets",
        name: "Sold Tickets",
        icon: MdFactCheck,
      },
      {
        path: "/superVisor/SuperVisorSaleReports",
        name: "Sale Reports",
        icon: FaInfoCircle,
      },
    ],
  };

  const subAdminMenuLinks = [
    {
      text:"Sellers",
      url:"/subadmin/SellerManagement",
      icon:<FaUserTie color='white' size={18}/>,
    },
    {
      text:"Supervisors",
      url:"/subadmin/SupervisorManagement",
      icon: <FaUserSecret color='white' size={18}/>
    },
    {
      text:"Payment",
      url:"/subadmin/paymentcondition",
      icon: <MdPayments color='inherit' size={18}/>
    },
    {
      text:"blockNumber",
      url:"/subadmin/blocknumber",
      icon: <SiAdblock color='inherit' size={18}/>
    },
    {
      text:"saleLimit",
      url:"/subadmin/addlimit",
      icon: <MdProductionQuantityLimits color='inherit' size={18}/>
    },
    {
      text:"winNumbers",
      url:"/subadmin/winningnumberviews",
      icon: <RiNumbersFill color='inherit' size={18}/>
    },
    {
      text:"Tickets",
      url:"/subadmin/soldtickets",
      icon: <MdFactCheck color='inherit' size={18}/>
    },
    {
      text:"saleDetails",
      url:"/subadmin/saledetails",
      icon: <MdFactCheck color='inherit' size={18}/>
    },
    {
      text:"dltdTickets",
      url:"/subadmin/deleteticket",
      icon: <RiDeleteBin5Fill color='inherit' size={18}/>
    },
    {
      text:"winTicket",
      url:"/subadmin/winningtickets",
      icon: <FaFortAwesome color='inherit' size={18}/>
    },
    {
      text:"saleReports",
      url:"/subadmin/salereports",
      icon: <FaInfoCircle color='inherit' size={18}/>
    },
    {
      text:"Percentage",
      url:"/subadmin/PercentageLimit",
      icon: <ImUsers color='inherit' size={18}/>
    }
  ];
  const adminMenuLinks=[
    {
      text:"SubAdmin",
      url:"/admin/SubAdminManagement",
      icon:<ImUsers color='white' size={18}/>,
    },
    {
      text:"Lottery Category",
      url:"/admin/LotteryCategoryManagement",
      icon:<HiViewGridAdd color='white' size={18}/>,
    },
    {
      text:"Winning Numbers",
      url:"/admin/WinningNumberManagement",
      icon:<GiPodium color='white' size={18}/>,
    },
    {
      text:"Sales Report",
      url:"/admin/SubAdminSaleReport",
      icon:<FaInfoCircle color='white' size={18}/>,
    },
  ];
  const superVisorMenuLinks=[
    {
      text:"Seller",
      url:"/superVisor/SuperVisorSellerManagement",
      icon:<FaUserTie color='white' size={18}/>,
    },
    {
      text:"Sale Details",
      url:"/superVisor/SuperVisorSaleDetails",
      icon:<BsTicketDetailedFill color='white' size={18}/>,
    },
    {
      text:"Win Number",
      url:"/superVisor/SuperVisorWinNumber",
      icon:<FaFortAwesome color='white' size={18}/>,
    },
    {
      text:"Sold Tickets",
      url:"/superVisor/SuperVisorSoldTickets",
      icon:<MdFactCheck color='white' size={18}/>,
    },
    {
      text:"Sale Reports",
      url:"/superVisor/SuperVisorSaleReports",
      icon:<FaInfoCircle color='white' size={18}/>,
    }
  ];


  let menuLinks = [];
  let adminMenus = false;
  if(userRole && userRole.toLowerCase() == "admin"){
    menuLinks = adminMenuLinks;
    adminMenus = true;
  }else if(userRole && userRole.toLowerCase() == "supervisor"){
    menuLinks = superVisorMenuLinks;
    adminMenus = true;
  }else if(userRole && userRole.toLowerCase() == "subadmin"){
    menuLinks = subAdminMenuLinks;
  }

  return (
    <CustomMainMenu 
      menuLinks = {
        menuLinks
      }
      adminMenus={adminMenus}
    />
  )
};

export default MainMenu;
