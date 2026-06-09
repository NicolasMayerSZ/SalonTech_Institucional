const MAX_VISIBLE = 10;
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const feedbackRow = document.querySelector("#feedback .row");
const avaliacaoForm = document.querySelector(".avaliacao-form");
const firebaseConfig = {
    apiKey: "AIzaSyBLyrnpoVjuyPN1CTENcugyAEfMjbxSors",
    authDomain: "salontech-web03.firebaseapp.com",
    databaseURL: "https://salontech-web03-default-rtdb.firebaseio.com",
    projectId: "salontech-web03",
    storageBucket: "salontech-web03.firebasestorage.app",
    messagingSenderId: "558051338399",
    appId: "1:558051338399:web:db190fbc6210541cf9daaa",
    measurementId: "G-1E2MC2M19P"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const reviewsRef = database.ref("avaliacoes");

let allReviews = [];
let visibleCount = MAX_VISIBLE;

function renderReview(review) {
    if (!feedbackRow) return;

    const article = document.createElement("article");
    article.className = "col-md-6";
    article.innerHTML = `
        <div class="testimonial">
            ${review.nota || "⭐"}
            <p>${review.experiencia || ""}</p>
            <h6>${review.nome || "Cliente"}</h6>
            <p class="testimonial-date">${review.data || ""}</p>
        </div>
    `;

    feedbackRow.appendChild(article);
}

function renderVisibleReviews() {
    if (!feedbackRow) return;

    feedbackRow.innerHTML = "";

    const reviewsToShow = allReviews.slice(0, visibleCount);
    reviewsToShow.forEach(renderReview);

    const showMoreButton = document.getElementById("show-more-reviews");
    if (showMoreButton) {
        showMoreButton.style.display = allReviews.length > visibleCount ? "inline-block" : "none";
    }
}

// function loadReviews() {
//     if (!feedbackRow) return;

//     allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
//     renderVisibleReviews();
// }

async function loadReviews() {
    try {
        const snapshot = await reviewsRef.orderByChild("timestamp").once("value");
        const data = snapshot.val() || {};

        allReviews = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        renderVisibleReviews();
    } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
    }
}

// function saveReview(review) {
//     allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
//     allReviews.unshift(review);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
//     visibleCount = MAX_VISIBLE;
//     renderVisibleReviews();
// }

async function saveReview(review) {
    try {
        await reviewsRef.push({
            ...review,
            timestamp: Date.now()
        });

        await loadReviews();
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
    }
}

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (pageYOffset >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });

});

if (avaliacaoForm) {
    avaliacaoForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = document.getElementById("nome-avaliacao")?.value.trim() || "Cliente";
        const nota = document.getElementById("nota-avaliacao")?.value || "⭐";
        const experiencia = document.getElementById("experiencia-avaliacao")?.value.trim() || "Atendimento excelente!";
        const data = new Date().toLocaleDateString("pt-BR");

        const review = {
            nome,
            nota,
            experiencia,
            data
        };

        await saveReview(review);
        avaliacaoForm.reset();
    });
}

const showMoreButton = document.getElementById("show-more-reviews");
if (showMoreButton) {
    showMoreButton.addEventListener("click", () => {
        visibleCount += MAX_VISIBLE;
        renderVisibleReviews();
    });
}

loadReviews();