import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../components/component-home/Home';
import RegisterEvent from '../components/component-register-event/RegisterEvent';
import ChatGPTClone from '../components/components-chatbot/ChontoChat';

// Mock de los componentes RegisterEvent y ChatGPTClone
jest.mock('../components/component-register-event/RegisterEvent', () => () => <div>Register Event Component</div>);
jest.mock('../components/components-chatbot/ChontoChat', () => () => <div>ChatGPT Component</div>);

describe('Home Component', () => {
    test('renders title and buttons', () => {
        render(<Home />);
    
        // Verificar que el título inicial sea "Registrar mi evento"
        expect(screen.getByRole('heading', { name: /Registrar mi evento/i })).toBeInTheDocument();
    
        // Verificar que los botones estén presentes
        expect(screen.getByText('Registrar mi evento', { selector: 'span' })).toBeInTheDocument();
        expect(screen.getByText('Chontochat', { selector: 'span' })).toBeInTheDocument();
    });

  test('renders RegisterEvent component by default', () => {
    render(<Home />);
    
    // Verificar que el componente RegisterEvent se renderiza por defecto
    expect(screen.queryByText('Register Event Component')).toBeInTheDocument();
  });

  test('renders ChatGPTClone component when Chontochat button is clicked', () => {
    render(<Home />);
    
    // Hacer clic en el botón "Chontochat"
    fireEvent.click(screen.queryByText('Chontochat'));

    // Verificar que el componente ChatGPTClone se renderiza
    expect(screen.queryByText('ChatGPT Component')).toBeInTheDocument();
  });

  test('updates title when a list item is clicked', () => {
    render(<Home />);

    // Hacer clic en el botón "Chontochat"
    fireEvent.click(screen.getByText('Chontochat'));

    // Verificar que el título se actualiza correctamente
    expect(screen.getByRole('heading', { name: /Chontochat/i })).toBeInTheDocument();
});
});