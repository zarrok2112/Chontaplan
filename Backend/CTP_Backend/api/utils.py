

def send_register_alert(user_data: dict):
    # Generate message
    message = f"""
        Un nuevo cliente se registró en Linnda!
        Nombre: {user_data['name']}
        Correo: {user_data['email']}
    """
