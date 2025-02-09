import React,{useEffect,useState} from 'react';
import api from 'utils/customFetch';
import CustomChat from 'components/CustomChat/CustomChat';

const Chat = () => {

    const [sellers,setSellers] = useState([]);

    useEffect( () => {
        // fetch sellers from the api
        api().get('subadmin/getseller')
           .then(response => {
                let sellersData = response.data.users.map(usr => {
                    return {
                        name: usr.userName,
                        _id: usr._id,
                        admin: sessionStorage.getItem('userName'),
                        unread: 0
                    }
                });

                setSellers(sellersData);
           })
           .catch(error => console.error('Error fetching sellers ', error));
    },[]);
    
    return (
        <CustomChat sellers={sellers} backToDashboardUrl="/subadmin/chat"/>
    )
};

export default Chat;