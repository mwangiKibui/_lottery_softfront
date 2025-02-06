import React from 'react';
import CustomChat from 'components/CustomChat/CustomChat';

const Chat = () => {
    let sellers = [
        { name:"Kennedy Kibui",_id:1,admin:"Ken Admin",unread:0},
        { name:"Rose Kibui",_id:2,admin:"Ken Admin",unread:0},
        { name:"Maggie Kibui",_id:3,admin:"Ken Admin",unread:0},
        { name:"John Kibui",_id:4,admin:"Ken Admin",unread:0},
        { name:"Njoki Kibui",_id:5,admin:"Ken Admin",unread:0},
    ];
    return (
        <CustomChat sellers={sellers}/>
    )
};

export default Chat;