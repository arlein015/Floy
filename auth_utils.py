from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def hash_password(password):
    """Transforme le mot de passe en hash sécurisé."""
    return bcrypt.generate_password_hash(password).decode('utf-8')

def check_password(hashed_password, user_password):
    """Vérifie si le mot de passe saisi correspond au hash en base."""
    return bcrypt.check_password_hash(hashed_password, user_password)
