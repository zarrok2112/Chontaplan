import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
/* import Login from '../components/components-login/Login'; */
import services from '../services/services';
import { showAlert } from '../store/reducerAlert/alertSlice';
import { getToken } from '../store/reducerToken/tokenSlice';
import Login from '../components/components-login/Login'


// Crea un store simulado
const mockStore = configureStore([]);
const store = mockStore({});

// Crea un mock de la función dispatch
const mockDispatch = jest.spyOn(store, 'dispatch');

// Mock del servicio
/* jest.mock('../services/services'); */
jest.mock('../services/services', () => ({
  loginService: jest.fn(),
  signUp: jest.fn(),
}));
jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
  }));
  
  describe('Login Component', () => {
    const mockDispatch = jest.fn();
  
    beforeEach(() => {
      useDispatch.mockReturnValue(mockDispatch);
    });
  
    afterEach(() => {
      jest.clearAllMocks(); // Limpiar mocks después de cada prueba
    });
  
    test('renders login form and allows user to submit', () => {
        render(
          <MemoryRouter>
            <Provider store={store}>
              <Login />
            </Provider>
          </MemoryRouter>
        );
      
        // Verificar que el formulario de inicio de sesión está presente
        expect(screen.getByLabelText(/Inicio/i)).toBeInTheDocument();
        
        // Verificar que los campos de entrada están presentes
        expect(screen.getByPlaceholderText(/Email/i, { selector: 'input[name="email"]' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password \(Inicio de sesión\)/i)).toBeInTheDocument();
      
        // Simular la entrada de datos
        fireEvent.change(screen.getByPlaceholderText(/Email/i, { selector: 'input[name="email"]' }), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password \(Inicio de sesión\)/i), { target: { value: 'SecurePassword123!' } });
      
        // Simular el envío del formulario
        fireEvent.click(screen.getByText(/Iniciar/i));
      
        // Aquí podrías verificar que el inicio de sesión se haya manejado correctamente.
      });
  
    test('shows error message when login fails', async () => {
        render(
          <MemoryRouter>
            <Provider store={store}>
              <Login />
            </Provider>
          </MemoryRouter>
        );
      
        // Cambiar al formulario de inicio de sesión
        fireEvent.click(screen.getByLabelText(/Inicio/i));
      
        // Simular la entrada de datos
        fireEvent.change(screen.getByPlaceholderText(/Email/i, { selector: 'input[name="email"]' }), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password \(Inicio de sesión\)/i), { target: { value: 'wrongpassword' } });
      
        // Simular un error en el servicio de login
        services.login.mockRejectedValueOnce(new Error('Login failed'));
      
        // Simular el envío del formulario
        fireEvent.click(screen.getByText(/Iniciar/i));
      
        // Esperar a que se despache el mensaje de error
        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalledWith(showAlert({ type: 'error', message: 'Error en el inicio de sesión' }));
        });
      });
  
    test('renders registration form and allows user to register', async () => {
        render(
          <MemoryRouter>
            <Provider store={store}>
              <Login />
            </Provider>
          </MemoryRouter>
        );
      
        // Cambiar al formulario de registro
        fireEvent.click(screen.getByLabelText(/Registro/i));
      
        // Verificar que los campos de entrada están presentes en el formulario de registro
        expect(screen.getByPlaceholderText(/Full name \(Registro\)/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email \(Registro\)/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password \(Registro\)/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Repeat \(Registro\)/i)).toBeInTheDocument();
      
        // Simular la entrada de datos
        fireEvent.change(screen.getByPlaceholderText(/Full name \(Registro\)/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Email \(Registro\)/i), { target: { value: 'john.doe@edu.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password \(Registro\)/i), { target: { value: 'SecurePassword123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Repeat \(Registro\)/i), { target: { value: 'SecurePassword123!' } });
      
        // Simular el envío del formulario
        services.signUp.mockResolvedValueOnce({ status: 201, data: { message: 'Registro exitoso' } });
      
        fireEvent.click(screen.getByText(/Registrar/i));
      
        // Esperar a que se despache el mensaje de éxito
        await waitFor(() => {
          expect(mockDispatch).toHaveBeenCalled(); // Verificar si se llamó al mock
          expect(mockDispatch).toHaveBeenCalledWith(showAlert({ type: 'success', message: 'Se registro exitosamente!' }));
        });
      });
  
    test('shows error message when registration fails', async () => {
        render(
          <Provider store={store}>
            <Login />
          </Provider>
        );
      
        // Simula la entrada de datos
        fireEvent.change(screen.getByPlaceholderText(/Full name \(Registro\)/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Email \(Registro\)/i), { target: { value: 'john.doe@edu.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password \(Registro\)/i), { target: { value: 'SecurePassword123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Repeat \(Registro\)/i), { target: { value: 'SecurePassword123!' } });
      
        // Simula un error en el servicio de registro
        services.signUp.mockRejectedValueOnce(new Error('Error al registrarse'));
      
        // Simula el envío del formulario
        fireEvent.click(screen.getByText(/Registrar/i));
      
        // Esperar a que se despache el mensaje de error
        await waitFor(() => expect(mockDispatch).toHaveBeenCalledWith(showAlert({ type: 'error', message: 'Error al registrarse' })));
      });
  });