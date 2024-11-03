import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import './Home.css';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import RegisterEvent from "../component-register-event/RegisterEvent";
import ChatGPTClone from "../components-chatbot/ChontoChat";
import Progress from "../component-progress/Progress";

const Home = () => {
    const { logout } = useAuth0(); // Importamos la función de logout de Auth0
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
            default:
                console.log("error :c" + num);
                break;
        }
    };

    const renderComponent = () => {
        switch (selectedIndex) {
            case 1:
                return <RegisterEvent />;
            case 2:
                return <ChatGPTClone />;
            default:
                return <div>Select a component</div>;
        }
    };

    return (
        <div className="container-home">
            {progress ? <Progress /> : null}
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
                </List>
                {/* Botón de logout */}
                <button onClick={() => logout({ returnTo: window.location.origin })} className="logout-button">
                    Cerrar sesión
                </button>
            </div>
            <div className="container-right">
                {renderComponent()}
            </div>
        </div>
    );
};

export default Home;
