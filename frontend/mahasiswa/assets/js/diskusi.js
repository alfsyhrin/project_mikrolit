import { getAllDiscussionRequest, getDiscussionChatRequest, sendDiscussionMessageRequest, markDiscussionAsReadRequest } from "../../../assets/api.js";

// ✅ Global state untuk track room yang dipilih
let selectedRoomId = null;

// ✅ BARU: Global state untuk tracking chat input handler
let chatHandlerInitialized = false;

// ✅ BARU: Global state untuk auto-refresh polling
let pollIntervalId = null;
const POLL_INTERVAL = 3000; // 3 detik
let isPolling = false;

// ✅ BARU: Track scroll-based refresh untuk prevent spam
let lastScrollRefresh = 0;
const SCROLL_REFRESH_DEBOUNCE = 2000; // 2 detik debounce

export function initDiskusiFullscreen() {
    const btn = document.getElementById("btnFullscreenDiskusi");
    const container = document.getElementById("containerDiskusi");

    if (!btn || !container) return;

    let isFullscreen = false;

    btn.addEventListener("click", () => {
        isFullscreen = !isFullscreen;

        if (isFullscreen) {
            container.classList.add("fullscreen");

            btn.innerHTML = `
                <span class="material-symbols-outlined">close_fullscreen</span>
            `;

            // Optional: disable scroll body
            document.body.style.overflow = "hidden";
        } else {
            container.classList.remove("fullscreen");

            btn.innerHTML = `
                <span class="material-symbols-outlined">open_in_full</span>
            `;

            document.body.style.overflow = "auto";
        }
    });
}

// ✅ BARU: Auto-refresh chat setiap 3 detik untuk real-time feel
async function startPollingChat() {
    if (isPolling || pollIntervalId) return; // Jangan start dua kali
    
    isPolling = true;
    console.log(`[POLLING] Started polling for room: ${selectedRoomId}`);
    
    pollIntervalId = setInterval(async () => {
        if (selectedRoomId && isPolling) {
            try {
                // Fetch messages untuk room yang aktif
                const token = localStorage.getItem("token");
                const response = await getDiscussionChatRequest(token, selectedRoomId);
                
                if (response?.status === 200 && response?.data?.length > 0) {
                    const container = document.getElementById("containerDiskusi");
                    const currentMessages = container?.querySelectorAll("[data-message-id]") || [];
                    
                    // Jika ada message baru, re-render otomatis
                    if (response.data.length !== currentMessages.length) {
                        console.log(`[POLLING] Message update detected! Auto-refreshing...`);
                        await renderDiskusiChat(selectedRoomId);
                    }
                }
            } catch (error) {
                console.error("[POLLING] Error:", error);
            }
        }
    }, POLL_INTERVAL);
}

// ✅ BARU: Stop polling ketika switch room
function stopPollingChat() {
    if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
        isPolling = false;
        console.log(`[POLLING] Stopped polling`);
    }
}

// ✅ BARU: Detect scroll ke bottom dan auto-refresh messages
function attachScrollDetection(container) {
    if (!container) return;
    
    container.addEventListener('scroll', () => {
        // Cek apakah sudah scroll ke bottom
        const isAtBottom = Math.abs(
            container.scrollHeight - container.clientHeight - container.scrollTop
        ) < 50; // 50px threshold
        
        if (isAtBottom) {
            const now = Date.now();
            
            // Debounce: hanya refresh jika 2 detik sudah berlalu sejak refresh terakhir
            if (now - lastScrollRefresh > SCROLL_REFRESH_DEBOUNCE) {
                console.log(`[SCROLL] User at bottom - auto-refreshing chat`);
                lastScrollRefresh = now;
                
                // Refresh messages tanpa full page reload
                if (selectedRoomId) {
                    renderDiskusiChat(selectedRoomId).catch(err => {
                        console.error("[SCROLL] Error refreshing:", err);
                    });
                }
            }
        }
    });
}

