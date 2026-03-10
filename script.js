const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#message");

const newVictimBtn = document.querySelector("#new-victim");
const logoutBtn = document.querySelector("#logout-btn");

const bookmarkSection = document.querySelector("#bookmark-section");
const bookmarkForm = document.querySelector("#bookmark-form");
const bookmarkTitleInput = document.querySelector("#bookmark-title");
const bookmarkUrlInput = document.querySelector("#bookmark-url");
const bookmarkList = document.querySelector("#bookmark-list");


// ---------- USERS ----------

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}


// ---------- BOOKMARKS ----------

function getBookmarks() {
    return JSON.parse(localStorage.getItem("bookmarks")) || [];
}

function saveBookmarks(bookmarks) {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}


// ---------- LOGGED IN USER ----------

function getLoggedInUser() {
    return JSON.parse(sessionStorage.getItem("loggedInUser"));
}

function setLoggedInUser(user) {
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
}

function logoutUser() {
    sessionStorage.removeItem("loggedInUser");
}


// ---------- UI ----------

function showMessage(text) {
    message.textContent = text;
}

function updateUI() {
    const loggedInUser = getLoggedInUser();

    if (loggedInUser) {
        logoutBtn.classList.remove("hidden");

        if (bookmarkSection) {
            bookmarkSection.classList.remove("hidden");
        }

        showMessage(`Du är inloggad som ${loggedInUser.username}.`);
        renderBookmarks();
    } else {
        logoutBtn.classList.add("hidden");

        if (bookmarkSection) {
            bookmarkSection.classList.add("hidden");
        }

        bookmarkList.innerHTML = "";
    }
}


// ---------- REGISTER ----------

newVictimBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showMessage("Fyll i både användarnamn och lösenord.");
        return;
    }

    const users = getUsers();

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        showMessage("Användarnamnet finns redan.");
        return;
    }

    const newUser = {
        id: Date.now(),
        username,
        password
    };

    users.push(newUser);
    saveUsers(users);

    showMessage("Användaren registrerades!");
    loginForm.reset();
});


// ---------- LOGIN ----------

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const users = getUsers();

    const matchedUser = users.find(user =>
        user.username === username && user.password === password
    );

    if (matchedUser) {
        setLoggedInUser(matchedUser);
        showMessage(`Du är nu inloggad som ${matchedUser.username}.`);
        updateUI();
    } else {
        showMessage("Fel användarnamn eller lösenord. Försök igen.");
    }

    loginForm.reset();
});


// ---------- LOGOUT ----------

logoutBtn.addEventListener("click", () => {
    logoutUser();
    showMessage("Du har loggat ut.");
    updateUI();
});


// ---------- BOOKMARKS ----------

function renderBookmarks() {
    const loggedInUser = getLoggedInUser();
    const bookmarks = getBookmarks();

    bookmarkList.innerHTML = "";

    if (!loggedInUser) return;

    const userBookmarks = bookmarks.filter(bookmark => bookmark.userId === loggedInUser.id);

    userBookmarks.forEach(bookmark => {
        const li = document.createElement("li");

        li.innerHTML = `
            <a href="${bookmark.url}" target="_blank">${bookmark.title}</a>
            <button data-id="${bookmark.id}" class="delete-bookmark">Delete</button>
        `;

        bookmarkList.appendChild(li);
    });
}

bookmarkForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
        showMessage("Du måste vara inloggad för att skapa bokmärken.");
        return;
    }

    const title = bookmarkTitleInput.value.trim();
    const url = bookmarkUrlInput.value.trim();

    if (!title || !url) {
        return;
    }

    const bookmarks = getBookmarks();

    const newBookmark = {
        id: Date.now(),
        userId: loggedInUser.id,
        title,
        url
    };

    bookmarks.push(newBookmark);
    saveBookmarks(bookmarks);
    renderBookmarks();
    bookmarkForm.reset();
});

bookmarkList.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-bookmark")) return;

    const bookmarkId = Number(event.target.dataset.id);
    const loggedInUser = getLoggedInUser();
    const bookmarks = getBookmarks();

    const updatedBookmarks = bookmarks.filter(bookmark => {
        return !(bookmark.id === bookmarkId && bookmark.userId === loggedInUser.id);
    });

    saveBookmarks(updatedBookmarks);
    renderBookmarks();
});


// ---------- START ----------

updateUI();