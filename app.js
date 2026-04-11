import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { MOODS, MOOD_DATABASE } from "./data.js";
import { gitaQuotes } from "./gita-data.js";

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const body = document.body;
    const moodBtns = document.querySelectorAll('.mood-btn');
    const contentDisplay = document.getElementById('content-display');
    const quoteText = document.getElementById('display-quote');
    const actionText = document.getElementById('display-action');
    const videoIframe = document.getElementById('display-video');
    const moodLabel = document.getElementById('content-mood-label');
    const btnSurprise = document.getElementById('btn-surprise');
    const btnRefresh = document.getElementById('btn-refresh-content');
    const btnMusic = document.getElementById('btn-music');
    const bgMusic = document.getElementById('bg-music');
    const btnSaveQuote = document.getElementById('btn-save-quote');
    const saveIcon = document.getElementById('save-icon');
    
    const gitaQuoteText = document.getElementById('display-gita-quote');
    const gitaRefText = document.getElementById('display-gita-ref');
    const btnSaveGita = document.getElementById('btn-save-gita');
    const saveGitaIcon = document.getElementById('save-gita-icon');
    const gitaCard = document.getElementById('gita-card');
    const gitaHeadingText = document.getElementById('gita-heading-text');
    
    // Modals
    const btnTracker = document.getElementById('btn-tracker');
    const modalTracker = document.getElementById('modal-tracker');
    const btnFavorites = document.getElementById('btn-favorites');
    const modalFavorites = document.getElementById('modal-favorites');
    const closeBtns = document.querySelectorAll('.modal-close');
    const favoritesList = document.getElementById('favorites-list');
    
    // State
    let currentMood = null;
    let moodIndexes = {
        inspired: 0, focused: 0, overwhelmed: 0, 
        fatigued: 0, evaluative: 0, doubt: 0, reflective: 0
    };
    let gitaIndexes = { ...moodIndexes };
    let isMusicPlaying = false;
    let currentAuthenticatedUser = null;
    let userDetails = null;
    let savedQuotesData = []; // Array of { id, content }
    let rawMoodHistory = [];

    // --- Firebase Auth Check ---
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }
        currentAuthenticatedUser = user;

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                userDetails = userDoc.data();
            } else {
                userDetails = { name: user.displayName || "Teacher", email: user.email };
            }
        } catch (error) {
            console.error("Firestore Error. Is your Database enabled? ", error);
            userDetails = { name: "Teacher (DB Error)", email: user.email };
        }
        hydrateUI();

        // Setup Realtime Listeners
        setupRealtimeListeners();
    });

    function hydrateUI() {
        const greeting = document.getElementById('user-greeting');
        const avatar = document.getElementById('user-avatar');
        const widget = document.getElementById('user-profile-widget');
        
        if (greeting && avatar && widget && userDetails) {
            greeting.innerHTML = `Welcome, ${userDetails.name.split(' ')[0]} 👋`;
            avatar.textContent = userDetails.name.charAt(0).toUpperCase();
            widget.classList.remove('opacity-0');
        }
    }

    function setupRealtimeListeners() {
        if (!currentAuthenticatedUser) return;
        const uid = currentAuthenticatedUser.uid;

        // Favorites Listener
        const favRef = query(collection(db, `users/${uid}/favorites`), orderBy("savedAt", "desc"));
        onSnapshot(favRef, (snapshot) => {
            savedQuotesData = [];
            snapshot.forEach(doc => {
                savedQuotesData.push({ id: doc.id, ...doc.data() });
            });
            if (quoteText.textContent) {
                checkIfSaved(quoteText.textContent.replace(/"/g, ''));
            }
            if (gitaQuoteText.textContent) {
                checkIfGitaSaved(gitaQuoteText.textContent.replace(/"/g, ''));
            }
        }, (err) => {
            console.error("Favorites Snapshot error: ", err);
        });

        // Mood History Listener
        const moodRef = query(collection(db, `users/${uid}/moods`), orderBy("timestamp", "desc"));
        onSnapshot(moodRef, (snapshot) => {
            rawMoodHistory = [];
            snapshot.forEach(doc => {
                rawMoodHistory.push(doc.data());
            });
        }, (err) => {
            console.error("Moods Snapshot error: ", err);
        });
    }

    // Logout Logic
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'auth.html';
        });
    }

    // --- Core Interaction ---
    function setMoodSequence(moodKey) {
        currentMood = moodKey;
        
        moodBtns.forEach(btn => btn.classList.remove('active-mood'));
        document.querySelector(`.mood-btn[data-mood="${moodKey}"]`).classList.add('active-mood');
        
        const moodProfile = MOODS[moodKey];
        // Increased opacity from '1a' to '66' (40%) to powerfully tint the photograph via CSS blend modes
        body.style.backgroundColor = moodProfile.hex + '66'; 
        moodLabel.style.color = moodProfile.hex;

        // Dynamic Gita Glow
        gitaCard.style.borderLeftColor = moodProfile.hex;
        gitaCard.style.boxShadow = `0 10px 25px -5px ${moodProfile.hex}40`;
        gitaHeadingText.style.color = moodProfile.hex;
        gitaRefText.style.color = moodProfile.hex;
        
        renderContent(moodKey);

        if(contentDisplay.classList.contains('hidden')) {
            contentDisplay.classList.remove('hidden');
            setTimeout(() => {
                contentDisplay.classList.remove('opacity-0');
            }, 50);
        }

        logMoodToFirestore(moodKey);
    }

    function renderContent(moodKey) {
        quoteText.classList.remove('fade-in');
        quoteText.classList.add('fade-out');
        actionText.classList.remove('fade-in');
        actionText.classList.add('fade-out');
        gitaQuoteText.classList.remove('fade-in');
        gitaQuoteText.classList.add('fade-out');
        gitaRefText.classList.remove('fade-in');
        gitaRefText.classList.add('fade-out');

        setTimeout(() => {
            const dbRef = MOOD_DATABASE[moodKey];
            let idx = moodIndexes[moodKey];
            
            if (idx >= dbRef.quotes.length) {
                idx = 0; 
                dbRef.quotes.sort(() => Math.random() - 0.5);
                dbRef.tasks.sort(() => Math.random() - 0.5);
                dbRef.videos.sort(() => Math.random() - 0.5);
            }
            
            // Standard Content
            moodLabel.textContent = `${MOODS[moodKey].label} Mode`;
            quoteText.textContent = `"${dbRef.quotes[idx]}"`;
            actionText.textContent = dbRef.tasks[idx];
            videoIframe.src = dbRef.videos[idx];
            
            checkIfSaved(dbRef.quotes[idx]);
            moodIndexes[moodKey]++;

            // Gita Content
            const gitaDB = gitaQuotes[moodKey];
            let gIdx = gitaIndexes[moodKey];
            if (gIdx >= gitaDB.length) {
                gIdx = 0;
                gitaDB.sort(() => Math.random() - 0.5);
            }
            gitaQuoteText.textContent = `"${gitaDB[gIdx].text}"`;
            gitaRefText.textContent = `— ${gitaDB[gIdx].reference}`;
            
            checkIfGitaSaved(gitaDB[gIdx].text);
            gitaIndexes[moodKey] = gIdx + 1;

            quoteText.classList.remove('fade-out');
            quoteText.classList.add('fade-in');
            actionText.classList.remove('fade-out');
            actionText.classList.add('fade-in');
            gitaQuoteText.classList.remove('fade-out');
            gitaQuoteText.classList.add('fade-in');
            gitaRefText.classList.remove('fade-out');
            gitaRefText.classList.add('fade-in');
        }, 300);
    }

    moodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedMood = e.currentTarget.getAttribute('data-mood');
            setMoodSequence(selectedMood);
        });
    });

    btnRefresh.addEventListener('click', () => {
        if(currentMood) renderContent(currentMood);
    });

    btnSurprise.addEventListener('click', () => {
        const moodKeys = Object.keys(MOODS);
        const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
        setMoodSequence(randomMood);
    });

    // --- Audio Control ---
    btnMusic.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            btnMusic.innerHTML = '<i class="fas fa-play"></i>';
            btnMusic.classList.remove('bg-teal-100', 'text-teal-600');
        } else {
            bgMusic.play().catch(e => console.log('Audio play failed', e));
            btnMusic.innerHTML = '<i class="fas fa-music"></i>';
            btnMusic.classList.add('bg-teal-100', 'text-teal-600');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // --- Save Favorites to Firestore ---
    function checkIfSaved(quoteStr) {
        const isSaved = savedQuotesData.some(q => q.content === quoteStr && q.type !== 'gita');
        if(isSaved) {
            saveIcon.classList.remove('far');
            saveIcon.classList.add('fas', 'text-red-500');
        } else {
            saveIcon.classList.add('far');
            saveIcon.classList.remove('fas', 'text-red-500');
        }
    }

    function checkIfGitaSaved(quoteStr) {
        const isSaved = savedQuotesData.some(q => q.content === quoteStr && q.type === 'gita');
        if(isSaved) {
            saveGitaIcon.classList.remove('far');
            saveGitaIcon.classList.add('fas', 'text-red-500');
        } else {
            saveGitaIcon.classList.add('far');
            saveGitaIcon.classList.remove('fas', 'text-red-500');
        }
    }

    btnSaveQuote.addEventListener('click', async () => {
        if (!currentAuthenticatedUser) return;
        const currentQuoteStr = quoteText.textContent.replace(/"/g, ''); 
        const existingQuote = savedQuotesData.find(q => q.content === currentQuoteStr && q.type !== 'gita');
        const favColRef = collection(db, `users/${currentAuthenticatedUser.uid}/favorites`);
        
        saveIcon.classList.add('fa-spin', 'opacity-50');

        try {
            if (existingQuote) {
                await deleteDoc(doc(db, `users/${currentAuthenticatedUser.uid}/favorites`, existingQuote.id));
            } else {
                await addDoc(favColRef, {
                    type: 'quote',
                    content: currentQuoteStr,
                    mood: currentMood,
                    savedAt: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error("Error saving favorite:", e);
        } finally {
            saveIcon.classList.remove('fa-spin', 'opacity-50');
        }
    });

    btnSaveGita.addEventListener('click', async () => {
        if (!currentAuthenticatedUser) return;
        const currentGitaStr = gitaQuoteText.textContent.replace(/"/g, ''); 
        // We find by content AND type so standard quotes and gita quotes won't conflict
        const existingQuote = savedQuotesData.find(q => q.content === currentGitaStr && q.type === 'gita');
        const favColRef = collection(db, `users/${currentAuthenticatedUser.uid}/favorites`);
        
        saveGitaIcon.classList.add('fa-spin', 'opacity-50');

        try {
            if (existingQuote) {
                await deleteDoc(doc(db, `users/${currentAuthenticatedUser.uid}/favorites`, existingQuote.id));
            } else {
                const parts = gitaRefText.textContent.split('—');
                const rawRef = parts.length > 1 ? parts[1].trim() : parts[0].trim();
                await addDoc(favColRef, {
                    type: 'gita',
                    content: currentGitaStr,
                    reference: rawRef,
                    mood: currentMood,
                    savedAt: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error("Error saving gita favorite:", e);
        } finally {
            saveGitaIcon.classList.remove('fa-spin', 'opacity-50');
        }
    });

    // --- Modals ---
    function openModal(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.firstElementChild.classList.remove('scale-95');
            modal.firstElementChild.classList.add('scale-100');
        }, 10);
    }

    function closeModal(modal) {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.remove('scale-100');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.currentTarget.closest('.fixed'));
        });
    });

    // Open Favorites
    btnFavorites.addEventListener('click', () => {
        favoritesList.innerHTML = '';
        if(savedQuotesData.length === 0) {
            favoritesList.innerHTML = '<p class="text-gray-500 text-center py-4">No quotes saved yet.</p>';
        } else {
            savedQuotesData.forEach((quoteObj) => {
                const p = document.createElement('div');
                
                if (quoteObj.type === 'gita') {
                    p.className = 'p-4 bg-orange-50 rounded-xl border border-orange-100 text-gray-800 italic border-l-4 border-l-orange-500 shadow-sm flex flex-col gap-2 relative group';
                    p.innerHTML = `
                        <span class="text-sm pr-6 leading-relaxed">"${quoteObj.content}"</span>
                        <span class="text-xs font-bold text-orange-500 text-right">— ${quoteObj.reference || 'Bhagavad Gita'}</span>
                    `;
                } else {
                    p.className = 'p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic border-l-4 border-l-teal-500 shadow-sm flex justify-between gap-4 relative group';
                    p.innerHTML = `
                        <span class="text-sm pr-6 leading-relaxed">"${quoteObj.content}"</span>
                    `;
                }
                
                const delBtn = document.createElement('button');
                delBtn.className = 'absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100';
                delBtn.innerHTML = '<i class="fas fa-trash"></i>';
                delBtn.onclick = () => removeFavoriteFirebase(quoteObj.id);

                p.appendChild(delBtn);
                favoritesList.appendChild(p);
            });
        }
        openModal(modalFavorites);
    });

    async function removeFavoriteFirebase(docId) {
        if (!currentAuthenticatedUser) return;
        try {
            await deleteDoc(doc(db, `users/${currentAuthenticatedUser.uid}/favorites`, docId));
            // Snapshot hook handles the UI list refresh seamlessly
            setTimeout(() => {
                if(!modalFavorites.classList.contains('hidden')) {
                    btnFavorites.click(); // Hacky refresh of the modal list
                }
            }, 300);
        } catch (e) {
            console.error("Error deleting fav", e);
        }
    }

    // --- Mood Tracker using Firestore ---
    async function logMoodToFirestore(moodKey) {
        if (!currentAuthenticatedUser) return;
        
        try {
            await addDoc(collection(db, `users/${currentAuthenticatedUser.uid}/moods`), {
                moodName: moodKey,
                label: MOODS[moodKey].label,
                color: MOODS[moodKey].hex,
                score: MOODS[moodKey].score,
                timestamp: new Date().toISOString()
            });
        } catch(e) {
            console.error("Failed writing mood:", e);
        }
    }

    let chartInstance = null;

    btnTracker.addEventListener('click', () => {
        openModal(modalTracker);
        
        // Calculate max score per day from history
        const dynamicMoodLog = {};
        rawMoodHistory.forEach(entry => {
            const dateStr = entry.timestamp.split('T')[0];
            if (!dynamicMoodLog[dateStr] || entry.score > dynamicMoodLog[dateStr]) {
                dynamicMoodLog[dateStr] = entry.score; // Store highest emotional score of the day
            }
        });

        // Prepare Data for Last 7 Days
        const labels = [];
        const data = [];
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const prettyLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(prettyLabel);
            data.push(dynamicMoodLog[dateStr] || null); 
        }

        const ctx = document.getElementById('moodChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Vitality (1-6)',
                    data: data,
                    borderColor: '#14b8a6', // Teal
                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 7, ticks: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    });
});