// ✅ Render list room diskusi dari API
export async function renderDiskusiTopics() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Token tidak ditemukan");
            return;
        }

        console.log("🔍 Fetching discussion rooms...");
        
        // Fetch semua discussion rooms
        const response = await getAllDiscussionRequest(token);
        console.log("📨 API Response:", response);
        
        if (!response.success || !response.data) {
            console.warn("⚠️ Tidak ada discussion room atau response error:", response);
            const wrapper = document.querySelector(".wrapper-card-topik-diskusi");
            if (wrapper) {
                wrapper.innerHTML = `<p style="padding: 20px; color: #999;">Belum ada ruang diskusi tersedia</p>`;
            }
            return;
        }

        const wrapper = document.querySelector(".wrapper-card-topik-diskusi");
        if (!wrapper) {
            console.warn("⚠️ Wrapper topik diskusi tidak ditemukan");
            return;
        }

        // Clear existing cards
        wrapper.innerHTML = "";

        // Render setiap room
        response.data.forEach((room, index) => {
            const cardHtml = `
                <div class="card-topik-diskusi ${index === 0 ? 'active' : ''}" data-room-id="${room.room_id}">
                    <p class="icon-topik-diskusi">
                        <span class="material-symbols-outlined">chat</span>
                    </p>
                    <div class="info-topik-diskusi">
                        <h3>${room.title}</h3>
                        <span>${room.message_count} Pesan${room.unread_count > 0 ? ` (${room.unread_count} baru)` : ''}</span>
                    </div>
                </div>
            `;
            wrapper.innerHTML += cardHtml;
        });

        console.log("✅ Rooms rendered:", response.data.length);

        // ✅ Set room pertama sebagai active dan load chatnya
        selectedRoomId = response.data[0].room_id;
        console.log("✅ Selected Room ID:", selectedRoomId);
        
        await renderDiskusiChat(selectedRoomId);

        // ✅ Add event listener ke semua card
        const cards = document.querySelectorAll(".card-topik-diskusi");
        cards.forEach(card => {
            card.addEventListener("click", async () => {
                // Remove active class dari semua card
                cards.forEach(c => c.classList.remove("active"));
                // Add active ke card yang diklik
                card.classList.add("active");
                
                const roomId = card.getAttribute("data-room-id");
                selectedRoomId = roomId;
                
                console.log("🔄 Loading room:", roomId);
                
                // ✅ BARU: Stop polling lama, start yang baru
                stopPollingChat();
                
                // Load chat room
                await renderDiskusiChat(roomId);
            });
        });

        // ✅ BARU: Setup chat input handler SEKALI SAJA
        if (!chatHandlerInitialized) {
            console.log("🔌 Initializing chat handler...");
            initDiskusiChatInputHandlerOnce();
            chatHandlerInitialized = true;
        }

    } catch (error) {
        console.error("❌ Error rendering diskusi topics:", error);
    }
}

