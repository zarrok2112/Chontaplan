import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './RegisterEvent.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import services from "../../services/services";
import Progress from "../component-progress/Progress";
import { useDispatch } from 'react-redux';
import { showAlert } from '../../store/reducerAlert/alertSlice';
import { useSelector } from 'react-redux';

moment.locale('es');
const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Todo el día',
    previous: '<',
    next: '>',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total) => `+ Ver más (${total})`,
};

// Componente personalizado para mostrar eventos en el calendario
const CustomEvent = ({ event }) => (
    <div className="custom-event">
        {event.title}
        <span className="event-type"> ({event.type})</span>
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
        photo: "",
        location: "",
        organizerContact: "",
        description: ""
    });
    const token = useSelector((state) => state.token.value);
    const [currentDate, setCurrentDate] = useState(new Date());
	const [progress,setProgress] = useState(false);

	const dispatch = useDispatch();



    // Manejar la selección de una casilla en el calendario para crear un evento
    const handleSelectSlot = ({ start, end }) => {
        setNewEvent({
            ...newEvent,
            start,
            end
        });
        setShowCreateDialog(true);
    };

    // Manejar el clic en el botón "Crear nuevo evento"
    const handleCreateButtonClick = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0); // 9 AM
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0); // 10 AM
        setNewEvent({
            title: "",
            start,
            end,
            type: "",
            photo: "",
            location: "",
            organizerContact: "",
            description: ""
        });
        setShowCreateDialog(true);
    };

    // Manejar cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            [name]: value
        });
    };

    // Manejar la subida de una foto
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEvent({
                    ...newEvent,
                    photo: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Crear un nuevo evento y agregarlo al estado
    const handleCreateEvent = () => {

        // Validar campos requeridos
        if (!newEvent.title || !newEvent.type || !newEvent.start || !newEvent.end) {
            alert("Por favor completa todos los campos requeridos.");
            return;
        }

        setProgress(true)
        const dataEvent = {
            name: newEvent.title,
            event_type: 1,
            description:newEvent.description,
            event_start_datetime:newEvent.start,
            event_end_datetime:newEvent.end,
            brief_description:newEvent.description,
            photo:newEvent.photo,
            location: newEvent.location,
            organizerContact: newEvent.organizerContact
        }

        services.registerEvent(token ,dataEvent).then((response)=>{
            setProgress(false);
            if(response.status === 201) {
                dispatch(showAlert({ type: 'success', message: 'El evento se creo exitosamente!' }));
                setShowCreateDialog(false);
            }
        }).catch((error)=>{
            setProgress(false);
            dispatch(showAlert({ type: 'error', message: 'El evento no se creo exitosamente!' }));
            console.log(error);
            return;
        });
    };

    // Manejar el clic en un evento para mostrar detalles
    const handleEventClick = event => {
        setSelectedEvent(event);
        setShowPopup(true);
    };

    // Cerrar el popup de detalles del evento
    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedEvent(null);
    };

    // Cerrar el dialog de creación de evento
    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
    };

    // Ordenar eventos por fecha de inicio
    const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
    // Filtrar los próximos eventos (hasta 3)
    const upcomingEvents = sortedEvents.filter(event => new Date(event.start) >= new Date()).slice(0, 3);

    // Navegación de meses
    const handlePrevMonth = () => {
        const prevMonth = moment(currentDate).subtract(1, 'months').toDate();
        setCurrentDate(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = moment(currentDate).add(1, 'months').toDate();
        setCurrentDate(nextMonth);
    };

    const handleMonthChange = (e) => {
        const month = e.target.value;
        const year = moment(currentDate).year();
        const newDate = new Date(year, month, 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="container-calendar-events">
            {progress ? <Progress /> : <></>}
            {/* Encabezado */}
            <div className="container-top">
                <div className="container-calendar">
                    Calendario Mateo
                </div>
            </div>

            {/* Botón para crear un nuevo evento */}
            <div className="event-creation-section">
                <Button variant="contained" color="primary" onClick={handleCreateButtonClick}>
                    Crear nuevo evento
                </Button>
            </div>

            {/* Navegación del calendario */}
            <div className="calendar-navigation">
                <Button onClick={handlePrevMonth}>◄</Button>
                <FormControl variant="outlined" size="small" style={{ minWidth: 120, margin: '0 10px' }}>
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
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    messages={messages}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    onSelectEvent={handleEventClick}
                    components={{
                        event: CustomEvent
                    }}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.type === "Academico" ? "#3f51b5" :
                                event.type === "Deportivo" ? "#4caf50" :
                                    "#9e9e9e",
                            color: "white",
                            borderRadius: "4px",
                            padding: "2px 4px",
                            fontSize: "0.8em",
                            cursor: "pointer",
                        },
                    })}
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
                                        primary={`${event.title} - ${moment(event.start).format('LLL')}`}
                                        secondary={`Tipo: ${event.type}`}
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText
                                    primary="No hay próximos eventos"
                                />
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
                            style={{ position: 'absolute', right: '10px', top: '10px' }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <h3>{selectedEvent.title}</h3>
                        {selectedEvent.photo && <img src={selectedEvent.photo} alt="Evento" style={{ width: '100%', height: 'auto', marginTop: '10px' }} />}
                        <p><strong>Tipo de Evento:</strong> {selectedEvent.type}</p>
                        <p><strong>Inicio:</strong> {moment(selectedEvent.start).format("LLLL")}</p>
                        <p><strong>Fin:</strong> {moment(selectedEvent.end).format("LLLL")}</p>
                        <p><strong>Localización:</strong> {selectedEvent.location}</p>
                        <p><strong>Contacto del Organizador:</strong> {selectedEvent.organizerContact}</p>
                        <p><strong>Descripción:</strong> {selectedEvent.description}</p>
                    </div>
                </div>
            )}

            {/* Dialog para crear un nuevo evento */}
            <Dialog open={showCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    Crear Nuevo Evento
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseCreateDialog}
                        style={{ position: 'absolute', right: '10px', top: '10px' }}
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
                            <MenuItem value="Academico">Academico</MenuItem>
                            <MenuItem value="Deportivo">Deportivo</MenuItem>
                            <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Hora de Inicio"
                        name="start"
                        type="datetime-local"
                        fullWidth
                        value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
                        onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
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
                        value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
                        onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
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
                        label="Información de Contacto del Organizador"
                        name="organizerContact"
                        fullWidth
                        value={newEvent.organizerContact}
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
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        style={{ marginTop: '10px' }}
                    >
                        Subir Foto
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handlePhotoChange}
                        />
                    </Button>
                    {newEvent.photo && <img src={newEvent.photo} alt="Evento" style={{ width: '100%', marginTop: '10px' }} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={()=>handleCreateEvent()} color="primary">
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RegisterEvent;
