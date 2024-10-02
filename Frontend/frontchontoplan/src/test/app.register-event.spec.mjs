// Generated by qodo Gen

describe('RegisterEvent', () => {

    // Renders the calendar with events fetched from the server
    it('should render the calendar with events fetched from the server', async () => {
      const mockEvents = [{ id: 1, name: 'Test Event', event_start_datetime: new Date(), event_end_datetime: new Date() }];
      services.getEvents = jest.fn().mockResolvedValue({ status: 200, data: mockEvents });
      const { getByText } = render(<RegisterEvent />);
      await waitFor(() => expect(getByText('Test Event')).toBeInTheDocument());
    });

    // Allows the user to create a new event via the dialog
    it('should open the create event dialog when create button is clicked', () => {
      const { getByText, getByLabelText } = render(<RegisterEvent />);
      fireEvent.click(getByText('Crear nuevo evento'));
      expect(getByLabelText('Título del Evento')).toBeInTheDocument();
    });

    // Displays a success alert when an event is created successfully
    it('should display a success alert when an event is created successfully', async () => {
      services.registerEvent = jest.fn().mockResolvedValue({ status: 201, data: {} });
      const { getByText } = render(<RegisterEvent />);
      fireEvent.click(getByText('Crear nuevo evento'));
      fireEvent.click(getByText('Crear'));
      await waitFor(() => expect(getByText('El evento se creó exitosamente!')).toBeInTheDocument());
    });
});