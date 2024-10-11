import React from 'react';

const EventList = ({ events }) => {
  return (
    <div className="container-calendar-events">
      <div className="container-top">
        <h2>Eventos Guardados</h2>
      </div>
      <div className="container-bottom">
        <div className="container-events">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div className="custom-event" key={index}>
                <h3>{event.name}</h3>
                <p><strong>Fecha:</strong> {event.date}</p>
                <p><strong>Descripción:</strong> {event.description}</p>
                <button className="close-btn" onClick={() => alert(`Evento ${event.name} eliminado`)}>
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <p>No hay eventos guardados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;