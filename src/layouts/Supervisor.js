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

// Chakra imports
import { ChakraProvider, Portal, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";
// Custom Chakra theme
import theme from "theme/themeAdmin.js";
// Custom components
import MainPanel from "../components/Layout/MainPanel";
import PanelContainer from "../components/Layout/PanelContainer";
import PanelContent from "../components/Layout/PanelContent";
import CustomNavbar from "components/CustomNavbar/CustomNavbar";
export default function Dashboard(props) {
  const { ...rest } = props;
  // ref for main panel div
  const mainPanel = React.createRef();
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== "/admin/full-screen-maps";
  };
  const getActiveRoute = (routes) => {
    let activeRoute = "";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  // This changes navbar state(fixed or not)
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar;
          }
        }
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.category === "account") {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/supervisor") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  const matchRoutes = routes.filter((route) => (route.layout == {...rest}.match.path) || route.category == "account");
  let userRole = sessionStorage.getItem("userRole");
  let isSupervisor = userRole && userRole.toLowerCase() == "supervisor";
  let supervisorCompanyName = sessionStorage.getItem("company") != "undefined" ? sessionStorage.getItem("company") : "";
  let supervisorUserName = sessionStorage.getItem("userName") != "undefined" ? sessionStorage.getItem("userName") : "";
  let navbarBrand = "";
  if(supervisorCompanyName && supervisorUserName){
    navbarBrand = `${supervisorCompanyName}(${supervisorUserName})`;
  }else if(!supervisorCompanyName && supervisorUserName){
    navbarBrand = `(${supervisorUserName})`;
  }else{
    navbarBrand = "LOTTERY SOFT";
  }
  document.documentElement.dir = "ltr";
  // Chakra Color Mode
  return (
    <ChakraProvider theme={theme} resetCss={true}>

      {
        isSupervisor && (
          <CustomNavbar
          centerLinks={
            [
              {
                text:"Main Menu",
                url:"/admin/main-menu",
                redirect:true
              }
            ]
          }
          rightLinks={
            [
              {
                text:"Logout",
                url:"/auth/signout"
              }
            ]
          } navbarBrand={`${navbarBrand}`} navbarBrandUrl="#"
          />
        )
      }
      
      <MainPanel
        ref={mainPanel}
        w={{
          base: "100%",
          // xl: !isSubAdmin && "calc(100% - 275px)",
          xl: "100%",
        }}>
        
        {getRoute() ? (
          <PanelContent>
            <PanelContainer>
              <Switch>
                {getRoutes(matchRoutes)}
                <Redirect from='/auth' to='/auth/signin' />
              </Switch>
            </PanelContainer>
          </PanelContent>
        ) : null}
      </MainPanel>
    </ChakraProvider>
  );
}
