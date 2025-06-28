
import { useToast } from '@chakra-ui/react';

import {useState,useEffect,useContext} from 'react';
import api from 'utils/customFetch';
import './PaymentAlertCard.css';
import {PaymentAlertCardContext} from './PaymentAlertCardContext';


const PaymentAlertForm = () => {

    const [company,SetCompany] = useState("");
    const [message,SetMessage] = useState("");
    const [date,SetDate] = useState("");
    const [subAdmins,setSubAdmins] = useState([]);
    const [submitLabel,SetSubmitLabel] = useState("Send");
    const [loading,setLoading] = useState(false);
    const {paymentAlerts,SetPaymentAlerts} = useContext(PaymentAlertCardContext);
    const toast = useToast();

    useEffect(async () => {
      try{
        setLoading(true);
        const response = await api().get("/admin/getsubadmin");

        setSubAdmins(response.data);
      }catch (error) {
        console.error(error);
        toast({
          title: "Error fetching companies",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }finally{
        setLoading(false);
      }
    },[]);
    

    const handleSubmit = e => {
        e.preventDefault();
        let body = {
          company,
          message,
          date
        };
        SetSubmitLabel("Sending...");
        api()
        .post(`/admin/addpaymentalert`, {
          ...body
        })
        .then((res) => {
          SetPaymentAlerts([...paymentAlerts,{
            ...res.data,
            company:subAdmins.find(subAdmin => subAdmin._id == company)?.companyName
          }]);
          toast({
            title: "Payment Alert created.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          SetSubmitLabel("Send");
          SetCompany("");
          SetMessage("");
          SetDate("");
        })
        .catch((err) => {
          toast({
            title: "Error creating payment alert.",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          SetSubmitLabel("Send");
        });
    }
    return (
            <form className="payment-card-header-form" onSubmit={handleSubmit}>
                <div className="payment-card-form-content">
                    <label htmlFor="company">Company:</label>
                    <select required name="company" value={company} onChange={e => SetCompany(e.target.value)} >
                      <option value="">
                        {
                          loading ? "Fetching companies" : "Select Company"
                        }
                      </option>
                      {
                        subAdmins.map((subadmin) => (
                          <option key={subadmin._id} value={subadmin._id}>{subadmin.companyName}</option>
                        ))
                      }
                    </select>
                </div>

                <div className="payment-card-form-content">
                    <label htmlFor="message">Message:</label>
                    <textarea name="message" value={message} onChange={e => SetMessage(e.target.value)} cols={30}/>
                </div>

                <div className="payment-card-form-content">
                    <label htmlFor="date">Date:</label>
                    <input name="date"  type="date" value={date} onChange={e => SetDate(e.target.value)} />
                </div>

                <button type="submit" className="cc-form-submit">{submitLabel}</button>

            </form>


        
    )
};

export default PaymentAlertForm;