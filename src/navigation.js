let page = 1;
let maxPages;
let infiniteScroll;

searchFormBtn.addEventListener('click', () => {
    if (searchFormInput.value) {
        location.hash = "#search=" + searchFormInput.value
    }
})

trendingBtn.addEventListener('click', () => {
    location.hash = "#trends"
})

arrowBtn.addEventListener('click', () => {
    history.back();
    // location.hash = "#home"
})



window.addEventListener('DOMContentLoaded', navigator, false)
window.addEventListener('hashchange', navigator, false)
window.addEventListener('scroll', infiniteScroll, { passive: false })
window.addEventListener('storage', () => {
    // When local storage changes, dump the list to
    // the console.
    getLikedMovies()
});

function navigator() {
    console.log('location', location)
    likedMoviesSection.classList.add('inactive')
    if (infiniteScroll) {
        window.removeEventListener('scroll', infiniteScroll, { passive: false });
        infiniteScroll = undefined;
    }

    if (location.hash.startsWith('#trends')) {
        TrendsPage()
    }
    else if (location.hash.startsWith('#search=')) {
        SearchPage()
    }
    else if (location.hash.startsWith('#movie=')) {
        MovieDetailPage()
    }
    else if (location.hash.startsWith('#category=')) {
        CategoryPage()
    }
    else {
        likedMoviesSection.classList.remove('inactive')
        homePage();
    }

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    if (infiniteScroll) {
        window.addEventListener('scroll', infiniteScroll, { passive: false })
    }
}

function homePage() {

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.add('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.remove('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.remove('inactive');
    categoriesPreviewSection.classList.remove('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.add('inactive');

    getTrendingMoviesPreview();
    getCategoriesPreview();
    getLikedMovies();
}

function CategoryPage() {

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    const [_, categoryData] = location.hash.split('=')
    const [id, name] = categoryData.split('-')

    headerCategoryTitle.innerHTML = name;
    getMoviesByCategory(id);

    infiniteScroll = getPaginatedMoviesByCategory(id);
}

function MovieDetailPage() {

    headerSection.classList.add('header-container--long');
    // headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.add('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.remove('inactive');

    const [_, movieId] = location.hash.split('=')
    getMovieById(movieId)

}
function SearchPage() {
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    const [_, searchValue] = location.hash.split('=')
    getMoviesBySearch(searchValue)

    infiniteScroll = getPaginatedMoviesBySearch(searchValue);
}

function TrendsPage() {

    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.add('inactive');

    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');

    headerCategoryTitle.innerHTML = 'Tendencias'
    getTrendingMovies()

    infiniteScroll = getPaginatedTrendingMovies;
}