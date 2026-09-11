const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const albumGrid = document.getElementById("albumGrid");
const photoCount = document.getElementById("photoCount");
const emptyLabel = document.getElementById("emptyLabel");
const playBtn = document.getElementById("playBtn");
const clearBtn = document.getElementById("clearBtn");
const intervalSelect = document.getElementById("interval");
const transitionSelect = document.getElementById("transition");

const slideshow = document.getElementById("slideshow");
const slideA = document.getElementById("slideA");
const slideB = document.getElementById("slideB");
const closeSlide = document.getElementById("closeSlide");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const slideNumber = document.getElementById("slideNumber");
const progressBar = document.getElementById("progressBar");

let photos = [];
let current = 0;
let timer = null;
let activeLayer = "a";

function readFiles(files) {
  [...files].filter(file => file.type.startsWith("image/")).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      photos.push({ src: e.target.result, name: file.name });
      renderAlbum();
    };
    reader.readAsDataURL(file);
  });
}

function renderAlbum() {
  albumGrid.innerHTML = "";
  photos.forEach((photo, index) => {
    const card = document.createElement("article");
    card.className = "photo-card";
    card.style.animationDelay = `${index * 45}ms`;
    card.innerHTML = `<img src="${photo.src}" alt="${escapeHtml(photo.name)}"><span class="photo-index">${String(index+1).padStart(2,"0")}</span>`;
    card.addEventListener("click", () => openSlideshow(index));
    albumGrid.appendChild(card);
  });

  photoCount.textContent = photos.length;
  emptyLabel.textContent = photos.length ? `${photos.length} image${photos.length === 1 ? "" : "s"} ready` : "Waiting for photos…";
  playBtn.disabled = photos.length === 0;
  clearBtn.disabled = photos.length === 0;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}

function openSlideshow(index = 0) {
  if (!photos.length) return;
  current = index;
  activeLayer = "a";
  slideA.src = photos[current].src;
  slideB.src = "";
  slideA.parentElement.classList.add("active");
  slideB.parentElement.classList.remove("active");
  slideshow.className = `slideshow open ${transitionSelect.value}`;
  slideshow.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  updateSlideUI();
  startTimer();
}

function closeSlideshowFn() {
  slideshow.classList.remove("open");
  slideshow.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  stopTimer();
}

function updateSlideUI() {
  slideNumber.textContent = `${String(current + 1).padStart(2,"0")} / ${String(photos.length).padStart(2,"0")}`;
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progressBar.style.transition = `width ${intervalSelect.value}ms linear`;
      progressBar.style.width = "100%";
    });
  });
}

function showSlide(nextIndex) {
  if (!photos.length) return;
  current = (nextIndex + photos.length) % photos.length;
  const incoming = activeLayer === "a" ? slideB : slideA;
  const outgoing = activeLayer === "a" ? slideA : slideB;

  incoming.src = photos[current].src;
  incoming.parentElement.classList.add("active");
  outgoing.parentElement.classList.remove("active");
  activeLayer = activeLayer === "a" ? "b" : "a";
  updateSlideUI();
}

function next() { showSlide(current + 1); }
function previous() { showSlide(current - 1); }

function startTimer() {
  stopTimer();
  timer = setInterval(next, Number(intervalSelect.value));
  playBtn.textContent = "▶ Restart Slideshow";
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

fileInput.addEventListener("change", e => readFiles(e.target.files));

["dragenter","dragover"].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });
});
["dragleave","drop"].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
  });
});
dropZone.addEventListener("drop", e => readFiles(e.dataTransfer.files));

playBtn.addEventListener("click", () => openSlideshow(0));
clearBtn.addEventListener("click", () => {
  photos = [];
  renderAlbum();
  stopTimer();
});

closeSlide.addEventListener("click", closeSlideshowFn);
nextSlide.addEventListener("click", next);
prevSlide.addEventListener("click", previous);

intervalSelect.addEventListener("change", () => {
  if (slideshow.classList.contains("open")) startTimer();
});
transitionSelect.addEventListener("change", () => {
  slideshow.classList.remove("crossfade","zoom","slide");
  slideshow.classList.add(transitionSelect.value);
});

document.addEventListener("keydown", e => {
  if (!slideshow.classList.contains("open")) return;
  if (e.key === "Escape") closeSlideshowFn();
  if (e.key === "ArrowRight" || e.key === " ") next();
  if (e.key === "ArrowLeft") previous();
});

renderAlbum();
