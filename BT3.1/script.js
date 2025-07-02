// -------------------------------------------------
// ------------------ Utilities --------------------
// -------------------------------------------------

// Math utilities
// -------------------------------------------------
// ------------------ Utilities --------------------
// -------------------------------------------------

const wrap = (n, max) => (n + max) % max;
const lerp = (a, b, t) => a + (b - a) * t;

const genId = (() => {
let count = 0;
return () => {
    return (count++).toString();
};
})();

class Raf {
constructor() {
    this.rafId = 0;
    this.raf = this.raf.bind(this);
    this.callbacks = [];
    this.start();
}

start() {
    this.raf();
}

stop() {
    cancelAnimationFrame(this.rafId);
}

raf() {
    this.callbacks.forEach(({ callback, id }) => callback({ id }));
    this.rafId = requestAnimationFrame(this.raf);
}

add(callback, id) {
    this.callbacks.push({ callback, id: id || genId() });
}

remove(id) {
    this.callbacks = this.callbacks.filter((callback) => callback.id !== id);
}
}

class Vec2 {
constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
}

set(x, y) {
    this.x = x;
    this.y = y;
}

lerp(v, t) {
    this.x = lerp(this.x, v.x, t);
    this.y = lerp(this.y, v.y, t);
}
}

const vec2 = (x = 0, y = 0) => new Vec2(x, y);

function tilt(node, options) {
let { trigger, target } = resolveOptions(node, options);
let lerpAmount = 0.06;

const rotDeg = { current: vec2(), target: vec2() };
const bgPos = { current: vec2(), target: vec2() };

let rafId;

function ticker({ id }) {
    rafId = id;

    rotDeg.current.lerp(rotDeg.target, lerpAmount);
    bgPos.current.lerp(bgPos.target, lerpAmount);

    for (const el of target) {
    el.style.setProperty("--rotX", rotDeg.current.y.toFixed(2) + "deg");
    el.style.setProperty("--rotY", rotDeg.current.x.toFixed(2) + "deg");
    el.style.setProperty("--bgPosX", bgPos.current.x.toFixed(2) + "%");
    el.style.setProperty("--bgPosY", bgPos.current.y.toFixed(2) + "%");
    }
}

const onMouseMove = ({ offsetX, offsetY }) => {
    lerpAmount = 0.1;

    for (const el of target) {
    const ox = (offsetX - el.clientWidth * 0.5) / (Math.PI * 3);
    const oy = -(offsetY - el.clientHeight * 0.5) / (Math.PI * 4);

    rotDeg.target.set(ox, oy);
    bgPos.target.set(-ox * 0.3, oy * 0.3);
    }
};

const onMouseLeave = () => {
    lerpAmount = 0.06;
    rotDeg.target.set(0, 0);
    bgPos.target.set(0, 0);
};

const addListeners = () => {
    trigger.addEventListener("mousemove", onMouseMove);
    trigger.addEventListener("mouseleave", onMouseLeave);
};

const removeListeners = () => {
    trigger.removeEventListener("mousemove", onMouseMove);
    trigger.removeEventListener("mouseleave", onMouseLeave);
};

const init = () => {
    addListeners();
    raf.add(ticker);
};

const destroy = () => {
    removeListeners();
    raf.remove(rafId);
};

init();

return { destroy };
}

function resolveOptions(node, options) {
return {
    trigger: options?.trigger ?? node,
    target: options?.target
    ? Array.isArray(options.target)
        ? options.target
        : [options.target]
    : [node]
};
}

// -----------------------------------------------------
// ------------------ Dog API Integration -------------
// -----------------------------------------------------

const DOG_API_URL = 'https://dog.ceo/api/breeds/image/random';
const raf = new Raf();
let dogImages = [];

// Dog breed names for titles
const dogBreeds = [
'Golden Retriever', 'Labrador', 'Husky', 'Beagle', 'Bulldog',
'Poodle', 'Rottweiler', 'German Shepherd', 'Dachshund', 'Boxer'
];

const dogQuotes = [
'Man\'s best friend',
'Loyal companion',
'Faithful guardian',
'Playful spirit',
'Unconditional love',
'Adventure buddy',
'Happy tail wagger',
'Furry family member',
'Pure joy',
'Life is better with dogs'
];

async function fetchDogImage() {
try {
    const response = await fetch(DOG_API_URL);
    const data = await response.json();
    return data.message;
} catch (error) {
    console.error('Error fetching dog image:', error);
    return null;
}
}

async function loadDogImages(count = 3) {
const promises = Array(count).fill().map(() => fetchDogImage());
const images = await Promise.all(promises);
return images.filter(img => img !== null);
}

function createSlide(imageUrl, index, isActive = false) {
const slide = document.createElement('div');
slide.className = 'slide';
if (index === 0) slide.setAttribute('data-current', '');
else if (index === 1) slide.setAttribute('data-next', '');
else slide.setAttribute('data-previous', '');

slide.innerHTML = `
    <div class="slide__inner">
    <div class="slide--image__wrapper">
        <img class="slide--image" src="${imageUrl}" alt="Dog ${index + 1}" />
    </div>
    </div>
`;

const bg = document.createElement('div');
bg.className = 'slide__bg';
bg.style.setProperty('--bg', `url(${imageUrl})`);
bg.style.setProperty('--dir', index === 0 ? '0' : index === 1 ? '1' : '-1');
if (index === 0) bg.setAttribute('data-current', '');
else if (index === 1) bg.setAttribute('data-next', '');
else bg.setAttribute('data-previous', '');

return { slide, bg };
}

