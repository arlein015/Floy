<div class="bottom-nav">
    <div class="nav-item" onclick="window.location.href='index.html'">
        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span>Home</span>
    </div>

    <div class="nav-item" onclick="window.location.href='explore.html'">
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span>Explore</span>
    </div>

    <div class="nav-item" onclick="window.location.href='create-post.html'">
        <div class="plus-btn">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </div>
    </div>

    <div class="nav-item" onclick="window.location.href='messages.html'">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        <span>Message</span>
    </div>

    <div class="nav-item" onclick="window.location.href='profile.html'">
        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <span>Profil</span>
    </div>
</div>

<style>
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 70px;
        background: #000;
        border-top: 1px solid #1a1a1a;
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 9999;
        padding-bottom: 10px;
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #666;
        cursor: pointer;
        flex: 1;
        transition: 0.3s;
    }

    .nav-item svg {
        width: 26px;
        height: 26px;
        fill: currentColor;
    }

    .nav-item span {
        font-size: 10px;
        margin-top: 4px;
        font-weight: bold;
    }

    /* Changement de couleur au clic ou sur page active */
    .nav-item:active {
        color: #FF7A1A;
    }

    /* Style du bouton PLUS */
    .plus-btn {
        background: #FF7A1A;
        width: 45px;
        height: 35px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 5px;
    }

    .plus-btn svg {
        fill: black !important;
        width: 24px;
        height: 24px;
    }
</style>
