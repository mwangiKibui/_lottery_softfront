import React,{useState,useRef} from 'react';
import PropTypes from 'prop-types';
import {useToast} from '@chakra-ui/react';
import './CustomChat.css';
import api from 'utils/customFetch';
import { identifier } from 'stylis';

const CustomChat = (props) => {

    const toast = useToast();
    const [messages,setMessages] = useState([]);
    const [isRecording,setIsRecording] = useState(false);
    const [receiverId,setReceiverId] = useState("");
    const [composeMessage, setComposeMessage] = useState("");
    const [composeRecording, setComposeRecording] = useState("");
    const [composeFile, setComposeFile] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [broadcastMessageBtnTitle, setBroadcaseMessageBtnTitle] = useState("Broadcast Message");
    const [composeMessageBtnTitle, setComposeMessageBtnTitle] = useState("Send");
    const [broadcastRecording, setBroadCastRecording] = useState("");
    const [broadcastFile, setBroadcastFile] = useState("");
    let [mediaRecorder, setMediaRecorder] = useState(null);
    const composeFileInputRef = useRef();
    const broadcastFileInputRef = useRef();

    let currentLoggedInUserId = sessionStorage.getItem("userId");
    let audioChunks = [];
    let currentLoggedInUser = {
        "name":sessionStorage.getItem("userName")
    };

    const handleBroadCastMessage = async () => {
        if(broadcastMessage || broadcastFile || broadcastRecording){
            setBroadcaseMessageBtnTitle("Broadcasting Message...");
            let formData = new FormData();
            formData.append("content",broadcastMessage);
            if(broadcastRecording){
                formData.append("type", "voice");
                formData.append("file",broadcastRecording,"recording.wav");
            }else if(broadcastFile){
                formData.append("type", "file");
                formData.append("file",broadcastFile);
            }else{
                formData.append("type", "text");
            }
            try{
                let response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/subadmin/broadcastMessage",{
                    method:"POST",
                    body:formData,
                    headers:{
                        "Authorization": "Bearer " + sessionStorage.getItem("token"),
                        // "Content-Type": "multipart/form-data"
                    }
                });

                response = await response.json();

                console.log("compose response from here ",response);

                // reset the form.
                setBroadcastMessage("");
                setBroadCastRecording(null);
                setBroadcastFile(null);

                if(broadcastFileInputRef.current){
                    broadcastFileInputRef.current.value = null;
                }
            }catch(error){
                console.log("an error occurred "+ error);
                let errorMessage = "An error occurred broadcasting message. " + error.message;
                // setErrorMessage(errorMessage);
                toast({
                    title: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
            }
            setBroadcaseMessageBtnTitle("Broadcast Message");
        }else{
            return;
        }
    }

    const goBackToDashboard = () => {
        window.location.replace(props.backToDashboardUrl);
    }

    const sendMessage = async () => {
        if(composeMessage || composeRecording || composeFile){
            setComposeMessageBtnTitle("Sending...");
            let formData = new FormData();
            formData.append("content",composeMessage);
            if(composeRecording){
                formData.append("type", "voice");
                formData.append("file",composeRecording,"recording.wav");
            }else if(composeFile){
                formData.append("type", "file");
                formData.append("file",composeFile);
            }else{
                formData.append("type", "text");
            }
            formData.append('receiverId',receiverId);

            try{
                let response = await fetch(process.env.REACT_APP_BACKEND_URL + "/api/subadmin/sendmessage",{
                    method:"POST",
                    body:formData,
                    headers:{
                        "Authorization": "Bearer " + sessionStorage.getItem("token"),
                        // "Content-Type": "multipart/form-data"
                    }
                });

                response = await response.json();

                console.log("compose response from here ",response);

                // add to the list of messages.
                let newMessage = {
                    senderId: currentLoggedInUserId,
                    sender: currentLoggedInUser,
                    receiverId: receiverId,
                    message: composeMessage,
                    fileUrl: composeFile ? URL.createObjectURL(composeFile) : null,
                    voiceUrl: composeRecording ? URL.createObjectURL(composeRecording) : null,
                    cache: true
                };

                setMessages([...messages, newMessage]);

                // reset the form.
                setComposeMessage("");
                setComposeRecording(null);
                setComposeFile(null);

                if(composeFileInputRef.current){
                    composeFileInputRef.current.value = null;
                }


            }catch(error){
                console.log("an error occurred "+ error);
                let errorMessage = "An error occurred sending message. " + error.message;
                // setErrorMessage(errorMessage);
                toast({
                    title: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
            }
            setComposeMessageBtnTitle("Send");
        }else{
            // cannot submit empty.
            return;
        }
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
        const recorder = new MediaRecorder(stream);

        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };


        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        //   const audioUrl = URL.createObjectURL(audioBlob);
          setComposeRecording(audioBlob);
        //   const sellerName = document.getElementById('chat-header').textContent.replace('Chat with ', '');
        //   const seller = sellers.find(s => s.name === sellerName);
        //   seller.messages.push({ type: 'voice', sender: 'You', content: audioUrl });
        //   openChat(sellerName);
        };
        recorder.start();
        setIsRecording(true);
        document.getElementById('recordButton').style.backgroundColor = '#ff4d4d'; // Change color when recording
    }

    const startBroadcastRecording = async () => {
        audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        //   const audioUrl = URL.createObjectURL(audioBlob);
          setBroadCastRecording(audioBlob);

         
        //   sellers.forEach(seller => {
        //     seller.messages.push({ type: 'voice', sender: 'Broadcast', content: audioUrl });
        //     seller.unread++;
        //   });
        //   displaySellers();
        };
        recorder.start();
        setIsRecording(true);
        document.getElementById('recordBroadcastButton').style.backgroundColor = '#ff4d4d'; // Change color when recording
    }

    const toggleBroadcastRecording = () => {
        console.log("we are here for broad cast recording......");
        if (!isRecording) {
          startBroadcastRecording();
        } else {
          stopRecording();
        }
      }

    const stopRecording = () => {
        mediaRecorder.stop();
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
        // reset the messages.
        setMessages([]);
        const seller = props.sellers.find(s => s._id == id);

        // fetch the messages.
         api().get('subadmin/getMessages?senderId='+id)
            .then(response => {
                let messagesData = response.data.map((message) => {
                    let messageFromCurrentUser = message.senderId == currentLoggedInUserId ? true : false;
                    let senderName = messageFromCurrentUser ? currentLoggedInUser.name : seller.name;
                    return {
                        ...message,
                        sender:{
                            name: senderName
                        }
                    }
                });

                setMessages(messagesData);
            })
            .catch(error => console.error('Error fetching messages ', error));

        //seller.unread = 0; // Reset unread messages
        //displaySellers();
        
        // set the receiver id.
        setReceiverId(id);

        
        setMessages(messages);
    
        // Update the chat header
        document.getElementById('chat-header').textContent = `Chat with ${seller.name}`;
    
        // Switch to the chat page
        document.getElementById('dashboard-page').style.display = 'none';
        document.getElementById('chat-page').style.display = 'block';
    }

    const formatDateToCustom = (dateStr) => {
        const date = new Date(dateStr);
      
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
      
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
      
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 -> 12 for AM
      
        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      
        return `${day}/${month}/${year} ${formattedTime}`;
    }
    
    const hasPreview = (fileUrl) => {
        return fileUrl.includes("png") || fileUrl.includes("jpg") || fileUrl.includes("jpeg") || fileUrl.includes("gif") || fileUrl.includes("webp");
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
                    <input type="text" id="broadcastMessage" value={broadcastMessage} placeholder="Type a broadcast message" onChange={(e) => setBroadcastMessage(e.target.value)}/>
                    <input type="file" id="broadcastFile" ref={broadcastFileInputRef} onChange={(e) => setBroadcastFile(e.target.files[0])}/>
                    <div className="broadcast-section-btns">
                        <button id="recordBroadcastButton" title="Record Voice" onClick={toggleBroadcastRecording}></button>
                        <button onClick={() => handleBroadCastMessage()}>{broadcastMessageBtnTitle}</button>
                    </div>
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
                                    return <div key={msg._id} className={`message ${msg.senderId === currentLoggedInUserId ? 'user' : 'other'}`}>
                                        {msg.sender.name}: {msg.message}
                                        <span className='message-date'>{formatDateToCustom(msg.timestamp)}</span>
                                    </div>;
                                } else if (msg.fileUrl) {
                                    let downloadUrl = msg.cache ? msg.fileUrl : process.env.REACT_APP_BACKEND_URL + "/" + msg.fileUrl;
                                    return <div key={msg._id}  className={`message ${msg.senderId === currentLoggedInUserId ? 'user' : 'other'}`}>

                                        {msg.sender.name}:
                                        
                                        {
                                            hasPreview(downloadUrl) ? (
                                                <img src={downloadUrl} height="200px" width="200px" alt="Chat">
                                                </img>
                                            ) : (
                                                <a href={downloadUrl} target="_blank">Download File</a>
                                            )
                                        }
                                         


                                        <span className='message-date'>{formatDateToCustom(msg.timestamp)}</span>
                                    </div>
                                } else if (msg.voiceUrl) {
                                    let downloadUrl = msg.cache? msg.voiceUrl : process.env.REACT_APP_BACKEND_URL + "/" + msg.voiceUrl;
                                    return <div key={msg._id}  className={`message ${msg.senderId === currentLoggedInUserId ? 'user' : 'other'}`}>
                                        {msg.sender.name}: <span className="voice-message" onClick={() => playVoiceMessage(downloadUrl)}>Play Voice Message</span>
                                        <span className='message-date'>{formatDateToCustom(msg.timestamp)}</span>
                                    </div>
                                }
                            })
                        }
                    </div>
                </div>
                <div className="chat-input">
                    <input type="text" id="chatInput"  value={composeMessage} placeholder="Type a message" onChange={e => setComposeMessage(e.target.value)} />
                    <input type="file" id="fileUpload" name="file" ref={composeFileInputRef} onChange={e => setComposeFile(e.target.files[0])}/>
                    <div className="chat-input-btns">
                        <button id="recordButton" title="Record Voice" onClick={() => toggleRecording()}></button>
                        <button onClick={() => sendMessage()}>{composeMessageBtnTitle}</button>
                    </div>
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