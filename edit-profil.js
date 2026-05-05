<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Floy - Paramètres</title>
    <link rel="stylesheet" href="settings.css">
</head>
<body>
    <div class="settings-header">
        <button class="back-btn" onclick="goBack()">
            <svg viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
        </button>
        <h3>Paramètres</h3>
        <div style="width: 40px;"></div>
    </div>

    <div class="settings-container">
        <div class="settings-section">
            <div class="section-title">Compte</div>
            <div class="settings-item" onclick="goToEditProfile()">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.417 8.11.75.75 0 1 1-1.5.086 7.5 7.5 0 0 0-14.026 0 .75.75 0 1 1-1.5-.086 9.005 9.005 0 0 1 5.417-8.11A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"/>
                    </svg>
                    <span>Modifier le profil</span>
                </div>
                <svg viewBox="0 0 24 24" class="arrow">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
            <div class="settings-item" onclick="changePassword()">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.5 9.5v-3a4.5 4.5 0 1 0-9 0v3M12 14.5v2M5 9.5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"/>
                    </svg>
                    <span>Changer le mot de passe</span>
                </div>
                <svg viewBox="0 0 24 24" class="arrow">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
        </div>

        <div class="settings-section">
            <div class="section-title">Notifications</div>
            <div class="settings-item">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.5 18.5v-5.5a4.5 4.5 0 0 0-9 0v5.5H5v-5.5a6 6 0 1 1 12 0v5.5h-2.5Z"/>
                        <path d="M8.5 18.5h-2v-5.5a4.5 4.5 0 0 1 9 0v5.5h-2"/>
                        <path d="M9 20.5h6"/>
                    </svg>
                    <span>Notifications push</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" id="pushNotifications" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="settings-item">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/>
                    </svg>
                    <span>Commentaires</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" id="commentNotifications" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="settings-item">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                    </svg>
                    <span>Likes</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" id="likeNotifications" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <div class="settings-section">
            <div class="section-title">Confidentialité</div>
            <div class="settings-item">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.417 8.11.75.75 0 1 1-1.5.086 7.5 7.5 0 0 0-14.026 0 .75.75 0 1 1-1.5-.086 9.005 9.005 0 0 1 5.417-8.11A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"/>
                    </svg>
                    <span>Compte privé</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" id="privateAccount">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="settings-item">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 8h18M8 21v-5a4 4 0 0 1 4-4 4 4 0 0 1 4 4v5M21 21H3"/>
                    </svg>
                    <span>Masquer mon activité</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" id="hideActivity">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <div class="settings-section">
            <div class="section-title">Support</div>
            <div class="settings-item" onclick="showHelp()">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <span>Aide</span>
                </div>
                <svg viewBox="0 0 24 24" class="arrow">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
            <div class="settings-item" onclick="reportProblem()">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 8v4M12 16h.01"/>
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    </svg>
                    <span>Signaler un problème</span>
                </div>
                <svg viewBox="0 0 24 24" class="arrow">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
            <div class="settings-item" onclick="showAbout()">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.417 8.11.75.75 0 1 1-1.5.086 7.5 7.5 0 0 0-14.026 0 .75.75 0 1 1-1.5-.086 9.005 9.005 0 0 1 5.417-8.11A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"/>
                    </svg>
                    <span>À propos</span>
                </div>
                <svg viewBox="0 0 24 24" class="arrow">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
        </div>

        <div class="settings-section">
            <div class="settings-item danger-item" onclick="confirmLogout()">
                <div class="item-left">
                    <svg viewBox="0 0 24 24">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                    </svg>
                    <span>Déconnexion</span>
                </div>
                <svg viewBox="0 0 24 24" class="arrow">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
        </div>

        <div class="version">Version 1.0.0</div>
    </div>

    <div id="logoutModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Déconnexion</h3>
                <button class="modal-close" onclick="closeLogoutModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Voulez-vous vraiment vous déconnecter ?</p>
                <div class="modal-buttons">
                    <button class="modal-cancel" onclick="closeLogoutModal()">Annuler</button>
                    <button class="modal-confirm" onclick="logout()">Déconnexion</button>
                </div>
            </div>
        </div>
    </div>

    <script src="settings.js"></script>
</body>
</html>
