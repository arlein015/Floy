from flask import Blueprint, render_template, abort, redirect, url_for
from models import db, User, Post
from subscription_manager import check_verification_status

# On crée le module de routes pour le profil
profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile/<username>')
def show_profile(username):
    # 1. Chercher l'utilisateur par son pseudo unique
    user = User.query.filter_by(username=username).first()
    
    if not user:
        # Si l'utilisateur n'existe pas, on renvoie une erreur 404
        abort(404)

    # 2. Vérification du badge (Abonnement 10$/mois)
    # Cette fonction vient de ton subscription_manager.py
    is_verified = check_verification_status(user.id)

    # 3. Préparation des statistiques (Abonnés/Abonnements)
    # À terme, ces chiffres viendront de tes tables de relations
    user_stats = {
        'followers': 1250, # Exemple statique pour le test
        'following': 450,
        'posts_count': user.posts.count()
    }

    # 4. Récupération des publications (Grille)
    # On les trie par date (les plus récentes en premier)
    user_posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()

    # 5. ENVOI AU HTML (C'est ici que la magie opère)
    # On passe 'user', 'stats', 'posts' et 'is_verified' pour que le HTML les affiche
    return render_template(
        'profile.html', 
        user=user, 
        stats=user_stats, 
        posts=user_posts,
        is_verified=is_verified
    )

@profile_bp.route('/profile/edit_bio', methods=['POST'])
def update_bio():
    # Exemple de route pour modifier la bio rapidement
    # Tu récupères les données du formulaire et tu update user.bio
    pass
