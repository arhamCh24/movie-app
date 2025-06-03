import DOMPurify from "dompurify";

const MovieModal = ({
  isOpen,
  setIsOpen,
  movie,
  response,
  isLoading,
  handleChatSubmit,
  chatInput,
  setChatInput,
  chatMessages,
  isChatMessagesLoading,
}) => {
  if (!isOpen || !movie) return null;

  const sanitizedHTML = DOMPurify.sanitize(response);
  const {
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
    overview,
  } = movie;

  let friendlyResponse = `You are a movie information assistant specializing in the film "${movie.title}". Please make sure to find the information from the legal websites and respond to the user, your main goal is to give accurate response to every user
Movie Details:
Title: ${movie.title}
Rating: ${movie.vote_average}
Release Date: ${movie.release_date}
Language: ${movie.original_language}
Overview: ${movie.overview}

Guidelines:

1. Primary Focus: Provide detailed and accurate information solely about the movie "${movie.title}".

2. Handling Other Inquiries: If a user asks about any other movie or unrelated topic, respond with: "I'm here to assist you with information about '${movie.title}'. Please ask me anything related to this movie."

3. General Questions: For general questions that could pertain to "${movie.title}" (e.g., "Is it good?", "Tell me about this", "When was it released?", "Is it a family movie?"), interpret them in the context of "${movie.title}" and provide relevant information. Please make sure to understand the question if user ask anything general, your main goal is to give the information about this movie, please try to give answer to current movie with any type of general questinon

4. Insufficient Information: If you lack accurate information to answer a question about "${movie.title}", respond with: "Sorry, unfortunately, I don't have any information on that."

5. Avoiding Irrelevant Topics: Do not discuss topics outside the scope of "${movie.title}". `;

  const fullPrompt = `${friendlyResponse}\n\nUser: ${chatInput}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80 px-4 backdrop-blur-sm">
      <div className="bg-dark-100 rounded-2xl shadow-xl max-w-4xl w-full relative overflow-hidden border border-light-100/10 h-[80vh] max-h-[600px]">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-light-200 hover:text-white transition cursor-pointer p-2 rounded-full hover:bg-light-100/10"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Poster */}
          <div className="md:w-2/5 relative">
            <img
              src={
                poster_path
                  ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                  : "/no-movie.png"
              }
              alt={title}
              className="w-full h-full object-cover max-h-[600px]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-100 to-transparent p-4">
              <div className="flex items-center gap-2">
                <div className="bg-light-100/10 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <img src="/star.svg" alt="Star icon" className="w-4 h-4" />
                  <span className="text-white font-medium">
                    {vote_average ? vote_average.toFixed(1) : "N/A"}
                  </span>
                </div>
                <div className="bg-light-100/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white font-medium">
                    {release_date ? release_date.split("-")[0] : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-3/5 p-6 space-y-4 overflow-y-auto h-[600px]">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">{title}</h2>

              <div className="flex items-center gap-3 text-sm text-light-200">
                <span className="capitalize">{original_language}</span>
                <span className="w-1 h-1 rounded-full bg-light-200"></span>
                <span>
                  {overview?.length > 0
                    ? `${Math.floor(overview.length / 100)} min read`
                    : "Quick read"}
                </span>
              </div>

              <p className="text-light-200 text-base leading-relaxed">
                {overview || "No overview available."}
              </p>
            </div>

            <div className="border-t border-light-100/10 pt-4 ">
              {isLoading ? (
                <div className="flex items-center gap-2 text-light-200">
                  <div className="w-4 h-4 rounded-full border-2 border-light-200 border-t-transparent animate-spin"></div>
                  <span>Generating response...</span>
                </div>
              ) : (
                <>
                  <div
                    className="text-light-200 text-base leading-relaxed prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                  />

                  <div className="border-t border-light-100/10 pt-4 space-y-4">
                    <div className="space-y-2">
                      {chatMessages && (
                        <div className="text-light-100 bg-light-100/5 rounded-lg p-4">
                          {chatMessages}
                        </div>
                      )}

                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={`Ask about ${title}`}
                          className="w-full bg-light-100/5 text-light-200 placeholder-light-200/50 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-light-200/20 focus:border-transparent"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleChatSubmit(fullPrompt);
                              setChatInput("");
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            handleChatSubmit(fullPrompt);
                            setChatInput("");
                          }}
                          disabled={isChatMessagesLoading}
                          className="absolute right-2 p-1 rounded-full hover:bg-light-100/10 transition"
                        >
                          {isChatMessagesLoading ? (
                            <div className="w-6 h-6 rounded-full border-2 border-light-200 border-t-transparent animate-spin"></div>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-light-200"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
