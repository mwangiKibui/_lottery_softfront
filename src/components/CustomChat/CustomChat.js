import React,{useState} from 'react';
import PropTypes from 'prop-types';
import './CustomChat.css';

const CustomChat = (props) => {

    const [messages,setMessages] = useState([]);
    const [isRecording,setIsRecording] = useState(false);
    const [composeMessage, setComposeMessage] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");

    let currentLoggedInUserId = 12;
    let audioChunks = [];
    let mediaRecorder;

    const broadCastMessage = () => {
        console.log("Hello, we will be broadcasting the message from here....");

        console.log("below is the composed message");

        console.log(broadcastMessage);
    }

    const goBackToDashboard = () => {
        window.location.replace(props.backToDashboardUrl);
    }

    const sendMessage = () => {
        console.log("We will send the message.")

        console.log("below is the composed message ");
        console.log(composeMessage);
    }
    
    const toggleRecording = () => {
        if (!isRecording) {
          startRecording();
        } else {
          stopRecording();
        }
    }

    const startRecording = async() => {
        audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setComposeMessage(audioUrl);
        //   const sellerName = document.getElementById('chat-header').textContent.replace('Chat with ', '');
        //   const seller = sellers.find(s => s.name === sellerName);
        //   seller.messages.push({ type: 'voice', sender: 'You', content: audioUrl });
        //   openChat(sellerName);
        };
        mediaRecorder.start();
        setIsRecording(true);
        document.getElementById('recordButton').style.backgroundColor = '#ff4d4d'; // Change color when recording
    }

    const startBroadcastRecording = async () => {
        audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setBroadcastMessage(audioUrl);
        //   sellers.forEach(seller => {
        //     seller.messages.push({ type: 'voice', sender: 'Broadcast', content: audioUrl });
        //     seller.unread++;
        //   });
        //   displaySellers();
        };
        mediaRecorder.start();
        setIsRecording(true);
        document.getElementById('recordBroadcastButton').style.backgroundColor = '#ff4d4d'; // Change color when recording
    }

    const toggleBroadcastRecording = () => {
        if (!isRecording) {
          startBroadcastRecording();
        } else {
          stopRecording();
        }
      }

    const stopRecording = () => {
        console.log('the media recorder ',mediaRecorder);
        // mediaRecorder.stop();
        setIsRecording(false);
        document.getElementById('recordButton').style.backgroundColor = '#4a90e2'; // Reset color for chat
        document.getElementById('recordBroadcastButton').style.backgroundColor = '#4a90e2'; // Reset color for broadcast
    }
      

    const playVoiceMessage = (url) => {
        if(url){
            const audio = new Audio(url);
            audio.volume = 1;
            audio.play();
        }else{
            return;
        }
    }

    const openChat = (id) => {
        const seller = props.sellers.find(s => s._id == id);
        //seller.unread = 0; // Reset unread messages
        //displaySellers();
        

        // fetch the messages.
        let messages = [
            {
                _id:1,
                message:"Hi",
                senderId: 12,
                sender:{
                    name:"ken"
                }
            },
            {
                _id:2,
                fileUrl:"chat/file-1738828847791.jpg",
                message:"Kindly see this attachment",
                senderId: 11,
                sender:{
                    name:"john"
                }
            },
            {
                _id:3,
                voiceUrl:"chat/file-1738829099436.wav",
                message:"This is my recording",
                senderId: 12,
                sender:{
                    name:"ken"
                }
            }
        ];
        setMessages(messages);
    
        // Update the chat header
        document.getElementById('chat-header').textContent = `Chat with ${seller.name}`;
    
        // Switch to the chat page
        document.getElementById('dashboard-page').style.display = 'none';
        document.getElementById('chat-page').style.display = 'block';
    }

    return (
        <div id="chat-section">
            <div id="dashboard-page">
                {/* <header>
                    <div className="headerText">
                        <h4>Admin Dashboard</h4>
                    </div>
                </header> */}

                <div className="broadcast-section">
                    <input type="text" id="broadcastMessage" placeholder="Type a broadcast message" />
                    <input type="file" id="broadcastFile" />
                    <button id="recordBroadcastButton" title="Record Voice" onClick={() => toggleBroadcastRecording}></button>
                    <button onClick={() => broadCastMessage()}>Broadcast Message</button>
                </div>

                <table id="sellersTable">
                    <thead>
                        <tr>
                            <th>Seller Name</th>
                            <th>Admin Name</th>
                            <th>Seller Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            props.sellers.map((seller) => {
                                return (
                                    <tr key={seller._id}>
                                        <td>{seller.name}</td>
                                        <td>{seller.admin}</td>
                                        <td><button onClick={() => openChat(seller._id)}>Messages (0)</button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                <tbody>
                </tbody>
                </table>
            </div>

            <div id="chat-page" style={{display:"none"}}>
                <header>
                    <h4 id="chat-header"></h4>
                    <button onClick={() => goBackToDashboard()}>Back to Dashboard</button>
                </header>

                <div className="chat-container">
                    <div className="chat-messages" id="chatMessages">
                        {
                            messages.map((msg) => {
                                if(!msg.voiceUrl && !msg.fileUrl){
                                    return <div key={msg._id} className={`message ${msg.senderId === currentLoggedInUserId ? 'user' : 'other'}`}>{msg.sender.name}: {msg.message} </div>;
                                } else if (msg.fileUrl) {
                                    return <div key={msg._id}  className={`message ${msg.senderId === currentLoggedInUserId ? 'user' : 'other'}`}>{msg.sender.name}: <a href={process.env.REACT_APP_BACKEND_URL + "/" + msg.fileUrl} target="_blank">Download File</a></div>
                                } else if (msg.voiceUrl) {
                                    return <div key={msg._id}  className={`message ${msg.senderId === currentLoggedInUserId ? 'user' : 'other'}`}>{msg.sender.name}: <span className="voice-message" onClick={() => playVoiceMessage(process.env.REACT_APP_BACKEND_URL + '/' + msg.voiceUrl)}>Play Voice Message</span></div>
                                }
                            })
                        }
                    </div>
                </div>
                <div className="chat-input">
                    <input type="text" id="chatInput" placeholder="Type a message" />
                    <input type="file" id="fileUpload" />
                    <button id="recordButton" title="Record Voice" onClick={() => toggleRecording()}></button>
                    <button onClick={() => sendMessage()}>Send</button>
                </div>
            </div>
        </div>
    )
};

CustomChat.propTypes = {
    sellers: PropTypes.arrayOf(PropTypes.object),
    backToDashboardUrl : PropTypes.string,
};

CustomChat.defaultProps = {
    backToDashboardUrl:"/admin/main-menu"
}

export default CustomChat;