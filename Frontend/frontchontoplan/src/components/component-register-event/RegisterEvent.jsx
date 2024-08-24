import React from "react";
import './RegisterEvent.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const RegisterEvent = () => {
    return(
        <div className="container-calendar-events">
                    <div className="container-top">
                        <div className="container-calendar">
                            Calendario mateo
                        </div>
                    </div>
                    <div className="container-bottom">
                        <div className="container-events">
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Proximo evento"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Proximo evento"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Proximo evento"
                                />
                            </ListItem>
                        </List>
                        </div>
                    </div>
                </div>
    )
};

export default RegisterEvent;