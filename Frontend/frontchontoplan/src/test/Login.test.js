// Login.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import services from '../services/services';
import { showAlert } from '../store/reducerAlert/alertSlice';
import { getToken } from '../store/reducerToken/tokenSlice';
import Login from '../components/components-login/Login';

// Mock de los servicios
jest.mock('../services/services', () => ({
  loginService: jest.fn(),
  signUp: jest.fn(),
}));

// Mock de useDispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Mock de useNavigate de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Componente Login', () => {
  let mockDispatch;
  let store;

  beforeEach(() => {
    // Crear un nuevo store para cada prueba
    const mockStore = configureStore([]);
    store = mockStore({});
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el formulario de inicio de sesión y permite al usuario enviar', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Login />
        </Provider>
      </MemoryRouter>
    );

    // Obtener el formulario de inicio de sesión
    const loginForm = screen.getByTestId('login-form');

    // Simular entrada de datos dentro del formulario de inicio de sesión
    fireEvent.change(within(loginForm).getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(within(loginForm).getByPlaceholderText('Password (Inicio de sesión)'), {
      target: { value: 'SecurePassword123!' },
    });

    // Mock del servicio de login para devolver una respuesta exitosa
    services.loginService.mockResolvedValueOnce({
      status: 200,
      data: {
        access: 'fake_jwt_token',
      },
    });

    // Simular envío del formulario
    fireEvent.click(within(loginForm).getByText('Iniciar'));

    // Esperar a que se llame a dispatch con getToken
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        getToken({ value: 'fake_jwt_token' })
      );
    });

    // Verificar que se mostró una alerta de éxito
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        showAlert({ type: 'success', message: 'Se logueó exitosamente!' })
      );
    });

    // Verificar que se navegó a '/home'
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('muestra mensaje de error cuando el inicio de sesión falla', async () => {
    // Mock del servicio de login para rechazar la promesa
    services.loginService.mockRejectedValueOnce(new Error('Error al loguearse'));

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Login />
        </Provider>
      </MemoryRouter>
    );

    // Obtener el formulario de inicio de sesión
    const loginForm = screen.getByTestId('login-form');

    // Simular entrada de datos
    fireEvent.change(within(loginForm).getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(within(loginForm).getByPlaceholderText('Password (Inicio de sesión)'), {
      target: { value: 'wrongpassword' },
    });

    // Simular envío del formulario
    fireEvent.click(within(loginForm).getByText('Iniciar'));

    // Esperar a que se llame a dispatch con el mensaje de error
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        showAlert({ type: 'error', message: 'Error al loguearse' })
      );
    });

    // Verificar que no se navegue a '/home'
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('renderiza el formulario de registro y permite al usuario registrarse', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Login />
        </Provider>
      </MemoryRouter>
    );

    // Cambiar al formulario de registro
    fireEvent.click(screen.getByLabelText(/Registro/i));

    // Obtener el formulario de registro
    const registerForm = screen.getByTestId('register-form');

    // Simular entrada de datos con un correo válido
    fireEvent.change(within(registerForm).getByPlaceholderText('Full name (Registro)'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(within(registerForm).getByPlaceholderText('Email (Registro)'), {
      target: { value: 'john.doe@university.edu' },
    });
    fireEvent.change(within(registerForm).getByPlaceholderText('Password (Registro)'), {
      target: { value: 'SecurePassword123!' },
    });
    fireEvent.change(within(registerForm).getByPlaceholderText('Repeat (Registro)'), {
      target: { value: 'SecurePassword123!' },
    });

    // Mock del servicio de registro para devolver una respuesta exitosa
    services.signUp.mockResolvedValueOnce({
      status: 201,
      data: {
        message: 'Registro exitoso',
      },
    });

    // Simular envío del formulario
    fireEvent.click(within(registerForm).getByText('Registrar'));

    // Esperar a que se llame a dispatch con el mensaje de éxito
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        showAlert({ type: 'success', message: 'Se registró exitosamente!' })
      );
    });

    // Verificar que no se navegue a '/home' después del registro
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('muestra mensaje de error cuando el registro falla', async () => {
    // Mock del servicio de registro para rechazar la promesa
    services.signUp.mockRejectedValueOnce(new Error('Error al registrarse'));

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Login />
        </Provider>
      </MemoryRouter>
    );

    // Cambiar al formulario de registro
    fireEvent.click(screen.getByLabelText(/Registro/i));

    // Obtener el formulario de registro
    const registerForm = screen.getByTestId('register-form');

    // Simular entrada de datos con un correo válido
    fireEvent.change(within(registerForm).getByPlaceholderText('Full name (Registro)'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(within(registerForm).getByPlaceholderText('Email (Registro)'), {
      target: { value: 'john.doe@university.edu' },
    });
    fireEvent.change(within(registerForm).getByPlaceholderText('Password (Registro)'), {
      target: { value: 'SecurePassword123!' },
    });
    fireEvent.change(within(registerForm).getByPlaceholderText('Repeat (Registro)'), {
      target: { value: 'SecurePassword123!' },
    });

    // Simular envío del formulario
    fireEvent.click(within(registerForm).getByText('Registrar'));

    // Esperar a que se llame a dispatch con el mensaje de error
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        showAlert({ type: 'error', message: 'Error al registrarse' })
      );
    });

    // Verificar que no se navegue a '/home'
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});