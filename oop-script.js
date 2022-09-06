//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);
    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static async fetchMovies() {
        const url = APIService._constructUrl(`movie/now_playing`)
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
    static async fetchActors(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}/credits`)
        const response  = await fetch(url)
        const data = await response.json()
        return data.cast.map(actor => {
            if(actor.order < 5) {
                return new Actor(actor)
            }
        })
    }
    static async fetchActor(actorId) {
        const url = APIService._constructUrl(`person/${actorId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Person(data)
    }
    static async fetchSimilarMovies(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}/similar`)
        const response  = await fetch(url)
        const data = await response.json()
        //return data.results.map(movie => new Movie(movie))
        const simMovies = []
        for (i = 0; i < 5; i++) {
            simMovies.push(data.results[i])
        }
        return simMovies.map( movie => new Movie(movie))
    }
    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    
    static renderMovies(movies) {
        const movieHome = document.createElement('div')
        movieHome.className = "movie-home"
        movies.forEach(movie => {
            const movieDiv = document.createElement("div");
            const movieImage = document.createElement("img");
            movieImage.src = `${movie.posterUrl}`;
            movieImage.className = "movie-poster"
            /*const movieTitle = document.createElement("h3");
            movieTitle.textContent = `${movie.title}`;*/
            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });
            /*movieDiv.appendChild(movieTitle);*/
            movieDiv.appendChild(movieImage);
            movieHome.appendChild(movieDiv);
            this.container.appendChild(movieHome);   
        })
    }
}


class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        MoviePage.renderMovieSection(movieData);
        const actors = await APIService.fetchActors(movie.id)
        MoviePage.renderActorsSection(actors)
        const similarMovies = await APIService.fetchSimilarMovies(movie.id)
        MoviePage.renderSimilarMoviesSection(similarMovies)

    }
}

class Actors {
    static async run(actor) {
        const actorData = await APIService.fetchActor(actor.id)
        ActorPage.renderActorSection(actorData);
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
    static renderSimilarMoviesSection(movies) {
        MovieSection.renderSimilarMovies(movies);
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
          <p id="genres">${movie.genres}</p>
          <p id="movie-release-date">${movie.releaseDate}</p>
          <p id="movie-runtime">${movie.runtime}</p>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
        </div>
      </div>
      <div class="actors-list">
      <h3>Actors:</h3>
      </div>
      <div class="similar-list pt-4">
      <h3>More Like ${movie.title}</h3>
      </div>
    `;
    }
    static renderActors(actors) {
        const actorsList = document.createElement('ul')
        actorsList.id = 'actors'
        const actorsDiv = document.querySelector(".actors-list")
        actorsDiv.appendChild(actorsList)
        actors.forEach(actor => {
           const actorLi = document.createElement('li')
           const actorImg = document.createElement('img')
           actorImg.src = `${actor.profileURL}`
           const actorName = document.createElement('p')
           actorName.textContent = `${actor.name}`
           actorImg.addEventListener('click', function() {
                Actors.run(actor)
           });
           actorLi.appendChild(actorImg);
           actorLi.appendChild(actorName);
           actorsList.appendChild(actorLi);
        })
    }
    static renderSimilarMovies(movies) {
        const similarDiv = document.querySelector(".similar-list")
        const similarList = document.createElement("ul")
        similarList.id ='sim-list'
        similarDiv.appendChild(similarList)
        movies.forEach(movie => {
            const simMovie = document.createElement('li')
            const movieImg = document.createElement('img')
            movieImg.src = `${movie.posterUrl}`
            movieImg.alt = `${movie.title}`
            movieImg.addEventListener('click', function() {
                Movies.run(movie)
            });
            simMovie.appendChild(movieImg)
            similarList.appendChild(simMovie)
        })
    }
}

class ActorPage {
    static container = document.getElementById('container')
    static renderActorSection(actor) {
        ActorSection.renderActor(actor)
    }
}

class ActorSection {
    static renderActor(actor) {
        ActorPage.container.innerHTML = `
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
        /*this.genres = json.genres;*/
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
}

class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w185';
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.profile = json.profile_path;

    }

    get profileURL() {
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

document.addEventListener("DOMContentLoaded", App.run);