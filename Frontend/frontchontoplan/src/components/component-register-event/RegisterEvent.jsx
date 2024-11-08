// src/components/component-register-event/RegisterEvent.jsx

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Box,Grid,List,ListItem,ListItemText,Button,Dialog,DialogTitle,DialogContent,DialogActions,TextField,Select,MenuItem,InputLabel,FormControl,IconButton,Typography,Paper,Stack,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import services from "../../services/services";
import Progress from "../component-progress/Progress";
import { useDispatch, useSelector } from "react-redux";
import { showAlert } from "../../store/reducerAlert/alertSlice";
import chontadurin from '../../assets/chontadurin.png';

moment.locale("es");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Todo el día",
  previous: "<",
  next: ">",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango",
  showMore: (total) => `+ Ver más (${total})`,
};

// Mapeo de tipos de eventos actualizado
const eventTypeMap = {
  1: "Académico",
  2: "Artístico",
  3: "Deportivo",
  4: "Otro",
};

const getEventTypeName = (eventType) => {
  return eventTypeMap[eventType] || "Desconocido";
};

const RegisterEvent = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: null,
    end: null,
    type: "",
    location: "",
    description: "",
    briefDescription: "",
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const token = useSelector((state) => state.token.value);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progress, setProgress] = useState(false);

  const dispatch = useDispatch();

  // Estado para la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      const response = await services.getEvents(token);
      if (response.status === 200) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
      dispatch(
        showAlert({
          type: "error",
          message: "No se pudieron obtener los eventos.",
        })
      );
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      ...newEvent,
      start,
      end,
    });
    setShowCreateDialog(true);
  };

  const handleCreateButtonClick = () => {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      9,
      0
    ); // 9 AM
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      10,
      0
    ); // 10 AM
    setNewEvent({
      title: "",
      start,
      end,
      type: "",
      location: "",
      description: "",
      briefDescription: "",
    });
    setShowCreateDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Si el campo es 'type', conviértelo a entero
    if (name === "type") {
      newValue = parseInt(value, 10);
    }

    setNewEvent({
      ...newEvent,
      [name]: newValue,
    });
  };

  const handleCreateEvent = async () => {
    // Validar campos requeridos
    if (!newEvent.title || !newEvent.type || !newEvent.start || !newEvent.end) {
      dispatch(
        showAlert({
          type: "error",
          message: "Por favor, completa todos los campos requeridos.",
        })
      );
      return;
    }

    setProgress(true);

    const dataEvent = {
      name: newEvent.title,
      event_type: newEvent.type,
      description: newEvent.description,
      event_start_datetime: moment(newEvent.start).format(
        "YYYY-MM-DDTHH:mm:ss"
      ),
      event_end_datetime: moment(newEvent.end).format("YYYY-MM-DDTHH:mm:ss"),
      brief_description: newEvent.briefDescription,
      location: newEvent.location,
    };

    try {
      const response = await services.registerEvent(token, dataEvent);
      setProgress(false);
      if (response.status === 201) {
        dispatch(
          showAlert({
            type: "success",
            message: "El evento se creó exitosamente!",
          })
        );
        setShowCreateDialog(false);
        // Actualiza la lista de eventos
        setEvents([...events, response.data]);
      }
    } catch (error) {
      setProgress(false);
      dispatch(
        showAlert({
          type: "error",
          message: "El evento no se creó exitosamente!",
        })
      );
      console.error("Error al crear el evento:", error.response?.data || error);
    }
  };

  const handleEventClick = (event) => {
    const formattedEvent = {
      ...event,
      event_type_name: getEventTypeName(event.event_type),
    };

    setSelectedEvent(formattedEvent);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedEvent(null);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const handleDeleteEvent = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      setProgress(true);
      try {
        const response = await services.deleteEvent(token, selectedEvent.id);
        setProgress(false);
        if (response.status === 204) {
          dispatch(
            showAlert({
              type: "success",
              message: "El evento se eliminó exitosamente!",
            })
          );
          // Actualiza la lista de eventos
          setEvents(events.filter((event) => event.id !== selectedEvent.id));
          handleClosePopup();
        }
      } catch (error) {
        setProgress(false);
        dispatch(
          showAlert({
            type: "error",
            message: "El evento no se pudo eliminar.",
          })
        );
        console.error("Error al eliminar el evento:", error);
      }
    }
  };

  const handleEditEvent = () => {
    setEditEvent({
      ...selectedEvent,
      title: selectedEvent.name,
      start: new Date(selectedEvent.event_start_datetime),
      end: new Date(selectedEvent.event_end_datetime),
      type: selectedEvent.event_type,
      location: selectedEvent.location,
      description: selectedEvent.description,
      briefDescription: selectedEvent.brief_description,
    });
    setShowEditDialog(true);
    setShowPopup(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Si el campo es 'type', conviértelo a entero
    if (name === "type") {
      newValue = parseInt(value, 10);
    }

    setEditEvent({
      ...editEvent,
      [name]: newValue,
    });
  };

  const handleUpdateEvent = async () => {
    // Validar campos requeridos
    if (
      !editEvent.title ||
      !editEvent.type ||
      !editEvent.start ||
      !editEvent.end
    ) {
      dispatch(
        showAlert({
          type: "error",
          message: "Por favor, completa todos los campos requeridos.",
        })
      );
      return;
    }

    setProgress(true);

    const dataEvent = {
      name: editEvent.title,
      event_type: editEvent.type,
      description: editEvent.description,
      event_start_datetime: moment(editEvent.start).format(
        "YYYY-MM-DDTHH:mm:ss"
      ),
      event_end_datetime: moment(editEvent.end).format("YYYY-MM-DDTHH:mm:ss"),
      brief_description: editEvent.briefDescription,
      location: editEvent.location,
    };

    try {
      const response = await services.updateEvent(
        token,
        editEvent.id,
        dataEvent
      );
      setProgress(false);
      if (response.status === 200) {
        dispatch(
          showAlert({
            type: "success",
            message: "El evento se actualizó exitosamente!",
          })
        );
        setShowEditDialog(false);
        // Actualiza la lista de eventos
        setEvents(
          events.map((event) =>
            event.id === editEvent.id ? response.data : event
          )
        );
      }
    } catch (error) {
      setProgress(false);
      dispatch(
        showAlert({
          type: "error",
          message: "El evento no se pudo actualizar.",
        })
      );
      console.error("Error al actualizar el evento:", error);
    }
  };

  // Filtrar eventos según la categoría seleccionada
  const filteredEvents = events.filter((event) => {
    const eventTypeName = getEventTypeName(event.event_type);
    if (selectedCategory === "Todos") {
      return true;
    }
    return eventTypeName === selectedCategory;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) =>
      new Date(a.event_start_datetime) - new Date(b.event_start_datetime)
  );
  const upcomingEvents = sortedEvents
    .filter((event) => new Date(event.event_start_datetime) >= new Date())
    .slice(0, 3);

  return (
    <Box className="container-calendar-events" sx={{ p: 3 }}>
      {progress && <Progress />}
      {/* Encabezado Mejorado */}
      <Box className="container-top" sx={{ textAlign: "center", mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item>
            <img src={chontadurin} alt="Logo Chontaplan" style={{ width: '60px', height: '60px' }} />
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'Pacifico, cursive', color: '#2D6A4F' }}>
              Calendario Chontaplan
            </Typography>
          </Grid>
        </Grid>
      </Box>


      {/* Menú de categorías */}
      <Box
        className="category-menu"
        sx={{ display: "flex", justifyContent: "center", mb: 4 }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant={selectedCategory === "Todos" ? "contained" : "outlined"}
            onClick={() => setSelectedCategory("Todos")}
          >
            Todos
          </Button>
          <Button
            variant={
              selectedCategory === "Académico" ? "contained" : "outlined"
            }
            onClick={() => setSelectedCategory("Académico")}
          >
            Académico
          </Button>
          <Button
            variant={
              selectedCategory === "Artístico" ? "contained" : "outlined"
            }
            onClick={() => setSelectedCategory("Artístico")}
          >
            Artístico
          </Button>
          <Button
            variant={
              selectedCategory === "Deportivo" ? "contained" : "outlined"
            }
            onClick={() => setSelectedCategory("Deportivo")}
          >
            Deportivo
          </Button>
        </Stack>
      </Box>

      {/* Botón para crear un nuevo evento */}
      <Box
        className="event-creation-section"
        sx={{ display: "flex", justifyContent: "center", mb: 4 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateButtonClick}
        >
          Crear nuevo evento
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Calendario */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor={(event) => new Date(event.event_start_datetime)}
              endAccessor={(event) => new Date(event.event_end_datetime)}
              style={{ height: 500 }}
              messages={messages}
              onSelectSlot={handleSelectSlot}
              selectable
              onSelectEvent={handleEventClick}
              components={{
                event: CustomEvent,
              }}
              views={["month", "week", "day", "agenda"]}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
            />
          </Paper>
        </Grid>

        {/* Lista de próximos eventos */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom align="center">
              Próximos Eventos
            </Typography>
            <List>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${event.name}`}
                      secondary={`${moment(event.event_start_datetime).format(
                        "LLL"
                      )} - Tipo: ${
                        getEventTypeName(event.event_type) || "Desconocido"
                      }`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No hay próximos eventos" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Popup de detalles del evento */}
      {showPopup && selectedEvent && (
        <Dialog
          open={showPopup}
          onClose={handleClosePopup}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {selectedEvent.name}
            <IconButton
              aria-label="close"
              onClick={handleClosePopup}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              <strong>Tipo de Evento:</strong> {selectedEvent.event_type_name}
            </Typography>
            <Typography gutterBottom>
              <strong>Inicio:</strong>{" "}
              {moment(selectedEvent.event_start_datetime).format("LLLL")}
            </Typography>
            <Typography gutterBottom>
              <strong>Fin:</strong>{" "}
              {moment(selectedEvent.event_end_datetime).format("LLLL")}
            </Typography>
            <Typography gutterBottom>
              <strong>Localización:</strong> {selectedEvent.location}
            </Typography>
            <Typography gutterBottom>
              <strong>Descripción:</strong> {selectedEvent.description}
            </Typography>
          </DialogContent>
          <DialogActions>
            <IconButton
              aria-label="edit"
              onClick={handleEditEvent}
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={handleDeleteEvent}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog para crear un nuevo evento */}
      <Dialog
        open={showCreateDialog}
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Crear Nuevo Evento
          <IconButton
            aria-label="close"
            onClick={handleCloseCreateDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Título del Evento"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              required
            />
            <FormControl required>
              <InputLabel id="type-label">Tipo de Evento</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={newEvent.type}
                onChange={handleInputChange}
                label="Tipo de Evento"
              >
                <MenuItem value={1}>Académico</MenuItem>
                <MenuItem value={2}>Artístico</MenuItem>
                <MenuItem value={3}>Deportivo</MenuItem>
                <MenuItem value={4}>Otro</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Hora de Inicio"
              name="start"
              type="datetime-local"
              value={
                newEvent.start
                  ? moment(newEvent.start).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: new Date(e.target.value) })
              }
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Hora de Finalización"
              name="end"
              type="datetime-local"
              value={
                newEvent.end
                  ? moment(newEvent.end).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: new Date(e.target.value) })
              }
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Localización"
              name="location"
              value={newEvent.location}
              onChange={handleInputChange}
            />
            <TextField
              label="Breve Descripción"
              name="briefDescription"
              value={newEvent.briefDescription}
              onChange={handleInputChange}
            />
            <TextField
              label="Descripción"
              name="description"
              multiline
              rows={4}
              value={newEvent.description}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateEvent} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar un evento */}
      {editEvent && (
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Editar Evento
            <IconButton
              aria-label="close"
              onClick={() => setShowEditDialog(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 1,
              }}
            >
              <TextField
                label="Título del Evento"
                name="title"
                value={editEvent.title}
                onChange={handleEditInputChange}
                required
              />
              <FormControl required>
                <InputLabel id="edit-type-label">Tipo de Evento</InputLabel>
                <Select
                  labelId="edit-type-label"
                  name="type"
                  value={editEvent.type}
                  onChange={handleEditInputChange}
                  label="Tipo de Evento"
                >
                  <MenuItem value={1}>Académico</MenuItem>
                  <MenuItem value={2}>Artístico</MenuItem>
                  <MenuItem value={3}>Deportivo</MenuItem>
                  <MenuItem value={4}>Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Hora de Inicio"
                name="start"
                type="datetime-local"
                value={
                  editEvent.start
                    ? moment(editEvent.start).format("YYYY-MM-DDTHH:mm")
                    : ""
                }
                onChange={(e) =>
                  setEditEvent({ ...editEvent, start: new Date(e.target.value) })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                label="Hora de Finalización"
                name="end"
                type="datetime-local"
                value={
                  editEvent.end
                    ? moment(editEvent.end).format("YYYY-MM-DDTHH:mm")
                    : ""
                }
                onChange={(e) =>
                  setEditEvent({ ...editEvent, end: new Date(e.target.value) })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                label="Localización"
                name="location"
                value={editEvent.location}
                onChange={handleEditInputChange}
              />
              <TextField
                label="Breve Descripción"
                name="briefDescription"
                value={editEvent.briefDescription}
                onChange={handleEditInputChange}
              />
              <TextField
                label="Descripción"
                name="description"
                multiline
                rows={4}
                value={editEvent.description}
                onChange={handleEditInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowEditDialog(false)}
              color="secondary"
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateEvent} color="primary">
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// Componente personalizado para los eventos
const CustomEvent = ({ event }) => (
  <Box
    sx={{
      backgroundColor: "#1976d2",
      color: "#fff",
      padding: "2px 5px",
      borderRadius: "4px",
      textAlign: "center",
      cursor: "pointer",
    }}
  >
    <Typography variant="body2" noWrap>
      {event.name}
    </Typography>
    <Typography variant="caption">
      ({getEventTypeName(event.event_type)})
    </Typography>
  </Box>
);

export default RegisterEvent;