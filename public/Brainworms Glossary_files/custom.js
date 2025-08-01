function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

let currentBanner = getRandomArbitrary(1, 4);
const bannerElement = document.querySelector('.brainworm-banner');

// Set initial random banner
bannerElement.setAttribute('src', `./Brainworms Glossary_files/banners/banner-${currentBanner}.webp`);

// Add click handler to cycle through banners
bannerElement.addEventListener('click', () => {
  currentBanner = currentBanner % 4 + 1; // Cycle from 1-4
  bannerElement.setAttribute('src', `./Brainworms Glossary_files/banners/banner-${currentBanner}.webp`);
});

// Zoom functionality moved to json-router.js for consistency
