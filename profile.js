import { onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

document.addEventListener('DOMContentLoaded', () => {

    let currentAuthenticatedUser = null;
    let userDetails = null;
    let rawMoodHistory = [];
    let savedQuotesData = [];

    // --- UI Elements ---
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    const historyList = document.getElementById('history-list');
    const favoritesList = document.getElementById('favorites-list');
    
    const topMoodColor = document.getElementById('top-mood-color');
    const topMoodName = document.getElementById('top-mood-name');
    const totalCheckins = document.getElementById('total-checkins');

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
                userDetails = { name: user.displayName || "Unknown Teacher", email: user.email };
            }
        } catch (error) {
            console.error(error);
            userDetails = { name: "Teacher (DB Error)", email: user.email };
        }
        renderProfileHeader();

        // Real-time listen for History & Favorites
        setupDataStreams(user.uid);
    });

    function setupDataStreams(uid) {
        // Mood History Real-time Hook
        const moodRef = query(collection(db, `users/${uid}/moods`), orderBy("timestamp", "desc"));
        onSnapshot(moodRef, (snapshot) => {
            rawMoodHistory = [];
            snapshot.forEach(docSnap => {
                rawMoodHistory.push({ id: docSnap.id, ...docSnap.data() });
            });
            renderHistoryAndInsights();
        }, (err) => console.error(err));

        // Favorites Real-time Hook
        const favRef = query(collection(db, `users/${uid}/favorites`), orderBy("savedAt", "desc"));
        onSnapshot(favRef, (snapshot) => {
            savedQuotesData = [];
            snapshot.forEach(docSnap => {
                savedQuotesData.push({ id: docSnap.id, ...docSnap.data() });
            });
            renderFavorites();
        }, (err) => console.error(err));
    }

    // --- Renders ---
    function renderProfileHeader() {
        if (!userDetails) return;
        profileName.textContent = userDetails.name;
        profileEmail.textContent = userDetails.email;
        profileAvatar.textContent = userDetails.name.charAt(0).toUpperCase();
    }

    function renderHistoryAndInsights() {
        // Insights logic
        totalCheckins.textContent = rawMoodHistory.length;

        if (rawMoodHistory.length > 0) {
            const moodCounts = {};
            let maxCount = 0;
            let topMoodLabel = '';
            let topMoodColorVal = '';

            rawMoodHistory.forEach(entry => {
                moodCounts[entry.moodName] = (moodCounts[entry.moodName] || 0) + 1;
                if (moodCounts[entry.moodName] > maxCount) {
                    maxCount = moodCounts[entry.moodName];
                    topMoodLabel = entry.label;
                    topMoodColorVal = entry.color;
                }
            });

            topMoodName.textContent = topMoodLabel;
            topMoodColor.style.backgroundColor = topMoodColorVal;
        } else {
            topMoodName.textContent = "Not enough data";
            topMoodColor.style.backgroundColor = "#e5e7eb";
        }

        // Render History List
        historyList.innerHTML = '';
        if (rawMoodHistory.length === 0) {
            historyList.innerHTML = '<p class="text-sm text-gray-400 italic mt-4 text-center">No moods logged yet.</p>';
        } else {
            rawMoodHistory.forEach(entry => {
                const dt = new Date(entry.timestamp);
                const timeString = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const dateString = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const item = document.createElement('div');
                item.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-0.5';
                item.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${entry.color || '#ccc'}"></div>
                        <span class="font-medium text-gray-700 text-sm">${entry.label || entry.moodName}</span>
                    </div>
                    <div class="text-xs text-gray-400 font-medium">
                        ${dateString} • ${timeString}
                    </div>
                `;
                historyList.appendChild(item);
            });
        }
    }

    function renderFavorites() {
        favoritesList.innerHTML = '';
        if (savedQuotesData.length === 0) {
            favoritesList.innerHTML = '<p class="text-sm text-gray-400 italic mt-4 text-center">No quotes saved yet.</p>';
        } else {
            savedQuotesData.forEach((fav) => {
                const item = document.createElement('div');
                const txt = document.createElement('span');
                txt.className = "text-sm pr-6 leading-relaxed";
                txt.textContent = `"${fav.content}"`;

                const btn = document.createElement('button');
                btn.className = "absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100";
                btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                btn.onclick = async () => {
                    btn.classList.add('opacity-50');
                    await deleteDoc(doc(db, `users/${currentAuthenticatedUser.uid}/favorites`, fav.id));
                };

                if (fav.type === 'gita') {
                    item.className = 'p-4 bg-orange-50 rounded-xl border border-orange-100 text-gray-800 italic border-l-4 border-l-orange-500 shadow-sm flex flex-col gap-2 relative group transition-transform hover:-translate-y-0.5';
                    const refTxt = document.createElement('span');
                    refTxt.className = "text-xs font-bold text-orange-500 text-right";
                    refTxt.textContent = `— ${fav.reference || 'Bhagavad Gita'}`;
                    item.appendChild(txt);
                    item.appendChild(refTxt);
                } else {
                    item.className = 'p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic border-l-4 border-l-teal-500 shadow-sm flex flex-col gap-2 relative group transition-transform hover:-translate-y-0.5';
                    item.appendChild(txt);
                }

                item.appendChild(btn);
                favoritesList.appendChild(item);
            });
        }
    }

    // --- Logout Logic ---
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'auth.html';
    });

    // --- Edit Profile Modal ---
    const btnEditProfile = document.getElementById('btn-edit-profile');
    const modalEditProfile = document.getElementById('modal-edit-profile');
    const btnCloseEdit = document.querySelector('.modal-close-edit');
    const formEdit = document.getElementById('form-edit-profile');
    const editError = document.getElementById('edit-error');

    function openEditModal() {
        if (!userDetails) return;
        document.getElementById('edit-name').value = userDetails.name;
        document.getElementById('edit-email').value = userDetails.email;
        document.getElementById('edit-password').value = '';
        editError.classList.add('hidden');

        modalEditProfile.classList.remove('hidden');
        modalEditProfile.classList.add('flex');
        setTimeout(() => {
            modalEditProfile.classList.remove('opacity-0');
            modalEditProfile.firstElementChild.classList.remove('scale-95');
            modalEditProfile.firstElementChild.classList.add('scale-100');
        }, 10);
    }

    function closeEditModal() {
        modalEditProfile.classList.add('opacity-0');
        modalEditProfile.firstElementChild.classList.remove('scale-100');
        modalEditProfile.firstElementChild.classList.add('scale-95');
        setTimeout(() => {
            modalEditProfile.classList.add('hidden');
            modalEditProfile.classList.remove('flex');
        }, 300);
    }

    btnEditProfile.addEventListener('click', openEditModal);
    btnCloseEdit.addEventListener('click', closeEditModal);

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = document.getElementById('edit-name').value.trim();
        const newPass = document.getElementById('edit-password').value;
        const submitBtn = formEdit.querySelector('button[type="submit"]');

        if (!newName) {
            editError.textContent = "Name cannot be empty.";
            editError.classList.remove('hidden');
            return;
        }

        if (newPass && newPass.length < 6) {
            editError.textContent = "New password must be at least 6 characters.";
            editError.classList.remove('hidden');
            return;
        }

        try {
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            // Update Name in Firestore
            if (newName !== userDetails.name) {
                await setDoc(doc(db, "users", currentAuthenticatedUser.uid), {
                    name: newName,
                    email: userDetails.email,
                    createdAt: new Date().toISOString()
                }, { merge: true });
                userDetails.name = newName;
                renderProfileHeader(); // Immediate local replace
            }

            // Update Password via Firebase Auth
            if (newPass) {
                await updatePassword(currentAuthenticatedUser, newPass);
            }

            closeEditModal();
        } catch(error) {
            console.error(error);
            if(error.code === 'auth/requires-recent-login') {
                editError.textContent = "For security, changing passwords requires you to re-authenticate. Please log out and back in.";
            } else {
                editError.textContent = "Error saving profile: " + error.message;
            }
            editError.classList.remove('hidden');
        } finally {
            submitBtn.textContent = 'Save Changes';
            submitBtn.disabled = false;
        }
    });

    // --- CSV Export Logic ---
    document.getElementById('btn-download-csv').addEventListener('click', () => {
        if(rawMoodHistory.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Time,Mood Label,Hex Color\n"; // Header

        rawMoodHistory.forEach(entry => {
            if(!entry.timestamp) return;
            const dt = new Date(entry.timestamp);
            const dateStr = dt.toLocaleDateString('en-US');
            const timeStr = dt.toLocaleTimeString('en-US');
            csvContent += `"${dateStr}","${timeStr}","${entry.label || entry.moodName}","${entry.color || ''}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `EduMood_history_${userDetails?.email?.split('@')[0] || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

});
