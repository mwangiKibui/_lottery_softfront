import CustomStats from 'components/CustomStats/CustomStats';
import MainMenuLinks from 'components/MainMenuLinks/MainMenuLinks';
import React, { useState,useEffect } from 'react';
import {useToast} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import api from 'utils/customFetch';
import './CustomMainMenu.css';

const CustomMainMenu = ({menuLinks,adminMenus}) => {
    const [paymentAlerts,setPaymentAlerts] = useState([]);
    let userRole = sessionStorage.getItem("userRole")?.toLowerCase();
    const toast = useToast();
    const fetchSubAdminAlerts = async () => {
      try{
        const response = await api().get("/subadmin/getpaymentalert");
        setPaymentAlerts(response.data.data);
      }catch(error)
      {
        console.error(error);
        toast({
        title: "Error fetching payment alerts",
        status: "error",
        duration: 5000,
        isClosable: true,
        });
      }
           
   }

    useEffect(async () => {
      if(userRole == "subadmin")
      {
       await fetchSubAdminAlerts();
      }
      
    },[]);


    return (
       <>
        {
          paymentAlerts.map((paymentAlert) => (
            <div key={paymentAlert._id} className='payment-alert-banner'>
              <p>{paymentAlert.message}</p>
            </div>
          ))
        }
        <MainMenuLinks links={menuLinks} adminMenus={adminMenus}/>
       </>
    )
};

CustomMainMenu.propTypes = {
  menuLinks:  PropTypes.arrayOf(PropTypes.object),
  adminMenus: PropTypes.bool
}

CustomMainMenu.defaultProps = {
  adminMenus: false
}

export default CustomMainMenu;