import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Para poder usar toBeInTheDocument
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Alerta from '../components/component-alert/Alerta';
import { hideAlert } from '../store/reducerAlert/alertSlice';

// Crea el mock de Redux
const mockStore = configureStore([]);
const initialState = {
  alert: {
    isActive: true,  // Estado inicial donde la alerta está activa
    type: 'success', // Tipo de alerta (success, error, etc.)
    message: 'Operación exitosa',  // Mensaje de la alerta
  },
};

describe('Componente Alerta', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('debe mostrar la alerta con el mensaje correcto', () => {
    const { getByText } = render(
      <Provider store={store}>
        <Alerta />
      </Provider>
    );

    // Verifica si el mensaje de la alerta está en el documento
    expect(getByText('Operación exitosa')).toBeInTheDocument();
  });

  test('debe ocultar la alerta al hacer clic en cerrar', () => {
    const { getByRole } = render(
      <Provider store={store}>
        <Alerta />
      </Provider>
    );

    // Simula el cierre de la alerta
    const closeButton = getByRole('button');
    fireEvent.click(closeButton);

    // Verifica si la acción de ocultar alerta ha sido llamada
    const actions = store.getActions();
    expect(actions).toContainEqual(hideAlert());
  });
});