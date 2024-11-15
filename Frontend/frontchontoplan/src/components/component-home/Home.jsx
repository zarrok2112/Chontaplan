import React, { useState } from "react";
import {Box,Drawer,AppBar,Toolbar,Typography,List,ListItem,ListItemButton,ListItemIcon,ListItemText,CssBaseline,Divider,} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import RegisterEvent from "../component-register-event/RegisterEvent";
import ChatGPTClone from "../components-chatbot/ChontoChat";
import Progress from "../component-progress/Progress";
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Home = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [title, setTitle] = useState("Registrar mi evento");
  const [progress, setProgress] = useState(false);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    switch (index) {
      case 0:
        setTitle("Registrar mi evento");
        break;
      case 1:
        setTitle("Chontochat");
        break;
      default:
        setTitle("Selecciona una opción");
        break;
    }
  };

  const handleCerrarSession = () => {
    navigate('/');
  }

  const renderComponent = () => {
    switch (selectedIndex) {
      case 0:
        return <RegisterEvent />;
      case 1:
        return <ChatGPTClone />;
      default:
        return <Typography variant="h6">Selecciona una opción del menú</Typography>;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Barra de Navegación Superior */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#2D6A4F",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer (Barra Lateral) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#2D6A4F",
            color: "#FFFFFF",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {/* Opción 1: Registrar Evento */}
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedIndex === 0}
                onClick={(event) => handleListItemClick(event, 0)}
              >
                <ListItemIcon sx={{ color: "#FFFFFF" }}>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText primary="Registrar mi evento" />
              </ListItemButton>
            </ListItem>

            {/* Opción 2: Chontochat */}
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedIndex === 1}
                onClick={(event) => handleListItemClick(event, 1)}
              >
                <ListItemIcon sx={{ color: "#FFFFFF" }}>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText primary="Chontochat" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            {/* Botón de Cerrar Sesión */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  handleCerrarSession()
                }
              >
                <ListItemIcon sx={{ color: "#FFFFFF" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar sesión" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#F9A826",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {progress && <Progress />}
        {renderComponent()}
      </Box>
    </Box>
  );
};

export default Home;