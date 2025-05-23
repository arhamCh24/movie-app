import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

// API - Apllication Programming Interface - a set of rules that allows one software application to talk to another

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchedTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, SetErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [response, setResponse] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState("");
  const [isChatMessagesLoading, setIsChatMessagesLoading] = useState(false);

  // Debounce the search term to prvent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchedTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    SetErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      // throw new Error("Failed to fetch movies"); // this is just for test purpose

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        SetErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      SetErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // we created new useEffect for loadingTrendingMovies' function because this function will be refetch every single time that our current user searches for something that will cause too many necessary API calls
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Connect to the Server 'AI'

  const handleSubmit = async (input) => {
    setIsLoading(true);
    setResponse("");

    try {
      let res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      let data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setResponse("Error from API: " + data.error);
      }
    } catch (err) {
      console.error("Error calling backend:", err);
      setResponse("Failed to connect to backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // chatting with AI functionality

  const handleChatSubmit = async (message) => {
    setIsChatMessagesLoading(true);
    setChatMessages("");

    try {
      let res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });
      let data = await res.json();
      if (res.ok) {
        setChatMessages(data.response);
      } else {
        setChatMessages("Error, Please try again later");
      }
    } catch (error) {
      console.log("Error Calling Backend: ", error);
      setChatMessages("Error, Please try again later");
    } finally {
      setIsChatMessagesLoading(false);
    }
  };

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span>You'll Love
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* <h1 className="text-white"> {searchTerm}</h1> */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => {
                    setIsOpen(true);
                    setSelectedMovie(movie);
                    handleSubmit(`
You are a movie expert. Based on the following movie details, generate an HTML-formatted description using only <h3>, <p>, and <b> tags. Do not include the movie title in your response, as it is already displayed.

This movie Details is only for you to get more information about movies:
- Movie Name: ${movie.title}
- Rating: ${movie.vote_average}
- Release Date: ${movie.release_date}
- Language: ${movie.original_language}
- Overview: ${movie.overview}

Instructions:
- Provide a <p><b>Stars:</b> ...</p> line with comma-separated actor names of the actual movie.
- Provide a <p><b>Director:</b> ...</p> line with comma-separated director names of the actual movie.
- Provide a <p><b>Writers:</b> ...</p> line with comma-separated writers names of the actual movie.
- Provide a <p><b>Rating:</b> ...</p> line display rating like this example: (e.g., ★ actual_rating/10), make sure actual rating will one digit after dot.
- provide a <p><b>Genres:</b>such as Action, Adventure, Sci-Fi, change this with actual movie Genres, if not availble just write 'Not Available'</p>
- provide a <p><b>Runtime:</b> such as 2h 15m, change this with actual movie runtime</p>
- Provide a <p><b>Production:</b> such as Marvel Studios, Paramount Pictures, change this with actual movie production</p>
- Provide a <p><b>Awards:</b> such as 3 Oscars, 5 Golden Globe Nominations, change this with actual movie Awards</p>
- Provide a <p><b>Release Country:</b> such as USA, change this with actual release country</p>
- Include a <h3><b>Summary</b></h3> heading followed by a <p> with a detailed movie summary. Note: please must give me detailed summary or movie.
- Ensure the HTML is well-structured, don't add staring html point and ending on the start and end and can be rendered directly, and make sure to add 'Not Available' if you not find any of them such as Starring, Director, Rating, etc, don't add anything wrong on your end.

`);
                  }}
                />
              ))}
            </ul>
          )}
        </section>

        <MovieModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          movie={selectedMovie}
          response={response}
          isLoading={isLoading}
          handleChatSubmit={handleChatSubmit}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatMessages={chatMessages}
          isChatMessagesLoading={isChatMessagesLoading}
        />
      </div>
    </main>
  );
};

export default App;
