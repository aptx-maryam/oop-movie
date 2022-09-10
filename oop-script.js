//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);
        Navbar.run();
    }
}

class RunActors {
    static async run() {
      const actors = await APIService.fetchActors();
      ActorPage.renderActors(actors);
    }
  }

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static async fetchMovies(searchURL) {
        let url = APIService._constructUrl(`movie/now_playing`)
        if (searchURL){
            url = searchURL;
        }
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Movie(data)
    }
    static async searchMovies(searchTerm){
        const url = `${APIService.TMDB_BASE_URL}/search/movie?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}&query=${searchTerm}`
        let movies = await APIService.fetchMovies(url);
        HomePage.renderMovies(movies);
    }
    
    static async fetchMovieActors(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}/credits`)
        const response  = await fetch(url)
        const data = await response.json()
        return data.cast.map(actor => {
            if(actor.order < 5) {
                return new Actor(actor)
            }
        }).slice(0,5)
    }
    
    static async fetchActors() {
        const url = "https://api.themoviedb.org/3/person/popular?api_key=dd5c4a49d145a3de97fde21a0d2168e3&language=en-US&page=1";
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map((actor) => new Actor(actor));
    }
    static async fetchActor(actorId) {
        const url = APIService._constructUrl(`person/${actorId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Person(data)
    }
    static async fetchTrailer(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}/videos`)
        const response = await fetch(url)
        const data = await response.json()
        const trailer =  data.results.find(vid => vid.official == true && vid.site =="YouTube" && vid.type == "Trailer")
        return new Trailer(trailer)
    }
    static async fetchSimilarMovies(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}/similar`)
        const response  = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie)).slice(0,5)
    }
    static async fetchPopular() {
        let url = APIService._constructUrl(`movie/popular`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchTopRated() {
        let url = APIService._constructUrl(`movie/top_rated`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchUpcoming() {
        let url = APIService._constructUrl(`movie/upcoming`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchLatest() {
        let url = APIService._constructUrl(`movie/latest`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=5c8358b462ac5e72db3b0f23bbbb210d`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    
    static renderMovies(movies) {
        container.innerHTML='';
        const movieHome = document.createElement('div')
        movieHome.className = "movie-home"
        movies.forEach(movie => { 
            const movieDiv = document.createElement("div");
            const movieImage = document.createElement("img");
            const movieTitle = document.createElement("p");
            const movieRating = document.createElement("div");
            movieRating.className ='rating'
            movieImage.src = `${movie.posterUrl}`;
            movieImage.className = "movie-poster"
            movieTitle.textContent = movie.title;
            const star = document.createElement('i')
            star.classList = "bi bi-star-fill"
            const rating = document.createElement('p')
            rating.textContent = movie.vote_average;
            movieRating.appendChild(star)
            movieRating.appendChild(rating)
            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });
            movieDiv.appendChild(movieImage);
            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(movieRating);
            movieHome.appendChild(movieDiv);
            this.container.appendChild(movieHome);   
        })
        let searchBox = document.querySelector('.form-control.me-2')
        let searchButton = document.querySelector('.btn.btn-outline-success')
        searchButton.addEventListener('click', (e) => {
            APIService.searchMovies(searchBox.value)
        })
    }

}

class ActorPage {
    static container = document.getElementById("container");
    static renderActors(actors) {
        this.container.innerHTML = '';
        actors.forEach((actor) => {
        const actorDiv = document.createElement("div");
        actorDiv.classList.add('actor-div');
        const actorImageContainer = document.createElement("div");
        actorImageContainer.classList.add('actor-image');
        const actorImage = document.createElement("img");
        actorImage.src = `${actor.profileUrl}`
        const actorName = document.createElement("h4");
        actorName.textContent = `${actor.name}`;
        actorImage.addEventListener("click", function () {
            Actors.run(actor)
        });
        actorImageContainer.appendChild(actorImage);
        actorDiv.appendChild(actorImageContainer);
        actorDiv.appendChild(actorName);
        this.container.appendChild(actorDiv);
      });
    }
  }



class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        MoviePage.renderMovieSection(movieData);
        APIService.fetchActors(movieData);

        const actors = await APIService.fetchMovieActors(movie.id)
        MoviePage.renderActorsSection(actors);
        const similar = await APIService.fetchSimilarMovies(movie.id)
        MoviePage.renderSimilarSection(similar)
        const trailerData = await APIService.fetchTrailer(movie.id)
        MoviePage.renderTrailerSection(trailerData)
        
    }
}

class Actors {
    static async run(actor) {
        const actorData = await APIService.fetchActor(actor.id)
        ActorsOfMoviePage.renderActorSection(actorData);
    }
}

class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie) {
        MovieSection.renderMovie(movie);
    }
    static renderActorsSection(actors) {
        MovieSection.renderActors(actors);
    }
    static renderSimilarSection(movies) {
        MovieSection.renderSimilar(movies)
    }
    static renderTrailerSection(trailer) {
        MovieSection.renderTrailer(trailer)
    }
}

class MovieSection {
    static renderMovie(movie) {
        MoviePage.container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="movie-title">${movie.title}</h2>
          <ul id="genres"></ul>
          <p id="movie-release-date">Release Date: ${movie.releaseDate}</p>
          <p id="movie-runtime">Runtime: ${movie.runtime}</p>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
        </div>
      </div>
      <div class="row">
        <div class="actors-list">
        <h3>Actors:</h3>
        </div>
      </div>
      <div class="row">
        <div class="trailer m-5 p-2">

        </div>
      </div>
      <div class="row">
        <div class="similar-list">
            <h3>More Like ${movie.title}</h3>
        </div>
      </div>`;
      const genreList = document.getElementById("genres")
      movie.genre.forEach(genre => {
        const genItem = document.createElement('li')
        genItem.textContent = genre;
        genreList.appendChild(genItem);
      })
    }
    static renderActors(actors) {
        const actorsList = document.createElement('ul');
        actorsList.id = 'actors';
        const actorsDiv = document.querySelector(".actors-list");
        actorsDiv.appendChild(actorsList);
        actors.forEach(actor => {
           const actorLi = document.createElement('li');
           const actorImg = document.createElement('img');
           actorImg.src = `${actor.profileUrl}`;
           actorImg.alt = `${actor.name}`;
           const actorName = document.createElement('p');
           actorName.textContent = `${actor.name}`;
           actorImg.addEventListener('click', function() {
                Actors.run(actor)
           });
           actorLi.appendChild(actorImg);
           actorLi.appendChild(actorName);
           actorsList.appendChild(actorLi);
        });
    }
    static renderTrailer(trailer) {
        const trailerDiv = document.querySelector(".trailer");
        console.log(trailerDiv)
        const video = document.createElement("iframe");
        video.src = trailer.trailerURL;
        video.title = trailer.name;
        video.allowFullscreen = true;
        video.width = "650";
        video.height = "415";
        trailerDiv.appendChild(video);
    }
    static renderSimilar(movies) {
        const similarDiv = document.querySelector(".similar-list");
        let similarList = document.createElement("ul");
        similarList.id = "similar"
        similarDiv.appendChild(similarList)
        movies.forEach(movie => {
            const simovie = document.createElement('li');
            const movieImg = document.createElement('img');
            movieImg.src = `${movie.posterUrl}`
            movieImg.alt= `${movie.title}`
            movieImg.addEventListener('click', function() {
                Movies.run(movie)
            });
            simovie.appendChild(movieImg);
            similarList.appendChild(simovie);
        })
    }
    
    
}

class ActorsOfMoviePage {
    static container = document.getElementById('container')
    static renderActorSection(actor) {
        ActorSection.renderActor(actor)
    }
}

class ActorSection {
    static renderActor(actor) {
        ActorsOfMoviePage.container.innerHTML = `
        <div class="row">
        <div class="col-md-4">
          <img id="actor-profile" src=${actor.profileURL}> 
        </div>
        <div class="col-md-8">
          <h2 id="name">${actor.name}</h2>
          <p id="birthdeath">${actor.birthday}- ${actor.actorDeath}</p>
          <p id="gender">${actor.actorGender}</p>
          <p id="popularity">${actor.popularity}</p>
          <h3>Biography:</h3>
          <p id="bio">${actor.biography}</p>
        </div>
      </div>`
    }
}

class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w342';
    constructor(json) {
        this.id = json.id;
        this.title = json.title;

        this.vote_average = json.vote_average;
        this.genres = json.genres;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.overview = json.overview;
        this.backdropPath = json.backdrop_path;
        this.poster = json.poster_path;
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }

    get posterUrl() {
        return this.poster ? Movie.BACKDROP_BASE_URL + this.poster : "";
    }
    get genre() {
        let genres = []
        this.genres.forEach(genre => {
            genres.push(genre.name)
        })
        return genres
    }
}

class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.profile = json.profile_path;
        this.gender = json.gender;
        this.popularity = json.popularity;
    }

    get profileUrl() {
        return this.profile ? Actor.BACKDROP_BASE_URL + this.profile : "" ;
    }
}

class Person {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w500';
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.birthday = json.birthday;
        this.deathday = json.deathday;
        this.biography = json.biography;
        this.gender = json.gender;
        this.profile = json.profile_path;
        this.popularity = json.popularity;
    }

    get profileURL() {
        return this.profile ? Actor.BACKDROP_BASE_URL + this.profile : "" ;
    }

    get actorGender() {
        if(this.gender == 1){
            return "Female"
        }
        else {
            return "Male"
        }
    }

    get actorDeath() {
        if (this.deathday == null) {
            return "Alive"
        }
        else {
            return this.deathday
        }
    }
}

class Trailer {
    static YT_BASE_URL = 'https://www.youtube.com/embed/';
    constructor(json) {
        this.id = json.id;
        this.key = json.key;
        this.site = json.site;
        this.type = json.type;
        this.name = json.name;
    }

    get trailerURL() {
        return this.key ? Trailer.YT_BASE_URL + this.key : "" ;
    }
}

class Navbar {
    static container = document.getElementById('container');
    static async run() {
        const about = document.querySelector(".nav-item.about")
        about.addEventListener('click', function() {
            Navbar.container.innerHTML = `
            <div class=row>
            <div class="col-md-4">
             <img src ="tmdb.png" id="app-image">
            </div>
            <div class="col-md-6 p-5 m-5">
                <h3>TMDB</h3>
                <p> Browse thousands of movies, discover what's trending and all time top rated. Filter movies
                based on your preferred genres and favorite actors. Checkout the ratings, reviews and trailers to help you decide on your next favorite movie!</p>
            </div>
            </div>
            `
        })
        const popular = document.querySelector(".popular");
        popular.addEventListener('click', function (){
            Popular.run();
        })
        const topRated = document.querySelector(".top-rated");
        topRated.addEventListener('click', function(){
            TopRated.run();
        })
        const latest = document.querySelector(".latest");
        latest.addEventListener('click', function(){
            Latest.run();
        })
        const upcoming = document.querySelector(".upcoming");
        upcoming.addEventListener('click', function(){
            Upcoming.run();
        })
        const nowPlaying = document.querySelector(".now-playing");
        nowPlaying.addEventListener('click', function(){
            NowPlaying.run();
        })
    }
}

class Popular {
    static async run() {
        const popularMovies = await APIService.fetchPopular();
        HomePage.renderMovies(popularMovies);
    }
}

class TopRated {
    static async run() {
        const top = await APIService.fetchTopRated();
        HomePage.renderMovies(top);
    }
}

class Latest {
    static async run() {
        const latestMovies = await APIService.fetchLatest();
        HomePage.renderMovies(latestMovies);
    }
}

class Upcoming {
    static async run() {
        const upcomingMovies = await APIService.fetchUpcoming();
        HomePage.renderMovies(upcomingMovies);
    }
}

class NowPlaying {
    static async run() {
        const playingMovies = await APIService.fetchMovies();
        HomePage.renderMovies(playingMovies);
    }
} 

document.addEventListener("DOMContentLoaded", App.run);
document.querySelector(".actors").addEventListener("click",RunActors.run);