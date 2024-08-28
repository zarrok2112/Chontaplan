import React, {useState} from "react";
import './Home.css';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import RegisterEvent from "../component-register-event/RegisterEvent";
import ChatBot from "../component-chat-bot/ChatBot";
import Progress from "../component-progress/Progress";

const Home = () => {
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [title, setTitle] = useState("Registrar mi evento");
    const [progress, setProgress] = useState(true);

    const handleListItemClick = (e, num) => {
        setSelectedIndex(num);
        switch (num) {
            case 1:
                setTitle("Registrar mi evento");
                break;
            case 2:
                setTitle("ChatBot");
                break;
            default:
                console.log("error :c" +num)
                break;
          }
    }

    const renderComponent = () => {
        switch (selectedIndex) {
          case 1:
            return <RegisterEvent />;
          case 2:
            return <ChatBot />;
          default:
            return <div>Select a component</div>;
        }
      };

    
                
    return(
        
        <div className="container-home">
            {progress ? <Progress /> : <></>}
            <div className="container-left">
                <h1>{title}</h1>
                <List component="nav" aria-label="secondary mailbox folder">
                    <ListItemButton
                    selected={selectedIndex === 1}
                    onClick={(event) => handleListItemClick(event, 1)}
                    >
                        <ListItemText primary="Registrar mi evento" />
                    </ListItemButton>
                    <ListItemButton
                    selected={selectedIndex === 2}
                    onClick={(event) => handleListItemClick(event, 2)}
                    >
                        <ListItemText primary="ChatBot" />
                    </ListItemButton>
                </List>
            </div>
            <div className="container-right">
                {renderComponent()}
            </div>
            
        </div>
    );
}

export default Home;