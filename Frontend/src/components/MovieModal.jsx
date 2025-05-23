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

  const friendlyResponse = `You are a movie information assistant specializing in the film ${title}.
Guidelines:
1. Primary Focus: Provide detailed and accurate information solely about the movie ${title}.
2. Handling Other Inquiries: If a user asks about any other movie or unrelated topic, respond with: "I'm here to assist you with information about ${title}. Please ask me anything related to this movie."
3. General Questions: For general questions that could pertain to ${title} (e.g., "Is it good?", "Tell me about this"), interpret them in the context of ${title} and provide relevant information.
4. Insufficient Information: If you lack accurate information to answer a question about ${title}, respond with: "Sorry, unfortunately, I don't have any information on that."
5. Avoiding Irrelevant Topics: Do not discuss topics outside the scope of ${title}.`;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-3xl w-full relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
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
          <div className="md:w-1/3">
            <img
              src={
                poster_path
                  ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                  : "/no-movie.png"
              }
              alt={title}
              className="rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>

            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-300 gap-4">
              <div className="flex items-center gap-1">
                <img src="/star.svg" alt="Star icon" className="w-4 h-4" />
                <span>{vote_average ? vote_average.toFixed(1) : "N/A"}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>Language: {original_language.toUpperCase()}</span>
              <span className="text-gray-400">•</span>
              <span>
                Released: {release_date ? release_date.split("-")[0] : "N/A"}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {overview || "No overview available."}
            </p>
            <hr />
            {isLoading ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Writing...
              </p>
            ) : (
              <>
                <div
                  className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
                <hr />
                <div className=" text-gray-700 dark:text-gray-300 ">
                  <div className="w-full bg-light-100/5 px-2 py-1 rounded-lg mt-1 max-w-3xl mx-auto">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask anything about ${title}`}
                        className="w-full bg-transparent py-1 sm:pr-10 pl-1 text-base text-gray-200 placeholder-light-200 outline-hidden"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleChatSubmit(friendlyResponse + chatInput);
                            setChatInput("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          handleChatSubmit(friendlyResponse + chatInput);
                          setChatInput("");
                        }}
                        disabled={isChatMessagesLoading}
                      >
                        {isChatMessagesLoading ? "🔄" : "➡️"}
                      </button>
                    </div>
                  </div>
                  <p>{chatMessages}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