function createSlideInfo(index) {
const slideInfo = document.createElement('div');
slideInfo.className = 'slide-info';
if (index === 0) slideInfo.setAttribute('data-current', '');
else if (index === 1) slideInfo.setAttribute('data-next', '');
else slideInfo.setAttribute('data-previous', '');

const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
const quote = dogQuotes[Math.floor(Math.random() * dogQuotes.length)];

slideInfo.innerHTML = `
    <div class="slide-info__inner">
    <div class="slide-info--text__wrapper">
        <div data-title class="slide-info--text">
        <span>${breed}</span>
        </div>
        <div data-subtitle class="slide-info--text">
        <span>Dog Gallery</span>
        </div>
        <div data-description class="slide-info--text">
        <span>${quote}</span>
        </div>
    </div>
    </div>
`;

return slideInfo;
}

function renderSlides() {
const slidesContainer = document.getElementById('slides-container');
const slidesInfoContainer = document.getElementById('slides-info-container');

// Clear existing content
slidesContainer.innerHTML = '';
slidesInfoContainer.innerHTML = '';

dogImages.forEach((imageUrl, index) => {
    const { slide, bg } = createSlide(imageUrl, index);
    const slideInfo = createSlideInfo(index);

    slidesContainer.appendChild(slide);
    slidesContainer.appendChild(bg);
    slidesInfoContainer.appendChild(slideInfo);
});
}

function init() {
const loader = document.querySelector(".loader");
const slides = [...document.querySelectorAll(".slide")];
const slidesInfo = [...document.querySelectorAll(".slide-info")];

const buttons = {
    prev: document.querySelector(".slider--btn__prev"),
    next: document.querySelector(".slider--btn__next")
};

loader.style.opacity = 0;
loader.style.pointerEvents = "none";

slides.forEach((slide, i) => {
    const slideInner = slide.querySelector(".slide__inner");
    const slideInfoInner = slidesInfo[i].querySelector(".slide-info__inner");
    tilt(slide, { target: [slideInner, slideInfoInner] });
});

buttons.prev.addEventListener("click", change(-1));
buttons.next.addEventListener("click", change(1));
}

function change(direction) {
return () => {
    let current = {
    slide: document.querySelector(".slide[data-current]"),
    slideInfo: document.querySelector(".slide-info[data-current]"),
    slideBg: document.querySelector(".slide__bg[data-current]")
    };
    let previous = {
    slide: document.querySelector(".slide[data-previous]"),
    slideInfo: document.querySelector(".slide-info[data-previous]"),
    slideBg: document.querySelector(".slide__bg[data-previous]")
    };
    let next = {
    slide: document.querySelector(".slide[data-next]"),
    slideInfo: document.querySelector(".slide-info[data-next]"),
    slideBg: document.querySelector(".slide__bg[data-next]")
    };

    Object.values(current).map((el) => el.removeAttribute("data-current"));
    Object.values(previous).map((el) => el.removeAttribute("data-previous"));
    Object.values(next).map((el) => el.removeAttribute("data-next"));

    if (direction === 1) {
    let temp = current;
    current = next;
    next = previous;
    previous = temp;

    current.slide.style.zIndex = "20";
    previous.slide.style.zIndex = "30";
    next.slide.style.zIndex = "10";
    } else if (direction === -1) {
    let temp = current;
    current = previous;
    previous = next;
    next = temp;

    current.slide.style.zIndex = "20";
    previous.slide.style.zIndex = "10";
    next.slide.style.zIndex = "30";
    }

    Object.values(current).map((el) => el.setAttribute("data-current", ""));
    Object.values(previous).map((el) => el.setAttribute("data-previous", ""));
    Object.values(next).map((el) => el.setAttribute("data-next", ""));
};
}

async function setup() {
const loaderText = document.querySelector(".loader__text");
loaderText.textContent = "Loading Dogs...";

try {
    dogImages = await loadDogImages(3);
    renderSlides();

    // Wait for images to load
    const images = [...document.querySelectorAll("img")];
    let loadedImages = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
    loadedImages++;
    const progress = Math.round((loadedImages / totalImages) * 100);
    loaderText.textContent = `${progress}%`;

    if (loadedImages === totalImages) {
        setTimeout(init, 500);
    }
    };

    images.forEach(img => {
    if (img.complete) {
        checkAllLoaded();
    } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
    }
    });

} catch (error) {
    console.error('Error loading dog images:', error);
    loaderText.textContent = "Error loading dogs";
}
}

async function loadNewDogs() {
const loaderText = document.querySelector(".loader__text");
const loader = document.querySelector(".loader");

loader.style.opacity = 1;
loader.style.pointerEvents = "auto";
loaderText.textContent = "Loading New Dogs...";

try {
    dogImages = await loadDogImages(3);
    renderSlides();

    const images = [...document.querySelectorAll("img")];
    let loadedImages = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
    loadedImages++;
    const progress = Math.round((loadedImages / totalImages) * 100);
    loaderText.textContent = `${progress}%`;

    if (loadedImages === totalImages) {
        setTimeout(() => {
        loader.style.opacity = 0;
        loader.style.pointerEvents = "none";
        init();
        }, 500);
    }
    };

    images.forEach(img => {
    if (img.complete) {
        checkAllLoaded();
    } else {
        img.addEventListener('load', checkAllLoaded);
        img.addEventListener('error', checkAllLoaded);
    }
    });

} catch (error) {
    console.error('Error loading new dog images:', error);
    loaderText.textContent = "Error loading dogs";
}
}

// Start the application
setup();