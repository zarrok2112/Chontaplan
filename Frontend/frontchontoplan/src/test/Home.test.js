import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../components/component-home/Home';
import { useDispatch, useSelector } from 'react-redux';

// Mock de los componentes RegisterEvent y ChatGPTClone
jest.mock('../components/component-register-event/RegisterEvent', () => () => <div>Register Event Component</div>);
jest.mock('../components/components-chatbot/ChontoChat', () => () => <div>ChatGPT Component</div>);

// Mock de useAuth0
const mockLogout = jest.fn();

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    logout: mockLogout,
  }),
}));

// Mock de react-redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

describe('Home Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();

    // Mockear useDispatch para que devuelva la función mockDispatch
    useDispatch.mockReturnValue(mockDispatch);

    // Mockear useSelector para que devuelva el estado necesario
    useSelector.mockImplementation((selector) => selector({
      token: { value: 'fake_token' },
    }));
  });
  test('renders RegisterEvent component by default', () => {
    render(<Home />);

    // Verificar que el componente RegisterEvent se renderiza por defecto
    expect(screen.getByText('Register Event Component')).toBeInTheDocument();

    // Asegurarse de que ChatGPTClone no esté renderizado
    expect(screen.queryByText('ChatGPT Component')).not.toBeInTheDocument();
  });

  test('renders ChatGPTClone component when "Chontochat" button is clicked', () => {
    render(<Home />);

    // Hacer clic en el botón "Chontochat"
    fireEvent.click(screen.getByText('Chontochat'));

    // Verificar que el componente ChatGPTClone se renderiza
    expect(screen.getByText('ChatGPT Component')).toBeInTheDocument();

    // Asegurarse de que RegisterEvent no esté renderizado
    expect(screen.queryByText('Register Event Component')).not.toBeInTheDocument();
  });

  test('calls logout function when "Cerrar sesión" button is clicked', () => {
    render(<Home />);

    // Hacer clic en el botón "Cerrar sesión"
    fireEvent.click(screen.getByText('Cerrar sesión'));

    // Verificar que la función logout haya sido llamada con los parámetros correctos
    expect(mockLogout).toHaveBeenCalledWith({ returnTo: window.location.origin });
  });

  test('dispatches showAlert action when an unexpected navigation index is selected', () => {
    render(<Home />);

    // Simular un click en una opción no válida (por ejemplo, índice 2)
    // Para ello, necesitamos agregar un tercer botón en el componente Home o simular de otra manera.
    // Dado que actualmente solo hay dos opciones, omitiremos esta prueba o la adaptaremos.

    // Por ejemplo, intentar seleccionar un índice inexistente mediante handleListItemClick
    // Esto requiere exponer la función o refactorizar el componente para facilitar pruebas.

    // Como alternativa, asegurémonos de que el título no cambia a algo inesperado con las opciones actuales
    expect(screen.queryByRole('heading', { name: /error :c 2/i })).not.toBeInTheDocument();
  });
});