// ✅ Render chat messages untuk selected room
export async function renderDiskusiChat(roomId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Token tidak ditemukan");
            return;
        }

        console.log("🔍 Fetching chat for room:", roomId);
        console.log("📌 Current selectedRoomId:", selectedRoomId);

        // ✅ VALIDATION: Pastikan roomId benar-benar valid
        if (!roomId || roomId !== selectedRoomId) {
            console.warn("⚠️ Room ID mismatch! roomId:", roomId, "selectedRoomId:", selectedRoomId);
            selectedRoomId = roomId; // Force update
        }

        // ✅ BARU: Mark messages as read saat room dibuka
        try {
            const readResponse = await markDiscussionAsReadRequest(token, roomId);
            console.log("✅ Messages marked as read:", readResponse);
        } catch (readErr) {
            console.warn("⚠️ Error marking as read:", readErr);
        }

        // Fetch chat messages dari room
        const response = await getDiscussionChatRequest(token, roomId);
        
        const chatContainer = document.querySelector(".wrapper-card-pesan-diskusi");
        if (!chatContainer) {
            console.warn("⚠️ Chat container tidak ditemukan");
            return;
        }

        // ✅ BARU: Update title di sebelah kanan dengan nama room
        const roomTitleEl = document.getElementById("roomTitle");
        if (roomTitleEl) {
            // Ambil title dari data yang sudah di-render di kiri
            const activeCard = document.querySelector(".card-topik-diskusi.active h3");
            if (activeCard) {
                roomTitleEl.textContent = activeCard.textContent;
            }
        }

        // ✅ BARU: Track apakah user sudah di bottom sebelum render
        const wasAtBottom = chatContainer && (
            Math.abs(chatContainer.scrollHeight - chatContainer.clientHeight - chatContainer.scrollTop) < 50
        );

        // Clear existing messages
        chatContainer.innerHTML = "";

        if (!response.success || !response.data || response.data.length === 0) {
            chatContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666;">
                    <p>Belum ada pesan. Jadilah yang pertama memulai diskusi!</p>
                </div>
            `;
        } else {
            // Render setiap pesan
            response.data.forEach(message => {
                const roleClass = message.role === 'dosen' ? 'dosen' : 'mahasiswa';
                // ✅ Ambil inisial dari nama (2 karakter pertama)
                const initials = message.user_name.substring(0, 2).toUpperCase();
                
                // ✅ Format waktu relatif
                const timeAgo = formatTimeAgo(new Date(message.created_at));
                
                const messageHtml = `
                    <div class="card-pesan-diskusi" data-message-id="${message.id}">
                        <p class="icon-pesan-diskusi ${roleClass}">
                            ${initials}
                        </p>
                        <div class="info-pesan-diskusi">
                            <div class="meta-user-diskusi">
                                <h3>${message.user_name}</h3>
                                <span class="role">${message.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}</span>
                                <p class="waktu-pesan">
                                    <span class="material-symbols-outlined">pace</span>
                                    ${timeAgo}
                                </p>
                            </div>
                            <div class="pesan-diskusi">
                                <p>${message.message_text}</p>
                            </div>
                        </div>
                    </div>
                `;
                chatContainer.innerHTML += messageHtml;
            });
        }

        console.log("✅ Chat rendered for room:", roomId);

        // ✅ BARU: Attach scroll detection ke chat container
        if (chatContainer) {
            attachScrollDetection(chatContainer);
            
            // ✅ Auto-scroll ke bottom HANYA jika user sudah di bottom sebelumnya
            // Ini preserve scroll position jika user scroll ke atas (untuk lihat history)
            if (wasAtBottom) {
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    console.log("[AUTO-SCROLL] Scrolled to bottom (user was at bottom)");
                }, 50);
            }
        }

        // ✅ BARU: Start polling untuk auto-refresh messages
        stopPollingChat(); // Stop polling lama dulu
        startPollingChat(); // Start polling untuk room baru
        
    } catch (error) {
        console.error("❌ Error rendering diskusi chat:", error);
    }
}

// ✅ Helper: Format waktu menjadi format relatif (misal: "2 hari lalu")
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID');
}

// ✅ BARU: Initialize chat input handler - setup SEKALI SAJA saat diskusi page load
function initDiskusiChatInputHandlerOnce() {
    const inputEl = document.getElementById("inputDiskusi");
    const sendBtn = document.getElementById("btnSendDiskusi");

    if (!inputEl || !sendBtn) {
        console.warn("⚠️ Input atau button tidak ditemukan");
        return;
    }

    console.log("✅ Setting up chat input handler (one-time)");

    // ✅ FIX: Jangan clone, langsung attach event listener
    // Click handler
    sendBtn.addEventListener("click", async () => {
        await handleSendMessage(inputEl, sendBtn);
    });

    // ✅ Enter key support
    inputEl.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await handleSendMessage(inputEl, sendBtn);
        }
    });

    console.log("🔌 Chat input handler ready");
}

// ✅ BARU: Handle send message logic dengan roomId validation
async function handleSendMessage(inputEl, sendBtn) {
    try {
        const token = localStorage.getItem("token");
        const messageText = inputEl.value.trim();
        
        // ✅ CRITICAL: Validate token & message
        if (!token) {
            console.error("❌ Token tidak ditemukan");
            alert("Session expired! Silahkan refresh halaman");
            return;
        }

        if (!messageText) {
            console.warn("⚠️ Pesan kosong");
            inputEl.focus();
            return;
        }

        // ✅ CRITICAL: Validate roomId SEBELUM send
        if (!selectedRoomId) {
            console.error("❌ Room ID tidak valid:", selectedRoomId);
            alert("Silahkan pilih room terlebih dahulu!");
            return;
        }

        console.log("📤 Sending message to room:", selectedRoomId, "| Message:", messageText);
        
        // ✅ Disable button & show loading state
        sendBtn.disabled = true;
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = `<p><span class="material-symbols-outlined">hourglass_empty</span></p>`;

        // ✅ Send message ke API dengan selectedRoomId
        const response = await sendDiscussionMessageRequest(token, selectedRoomId, messageText);

        if (!response.success) {
            throw new Error(response.message || "Gagal mengirim pesan");
        }

        console.log("✅ Message sent successfully to room", selectedRoomId, ":", response);

        // ✅ Clear input field
        inputEl.value = "";
        inputEl.focus();

        // ✅ Show success feedback
        sendBtn.innerHTML = `<p><span class="material-symbols-outlined" style="color: #4CAF50;">check_circle</span></p>`;
        await new Promise(resolve => setTimeout(resolve, 500));

        // ✅ Re-render chat untuk show pesan baru
        console.log("🔄 Re-rendering chat for room:", selectedRoomId);
        await renderDiskusiChat(selectedRoomId);

    } catch (error) {
        console.error("❌ Error sending message:", error);
        alert(`Gagal mengirim pesan: ${error.message}`);
        
        // ✅ Restore button state saat error
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<p><span class="material-symbols-outlined">send</span></p>`;
    } finally {
        // ✅ Re-enable button (if not timed out by success state)
        if (sendBtn.disabled) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = `<p><span class="material-symbols-outlined">send</span></p>`;
        }
    }
}