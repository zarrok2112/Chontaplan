import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ChatGPTClone from '../components/components-chatbot/ChontoChat';
import '@testing-library/jest-dom';

const mockStore = configureStore([]);

describe('ChatGPTClone', () => {
  let store;

  beforeEach(() => {
    // Crea un store simulado con el token
    if (typeof HTMLElement.prototype.scrollIntoView !== 'function') {
        HTMLElement.prototype.scrollIntoView = jest.fn();
      }
    store = mockStore({
      token: {
        value: 'mocked-token', // Simula el token
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restaurar los mocks después de cada prueba
  });

  test('renders without crashing', () => {
    render(
      <Provider store={store}>
        <ChatGPTClone />
      </Provider>
    );

    // Verifica que el componente se renderiza correctamente
    expect(screen.getByText(/Chontochat/i)).toBeInTheDocument();
  });

  test('handles sending a message', () => {
    render(
      <Provider store={store}>
        <ChatGPTClone />
      </Provider>
    );

    // Simula enviar un mensaje
    const input = screen.getByPlaceholderText(/Escribi ve.../i);
    /* const sendButton = screen.getByRole('button', { class: 'send-button' }); */
    /* const sendButton = screen.getByLabelText(/enviar/i); */
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(button => button.className.includes('send-button'));

    // Cambia el valor del input y simula el clic en el botón de enviar
    fireEvent.change(input, { target: { value: 'Hello, World!' } });
    fireEvent.click(sendButton);

    // Verifica que el mensaje se haya enviado y aparezca en la lista
    expect(screen.getByText(/Hello, World!/i)).toBeInTheDocument();
  });

  test('displays error message when token is not available', async () => {
    // Simula que no hay token
    store = mockStore({
      token: {
        value: null, // No hay token
      },
    });

    render(
      <Provider store={store}>
        <ChatGPTClone />
      </Provider>
    );

    const errorMessage = await screen.findByText('No se encontró el token de acceso. Por favor, inicia sesión primero.');
    
        expect(errorMessage).toBeInTheDocument();
  });
});