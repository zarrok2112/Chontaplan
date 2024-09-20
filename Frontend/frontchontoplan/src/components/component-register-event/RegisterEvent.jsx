import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./RegisterEvent.css";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import services from "../../services/services";
import Progress from "../component-progress/Progress";
import { useDispatch, useSelector } from "react-redux";
import { showAlert } from "../../store/reducerAlert/alertSlice";

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

const CustomEvent = ({ event }) => (
  <div className="custom-event">
    {event.name}
    <span className="event-type"> ({event.event_type})</span>
  </div>
);

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
  const token = useSelector((state) => state.token.value);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progress, setProgress] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    services
      .getEvents(token)
      .then((response) => {
        if (response.status === 200) {
          setEvents(response.data);  // Sin conversión manual de fechas
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

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

  const handleCreateEvent = () => {
    // Validar campos requeridos
    if (!newEvent.title || !newEvent.type || !newEvent.start || !newEvent.end) {
      alert("Por favor completa todos los campos requeridos.");
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

    console.log("Tipo de dataEvent:", typeof dataEvent);
    console.log("Contenido de dataEvent:", dataEvent);

    services
      .registerEvent(token, dataEvent)
      .then((response) => {
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
      })
      .catch((error) => {
        setProgress(false);
        dispatch(
          showAlert({
            type: "error",
            message: "El evento no se creó exitosamente!",
          })
        );
        console.error("Error al crear el evento:", error.response.data);
        // Si error.response.data es un objeto, puedes imprimirlo de manera más legible:
        if (error.response && error.response.data) {
          console.error(
            "Detalles del error:",
            JSON.stringify(error.response.data, null, 2)
          );
        } else {
          console.error("Error desconocido:", error);
        }
        return;
      });
  };

  const handleEventClick = (event) => {
    const eventTypeMap = {
      1: "Académico",
      2: "Deportivo",
      3: "Otro",
    };

    const formattedEvent = {
      ...event,
      event_type_name: eventTypeMap[event.event_type] || "Desconocido", // Asignar el nombre del tipo de evento
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

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.event_start_datetime) - new Date(b.event_start_datetime)
  );
  const upcomingEvents = sortedEvents
    .filter((event) => new Date(event.event_start_datetime) >= new Date())
    .slice(0, 3);

  const handlePrevMonth = () => {
    const prevMonth = moment(currentDate).subtract(1, "months").toDate();
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = moment(currentDate).add(1, "months").toDate();
    setCurrentDate(nextMonth);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    const year = moment(currentDate).year();
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
  };

  const eventTypeMap = {
    1: "Académico",
    2: "Deportivo",
    3: "Otro",
  };

  return (
    <div className="container-calendar-events">
      {progress && <Progress />}
      {/* Encabezado */}
      <div className="container-top">
        <div className="container-calendar">Calendario Chontaplan</div>
      </div>

      {/* Botón para crear un nuevo evento */}
      <div className="event-creation-section">
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateButtonClick}
        >
          Crear nuevo evento
        </Button>
      </div>

      {/* Navegación del calendario */}
      <div className="calendar-navigation">
        <Button onClick={handlePrevMonth}>◄</Button>
        <FormControl
          variant="outlined"
          size="small"
          style={{ minWidth: 120, margin: "0 10px" }}
        >
          <InputLabel id="month-select-label">Mes</InputLabel>
          <Select
            labelId="month-select-label"
            value={moment(currentDate).month()}
            onChange={handleMonthChange}
            label="Mes"
          >
            {moment.months().map((month, index) => (
              <MenuItem key={index} value={index}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={handleNextMonth}>►</Button>
      </div>

      {/* Calendario */}
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
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
          views={['month', 'day', 'agenda']}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
        />
      </div>

      {/* Lista de próximos eventos */}
      <div className="container-bottom">
        <div className="container-events">
          <List>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${event.name} - ${moment(
                      event.event_start_datetime
                    ).format("LLL")}`}
                    secondary={`Tipo: ${
                      eventTypeMap[event.event_type] || "Desconocido"
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
        </div>
      </div>

      {/* Popup de detalles del evento */}
      {showPopup && selectedEvent && (
        <div className="event-popup">
          <div className="popup-content">
            <IconButton
              aria-label="close"
              onClick={handleClosePopup}
              style={{ position: "absolute", right: "-15px", top: "-33px" }}
            >
              <CloseIcon />
            </IconButton>
            <h3>{selectedEvent.name}</h3>
            <p>
              <strong>Tipo de Evento:</strong> {selectedEvent.event_type_name}
            </p>
            <p>
              <strong>Inicio:</strong>{" "}
              {moment(selectedEvent.event_start_datetime).format("LLLL")}
            </p>
            <p>
              <strong>Fin:</strong>{" "}
              {moment(selectedEvent.event_end_datetime).format("LLLL")}
            </p>
            <p>
              <strong>Localización:</strong> {selectedEvent.location}
            </p>
            <p>
              <strong>Descripción:</strong> {selectedEvent.description}
            </p>
          </div>
        </div>
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
            style={{ position: "absolute", right: "10px", top: "10px" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Título del Evento"
            name="title"
            fullWidth
            value={newEvent.title}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="type-label">Tipo de Evento</InputLabel>
            <Select
              labelId="type-label"
              name="type"
              value={newEvent.type}
              onChange={handleInputChange}
              label="Tipo de Evento"
              required
            >
              <MenuItem value={1}>Académico</MenuItem>
              <MenuItem value={2}>Deportivo</MenuItem>
              <MenuItem value={3}>Otro</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Hora de Inicio"
            name="start"
            type="datetime-local"
            fullWidth
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
            margin="dense"
            label="Hora de Finalización"
            name="end"
            type="datetime-local"
            fullWidth
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
            margin="dense"
            label="Localización"
            name="location"
            fullWidth
            value={newEvent.location}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Breve Descripción"
            name="briefDescription"
            fullWidth
            value={newEvent.briefDescription}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newEvent.description}
            onChange={handleInputChange}
          />
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
    </div>
  );
};

export default RegisterEvent;
