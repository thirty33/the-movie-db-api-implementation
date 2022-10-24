const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    params: {
        'api_key': API_KEY
    },
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

function likedMoviesList() {
    const item = JSON.parse(localStorage.getItem('liked_movies'))
    let movies;

    if(item) {
        movies = item
    }
    else {
        movies = {}
    }
    return movies;
}

function likeMovie(movie) {
    const likedMovies = likedMoviesList();
    if(likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined;
    }
    else {
        likedMovies[movie.id] = movie;
    }

    localStorage.setItem('liked_movies', JSON.stringify(likedMovies))
}

//helpers

const lazyLoader = new IntersectionObserver((entries) => {
    entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
            console.log(entry)
            // entry.target.parentElement.classList.remove('movie-container--loading')
            const url = entry.target.getAttribute('data-img')
            entry.target.setAttribute('src', url)
        })
})

function createMovies(movies, container, { lazyLoad = false, clean = true } = {}) {

    if (clean) {
        container.innerHTML = ''
    }

    const buttonToDelete = container.querySelector('.add-more-content--button');
    if (buttonToDelete) {
        container.removeChild(buttonToDelete)
    }

    movies.forEach(movie => {
        const movieContainer = document.createElement('div')

        movieContainer.classList.add('movie-container')
        // movieContainer.classList.add('movie-container--loading')
        const movieImg = document.createElement('img')
        movieImg.classList.add('movie-img')
        movieImg.setAttribute('alt', movie.title)
        movieImg.setAttribute(lazyLoad ? 'data-img' : 'src', 'https://image.tmdb.org/t/p/w300/' + movie.poster_path)

        movieImg.addEventListener('error', () => {
            movieImg.setAttribute('src', 'https://static.platzi.com/static/images/error/img404.png')
        })

        const favoriteButton = document.createElement('button')
        favoriteButton.classList.add('movie-button')

        movieImg.addEventListener('click', () => {
            location.hash = '#movie=' + movie.id
        })

        likedMoviesList()[movie.id] && favoriteButton.classList.add('movie-button--liked')

        //add movie to local storage favorite list
        favoriteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            favoriteButton.classList.toggle('movie-button--liked');
            likeMovie(movie)
        })

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg)
        movieContainer.appendChild(favoriteButton)
        container.appendChild(movieContainer)
    })
}

function createCategories(categories, container) {
    container.innerHTML = '';
    categories.forEach(category => {
        const categoryContainer = document.createElement('div')
        categoryContainer.classList.add('category-container')

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title')
        categoryTitle.setAttribute('id', 'id' + category.id)
        //navigation
        categoryTitle.addEventListener('click', () => {
            location.hash = '#category=' + category.id + '-' + category.name
        })
        const categoryTitleText = document.createTextNode(category.name);
        categoryTitle.appendChild(categoryTitleText)
        categoryContainer.appendChild(categoryTitle)
        container.appendChild(categoryContainer)
    });
}
async function getTrendingMoviesPreview() {
    // const res = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=' + API_KEY)
    // const data = await res.json()

    const { data, status } = await api('trending/movie/day')

    const movies = data.results;

    const trendingPreviewContainer = document.querySelector('#trendingPreview .trendingPreview-movieList')

    createMovies(movies, trendingPreviewContainer, { lazyLoad: true })
}

async function getCategoriesPreview() {
    // const res = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=' + API_KEY)
    // const data = await res.json()

    const { data, status } = await api('genre/movie/list')

    const categories = data.genres;
    console.log('data', categories)
    console.log('status', status)

    const categoriesPreviewContainer = document.querySelector('#categoriesPreview .categoriesPreview-list')
    createCategories(categories, categoriesPreviewContainer)
}

// get movies by category 
async function getMoviesByCategory(id) {

    const { data, status } = await api('discover/movie', {
        params: {
            with_genres: id
        }
    })

    const movies = data.results;
    maxPages = data.total_pages || 1;
    createMovies(movies, genericSection, { lazyLoad: true })
}

function getPaginatedMoviesByCategory(id) {
    return async function () {
        const {
            scrollTop,
            scrollHeight,
            clientHeight
        } = document.documentElement;

        //verificar si estamos en el final de la pagina al hacer scroll
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15)

        const pageIsNotMax = page < maxPages;

        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const { data, status } = await api('discover/movie', {
                params: {
                    with_genres: id,
                    page
                }
            })

            const movies = data.results;
            createMovies(movies, genericSection, { lazyLoad: true, clean: false })

        }
    }
}

// get movies by search query
async function getMoviesBySearch(query) {

    const { data, status } = await api('search/movie', {
        params: {
            query
        }
    })

    const movies = data.results;
    maxPages = data.total_pages || 1;
    console.log('maxPages', maxPages)

    createMovies(movies, genericSection, { lazyLoad: true })
}

function getPaginatedMoviesBySearch(query) {

    return async function () {

        const {
            scrollTop,
            scrollHeight,
            clientHeight
        } = document.documentElement;

        //verificar si estamos en el final de la pagina al hacer scroll
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15)

        const pageIsNotMax = page < maxPages;

        if (scrollIsBottom && pageIsNotMax) {

            page++;
            const { data, status } = await api('search/movie', {
                params: {
                    query,
                    page
                }
            })

            const movies = data.results;

            createMovies(movies, genericSection, { lazyLoad: true, clean: false })

        }
    }
}

async function getTrendingMovies() {
    // const res = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=' + API_KEY)
    // const data = await res.json()

    const { data, status } = await api('trending/movie/day')

    const movies = data.results;
    maxPages = data.total_pages || 1;

    createMovies(movies, genericSection, { lazyLoad: true, clean: true })


    // test
    // const loadMore = document.createElement('button')
    // loadMore.classList.add('add-more-content--button')

    // loadMore.addEventListener('click', getPaginatedTrendingMovies)
    // loadMore.innerText = 'Cargar más';

    // genericSection.appendChild(loadMore)

}

async function getPaginatedTrendingMovies() {

    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    //verificar si estamos en el final de la pagina al hacer scroll
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15)

    const pageIsNotMax = page < maxPages;

    if (scrollIsBottom && pageIsNotMax) {

        page++;
        const { data, status } = await api('trending/movie/day', {
            params: {
                page
            }
        })

        const movies = data.results;

        createMovies(movies, genericSection, { lazyLoad: true, clean: false })
    }

    // const loadMore = document.createElement('button')
    // loadMore.classList.add('add-more-content--button')

    // loadMore.addEventListener('click', getPaginatedTrendingMovies)
    // loadMore.innerText = 'Cargar más';

    // genericSection.appendChild(loadMore)
}

async function getMovieById(id) {

    const { data: movie, status } = await api('movie/' + id)
    console.log('detail movie', movie)

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500/' + movie.poster_path;
    headerSection.style.background = `
        linear-gradient(
            180deg, 
            rgba(0, 0, 0, 0.35) 19.27%, 
            rgba(0, 0, 0, 0) 29.17%
        ),
        url(${movieImgUrl})
    `

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;
    createCategories(movie.genres, movieDetailCategoriesList)

    getRelatedMovies(id);
}

async function getRelatedMovies(id) {
    const { data, status } = await api(`/movie/${id}/recommendations`);
    const relatedMovies = data.results;
    createMovies(relatedMovies, relatedMoviesContainer, true)
}

function getLikedMovies() {
    const likedMovies = likedMoviesList();

    const movies = Object.values(likedMovies);

    createMovies(movies, likedMoviesListContainer, {lazyLoader: true, clean: true} )
}