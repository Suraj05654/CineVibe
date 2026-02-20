export async function fetchTrailerUrl(movieId, apiKey) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch trailer");
    const data = await response.json();
    // Prefer official trailer
    let trailer = data.results.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer" && vid.official
    );
    // Fallback to any YouTube trailer
    if (!trailer) {
      trailer = data.results.find(
        (vid) => vid.site === "YouTube" && vid.type === "Trailer"
      );
    }
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
} 