// Numera e atribui data-index a cada ícone
document.querySelectorAll(".icon").forEach((icon, index) => {
  const label = icon.querySelector("span");
  const name = label.textContent.trim();
  icon.setAttribute("data-index", index + 1); // Essencial para busca
  icon.setAttribute("data-name", name.toLowerCase());
});

const icons = document.querySelectorAll(".icon");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("themeToggle");
const iconBox = document.getElementById("iconBox");

// Função para mostrar a aba correta
function showTab(tab) {
  // Remove active dos botões
  document
    .querySelectorAll(".tab-button")
    .forEach((btn) => btn.classList.remove("active"));
  // Adiciona active no selecionado
  document
    .querySelector(`.tab-button[onclick="showTab('${tab}')"]`)
    .classList.add("active");

  if (tab === "todos") {
    // Mostrar todos os ícones
    icons.forEach((icon) => icon.classList.remove("hidden"));
  } else if (tab === "favoritos") {
    // Mostrar só favoritos
    icons.forEach((icon) => {
      if (isFavorite(icon)) icon.classList.remove("hidden");
      else icon.classList.add("hidden");
    });
  } else if (tab === "historicos") {
    // Mostrar histórico - ícones copiados recentemente (localStorage)
    let history = JSON.parse(localStorage.getItem("iconHistory") || "[]");
    // Oculta todos e mostra só os do histórico
    icons.forEach((icon) => {
      const emoji = icon.firstChild.textContent.trim();
      icon.classList.add("hidden");
      if (history.includes(emoji)) icon.classList.remove("hidden");
    });
  }
  filterIcons(searchInput.value);
}

// Função para filtrar ícones pelo nome
function filterIcons(query) {
  query = query.toLowerCase();
  icons.forEach((icon) => {
    if (!icon.classList.contains("hidden")) {
      const name = icon.getAttribute("data-name");
      if (!name.includes(query)) {
        icon.classList.add("hidden");
      } else {
        icon.classList.remove("hidden");
      }
    }
  });
}

// Checa se um ícone está nos favoritos
function isFavorite(icon) {
  const name = icon.getAttribute("data-name");
  const favs = JSON.parse(localStorage.getItem("iconFavorites") || "[]");
  return favs.includes(name);
}

// Adiciona ou remove favorito
function toggleFavorite(icon) {
  const name = icon.getAttribute("data-name");
  let favs = JSON.parse(localStorage.getItem("iconFavorites") || "[]");
  if (favs.includes(name)) {
    favs = favs.filter((f) => f !== name);
    icon.querySelector(".favorite-btn").textContent = "☆";
  } else {
    favs.push(name);
    icon.querySelector(".favorite-btn").textContent = "★";
  }
  localStorage.setItem("iconFavorites", JSON.stringify(favs));
}

// Inicializa favoritos no carregamento
function loadFavorites() {
  let favs = JSON.parse(localStorage.getItem("iconFavorites") || "[]");
  icons.forEach((icon) => {
    if (favs.includes(icon.getAttribute("data-name"))) {
      icon.querySelector(".favorite-btn").textContent = "★";
    } else {
      icon.querySelector(".favorite-btn").textContent = "☆";
    }
  });
}

// Guarda histórico de cópias no localStorage (últimos 20)
function saveToHistory(emoji) {
  let history = JSON.parse(localStorage.getItem("iconHistory") || "[]");
  // Remove se já existe para evitar duplicados
  history = history.filter((e) => e !== emoji);
  history.unshift(emoji); // Adiciona no começo
  if (history.length > 20) history.pop();
  localStorage.setItem("iconHistory", JSON.stringify(history));
}

// Evento clique nos ícones para copiar
icons.forEach((icon) => {
  icon.addEventListener("click", async (event) => {
    if (event.target.classList.contains("favorite-btn")) return; // Ignora clique no favorito

    // Pega o emoji puro, do nó de texto antes do span
    const emoji = icon.firstChild.textContent.trim();

    try {
      await navigator.clipboard.writeText(emoji);

      // Salva no histórico
      saveToHistory(emoji);

      // Feedback visual
      let feedback = icon.querySelector(".copy-feedback");
      if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "copy-feedback";
        feedback.textContent = "Copiado!";
        icon.appendChild(feedback);
      }
      feedback.classList.add("show");
      setTimeout(() => {
        feedback.classList.remove("show");
      }, 1500);
    } catch (err) {
      alert("Erro ao copiar o ícone. Tente novamente.");
    }
  });

  // Clique no botão de favorito
  const favBtn = icon.querySelector(".favorite-btn");
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(icon);
  });
});

// Pesquisa live
searchInput.addEventListener("input", (e) => {
  filterIcons(e.target.value);
});

// Alternar tema claro/escuro e salvar em localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Modo Claro";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Modo Escuro";
  }
}
function toggleTheme() {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Modo Claro";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "Modo Escuro";
    localStorage.setItem("theme", "light");
  }
}
themeToggle.addEventListener("click", toggleTheme);

// Inicialização
loadFavorites();
loadTheme();
showTab("todos");
