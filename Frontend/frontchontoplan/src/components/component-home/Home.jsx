import React, {useState} from "react";
import './Home.css';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import RegisterEvent from "../component-register-event/RegisterEvent";
import ChatGPTClone from "../components-chatbot/ChontoChat";
import Progress from "../component-progress/Progress";
import EventList from "../component-list-events/List-event";

const Home = () => {
    const [events, setEvents] = useState([
        { name: 'Evento 1', date: '2024-10-01', description: 'Descripción del evento 1' },
        { name: 'Evento 2', date: '2024-10-02', description: 'Descripción del evento 2' },
    ]);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [title, setTitle] = useState("Registrar mi evento");
    const [progress, setProgress] = useState(false);

    const handleListItemClick = (e, num) => {
        setSelectedIndex(num);
        switch (num) {
            case 1:
                setTitle("Registrar mi evento");
                break;
            case 2:
                setTitle("Chontochat");
                break;
            case 3:
                setTitle("Lista de eventos");
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
            return <ChatGPTClone />;
          case 3:
            return <EventList events={events} />;
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
                        <ListItemText primary="Chontochat" />
                    </ListItemButton>
                    <ListItemButton
                    selected={selectedIndex === 3}
                    onClick={(event) => handleListItemClick(event, 3)}
                    >
                        <ListItemText primary="Lista de eventos" />
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