<script type="module">
    // On importe ce qu'on a créé dans le fichier config
    import { db, storage } from './firebase-config.js';
    import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
    import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

    // Exemple de fonction de publication
    window.publierPost = async function() {
        const file = document.getElementById('file-input').files[0];
        if(!file) return alert("Choisis une photo !");

        try {
            // Upload de l'image
            const storageRef = ref(storage, 'posts/' + Date.now());
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Enregistrement des données
            await addDoc(collection(db, "posts"), {
                imageUrl: url,
                caption: document.getElementById('caption').value,
                createdAt: new Date(),
                username: "Utilisateur_Floy"
            });

            window.location.href = 'index.html';
        } catch (e) {
            console.error(e);
        }
    }
</script>
