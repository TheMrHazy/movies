const STORAGE_KEY = 'movies_watch_custom_data';

async function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }
        const response = await fetch('./data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

async function init() {
    const watchlist = await loadData();
    let totalMovies = 0;
    const moviesNames = [];

    const totalMoviesElement = document.getElementById("total-movies");
    totalMoviesElement.innerHTML = totalMovies;

    if (!watchlist) {
        console.error('Failed to load data');
        return;
    }

    const watchlistMovies = watchlist.watchlist[0].movies;
    const watchedMovies = watchlist.watched[0];
    const watchlistHTML = document.getElementById("watchlist-list");
    const watchedHTML = document.getElementById("watched-list");

    function bindYearToggles() {
        const yearToggles = watchedHTML.querySelectorAll('.btn-toggle');
        yearToggles.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.nextElementSibling.classList.toggle('hidden');
                btn.querySelector('span').textContent = btn.nextElementSibling.classList.contains('hidden') ? '+' : '-';
            });
        });
    }

    function renderLists() {
        totalMovies = 0;
        moviesNames.length = 0;
        watchlistHTML.innerHTML = '';
        watchedHTML.innerHTML = '';

        // Populate watchlist
        watchlistMovies.forEach(movie => {
            const li = `
                <li class="p-2 border-b border-dotted border-black last:border-b-0 even:bg-stone-300">
                    <a href="https://www.google.com/search?q=${encodeURIComponent(movie)}+movie+trailer" target="_blank" class="flex w-full justify-between items-center gap-1.5">
                        <h4 class="text-xs capitalize font-light leading-tight break-words">${movie}</h4>
                        <p class="text-[10px] text-white font-light bg-stone-400 px-1.5 py-0.5 shadow-sm uppercase tracking-wide shrink-0">Trailer</p>
                    </a>
                </li>
            `;
            watchlistHTML.innerHTML += li;
        });

        const years = Object.keys(watchedMovies).sort();
        years.forEach(year => {
            const movies = watchedMovies[year];
            if (movies && movies.length > 0) {
                const yearSection = `
                    <li>
                        <h3 class="btn-toggle border-b border-dotted border-white flex justify-between items-center w-full cursor-pointer select-none text-xs font-light bg-stone-500 rounded-sm text-white px-2.5 py-1.5 transition duration-300 hover:bg-stone-600 active:scale-[0.98]">${year} <span class="text-sm font-light leading-none">+</span></h3>
                        <ul class="hidden">
                            ${movies.map(movie => `
                                <li class="border-b border-dotted border-black last:border-b-0 p-2 even:bg-stone-300">
                                    <a href="https://www.google.com/search?q=${encodeURIComponent(movie)}+${year}+movie+trailer" target="_blank" class="flex w-full justify-between items-center gap-1.5">
                                        <h4 class="text-xs capitalize font-light leading-tight break-words">${movie}</h4>
                                        <p class="text-[10px] text-white font-light bg-stone-400 px-1.5 py-0.5 shadow-sm uppercase tracking-wide shrink-0">Trailer</p>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </li>
                `;
                watchedHTML.innerHTML += yearSection;
                totalMovies += movies.length;
                totalMoviesElement.innerHTML = totalMovies;
                moviesNames.push(...movies);
            }
        });

        bindYearToggles();
    }

    renderLists();

    // Top-level Watchlist / Watched section toggles
    const sectionToggles = document.querySelectorAll('#watchlist > .btn-toggle, #watched > .btn-toggle');
    sectionToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.nextElementSibling.classList.toggle('hidden');
            btn.querySelector('span').textContent = btn.nextElementSibling.classList.contains('hidden') ? '+' : '-';
        });
    });

    // Add Movie toggle & form handling
    const toggleAddMovieBtn = document.getElementById('toggle-add-movie');
    const toggleAddMovieIcon = document.getElementById('toggle-add-movie-icon');
    const addMovieForm = document.getElementById('add-movie-form');
    const newMovieTitleInput = document.getElementById('new-movie-title');
    const newMovieSectionSelect = document.getElementById('new-movie-section');
    const newMovieYearInput = document.getElementById('new-movie-year');

    newMovieYearInput.value = new Date().getFullYear();

    toggleAddMovieBtn.addEventListener('click', () => {
        addMovieForm.classList.toggle('hidden');
        toggleAddMovieIcon.textContent = addMovieForm.classList.contains('hidden') ? '+' : '-';
    });

    newMovieSectionSelect.addEventListener('change', () => {
        if (newMovieSectionSelect.value === 'watched') {
            newMovieYearInput.classList.remove('hidden');
        } else {
            newMovieYearInput.classList.add('hidden');
        }
    });

    addMovieForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = newMovieTitleInput.value.trim();
        if (!title) return;

        const targetSection = newMovieSectionSelect.value;
        if (targetSection === 'watchlist') {
            watchlistMovies.push(title);
            watchlistMovies.sort((a, b) => a.localeCompare(b));
            renderLists();
            watchlistHTML.classList.remove('hidden');
            document.querySelector('#watchlist > .btn-toggle span').textContent = '-';
        } else {
            const year = (newMovieYearInput.value || String(new Date().getFullYear())).trim();
            if (!watchedMovies[year]) {
                watchedMovies[year] = [];
            }
            watchedMovies[year].push(title);
            watchedMovies[year].sort((a, b) => a.localeCompare(b));
            renderLists();
            watchedHTML.classList.remove('hidden');
            document.querySelector('#watched > .btn-toggle span').textContent = '-';
        }

        saveData(watchlist);
        newMovieTitleInput.value = '';
        addMovieForm.classList.add('hidden');
        toggleAddMovieIcon.textContent = '+';
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        const watchedMovies = moviesNames.filter(movie => movie.toLowerCase().includes(searchValue));
        searchResults.innerHTML = watchedMovies.map(movie => `
            <li class="border-b border-dotted border-black last:border-b-0 px-2 py-1.5 even:bg-stone-300">
                <a href="https://www.google.com/search?q=${encodeURIComponent(movie)}+trailer" target="_blank" class="flex w-full justify-between items-center gap-1.5">
                    <h4 class="text-xs capitalize font-light leading-tight break-words">${movie}</h4>
                    <p class="text-[10px] text-white font-light bg-stone-400 px-1.5 py-0.5 shadow-sm uppercase tracking-wide transition duration-300 shrink-0">Trailer</p>
                </a>
            </li>
        `).join('');
        if (searchValue.length > 0) {
            searchResults.classList.remove('hidden');
        } else {
            searchResults.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);