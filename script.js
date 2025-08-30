class MovieSearchApp {
            constructor() {
                this.API_KEY = "04c35731a5ee918f014970082a0088b1";
                this.APIURL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${this.API_KEY}&page=1`;
                this.IMGPATH = "https://image.tmdb.org/t/p/w500";
                this.SEARCHAPI = `https://api.themoviedb.org/3/search/movie?&api_key=${this.API_KEY}&query=`;

                this.moviesGrid = document.getElementById('moviesGrid');
                this.searchInput = document.getElementById('searchInput');
                this.loading = document.getElementById('loading');
                this.noResults = document.getElementById('noResults');
                this.errorContainer = document.getElementById('errorContainer');
                this.errorText = document.getElementById('errorText');
                this.apiHelp = document.getElementById('apiHelp');

                this.movies = [];
                this.searchTerm = '';
                this.searchTimeout = null;

                this.init();
            }

            init() {
                this.getMovies(this.APIURL);
                this.setupEventListeners();
            }

            setupEventListeners() {
                this.searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.searchTimeout);
                    const value = e.target.value;
                    this.searchTerm = value;

                    this.searchTimeout = setTimeout(() => {
                        if (value !== "") {
                            this.getMovies(this.SEARCHAPI + encodeURIComponent(value));
                        } else {
                            this.getMovies(this.APIURL);
                        }
                    }, 300);
                });
            }

            showLoading() {
                this.loading.style.display = 'flex';
                this.noResults.style.display = 'none';
                this.errorContainer.style.display = 'none';
            }

            hideLoading() {
                this.loading.style.display = 'none';
            }

            showError(message) {
                this.errorText.textContent = message;
                this.errorContainer.style.display = 'block';

                if (message.includes('API key')) {
                    this.apiHelp.style.display = 'block';
                } else {
                    this.apiHelp.style.display = 'none';
                }

                this.hideLoading();
            }

            hideError() {
                this.errorContainer.style.display = 'none';
            }

            async getMovies(url) {
                this.showLoading();
                this.hideError();

                try {
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.status_code === 7) {
                        this.showError('Invalid API key. Please get a valid TMDB API key.');
                        this.movies = [];
                    } else if (data.status_code === 34) {
                        this.showError('Resource not found.');
                        this.movies = [];
                    } else if (data.results) {
                        this.movies = data.results;
                    } else {
                        this.movies = [];
                    }

                    this.displayMovies();
                } catch (error) {
                    console.error('Error fetching movies:', error);
                    this.showError('Failed to fetch movies. Please check your internet connection.');
                    this.movies = [];
                    this.displayMovies();
                } finally {
                    this.hideLoading();
                }
            }

            displayMovies() {
                this.moviesGrid.innerHTML = '';
                this.noResults.style.display = 'none';

                if (!this.movies || this.movies.length === 0) {
                    if (this.searchTerm) {
                        this.noResults.style.display = 'block';
                    }
                    return;
                }

                this.movies.forEach(movie => {
                    const movieCard = this.createMovieCard(movie);
                    this.moviesGrid.appendChild(movieCard);
                });
            }

            createMovieCard(movie) {
                const card = document.createElement('div');
                card.className = 'movie-card';

                const posterPath = movie.poster_path
                    ? this.IMGPATH + movie.poster_path
                    : this.getPlaceholderImage();

                const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
                const ratingClass = this.getRatingClass(movie.vote_average);
                const releaseYear = this.formatDate(movie.release_date);
                const overview = movie.overview || 'No overview available';
                const title = movie.title || movie.original_title || 'Unknown Title';

                card.innerHTML = `
                    <div style="position: relative; overflow: hidden;">
                        <img src="${posterPath}" alt="${title}" class="movie-poster" loading="lazy">
                        
                        <!-- Rating Badge -->
                        <div class="rating-badge ${ratingClass}">
                            <i class="fas fa-star"></i>
                            ${rating}
                        </div>

                        <!-- Overlay -->
                        <div class="movie-overlay">
                            <div class="overlay-content">
                                <div class="overlay-date">
                                    <i class="fas fa-calendar"></i>
                                    ${releaseYear}
                                </div>
                                <p class="overlay-overview">${overview}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Movie Info -->
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                        
                        <div class="movie-meta">
                            <div class="meta-date">
                                <i class="fas fa-calendar"></i>
                                ${releaseYear}
                            </div>
                            
                            <div class="meta-rating ${ratingClass}">
                                <i class="fas fa-star"></i>
                                ${rating}
                            </div>
                        </div>
                    </div>
                `;

                
                card.addEventListener('click', () => {
                    this.showMovieDetails(movie);
                });

                return card;
            }

            getRatingClass(rating) {
                if (rating >= 8) return 'rating-good';
                if (rating >= 6) return 'rating-okay';
                return 'rating-poor';
            }

            formatDate(dateString) {
                if (!dateString) return 'N/A';
                return new Date(dateString).getFullYear();
            }

            getPlaceholderImage() {
                return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgdmlld0JveD0iMCAwIDUwMCA3NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNzUwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNTAgMzI1QzI3Ni4xIDMyNSAyOTcuNSAzNDYuNCAyOTcuNSAzNzIuNUMyOTcuNSAzOTguNiAyNzYuMSA0MjAgMjUwIDQyMEMyMjMuOSA0MjAgMjAyLjUgMzk4LjYgMjAyLjUgMzcyLjVDMjAyLjUgMzQ2LjQgMjIzLjkgMzI1IDI1MCAzMjVaIiBmaWxsPSIjNkI3Mjg0Ii8+CjxyZWN0IHg9IjE4MCIgeT0iNDMwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjIwIiByeD0iMTAiIGZpbGw9IiM2QjcyODQiLz4KPHJlY3QgeD0iMTYwIiB5PSI0NjAiIHdpZHRoPSIxODAiIGhlaWdodD0iMTUiIHJ4PSI3LjUiIGZpbGw9IiM2QjcyODQiLz4KPC9zdmc+';
            }

            showMovieDetails(movie) {
                const details = `
🎬 ${movie.title || movie.original_title}
⭐ Rating: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10
📅 Release Date: ${movie.release_date || 'Unknown'}
📝 Overview: ${movie.overview || 'No overview available.'}
                `.trim();

                alert(details);
            }
        }

        
        document.addEventListener('DOMContentLoaded', () => {
            new MovieSearchApp();
        });