import {createContext,useState} from "react";
import api from 'utils/customFetch';

const PaymentAlertCardContext = createContext();

const PaymentAlertCardContextProvider = (props) => {

    const [paymentAlerts,SetPaymentAlerts] = useState([]);
    
    const fetchPaymentAlerts = async (userGroup) => {
        try {
            const response = await api().get("/"+userGroup+"/getpaymentalert");
            SetPaymentAlerts(response.data.data);
        } catch (error) {
         throw error;
        }
    };

    return (
        <PaymentAlertCardContext.Provider
            value={{
                paymentAlerts,
                SetPaymentAlerts,
                fetchPaymentAlerts
            }}
        >
            {
                props.children
            }
        </PaymentAlertCardContext.Provider>
    )
};

export  {PaymentAlertCardContextProvider,PaymentAlertCardContext};