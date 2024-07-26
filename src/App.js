import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [description, setDescription] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [spotifyLink, setSpotifyLink] = useState(null);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(true);  // Assume true initially
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, []);

  const handleInputChange = (e) => {
    setDescription(e.target.value);
  };

  const handleGetRecommendations = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/recommend`, { description }, {
        params: { session_id: sessionId }
      });
      if (response && response.data) {
        if (response.data.authorized) {
          setRecommendations(response.data.recommendation);
          setSpotifyLink(response.data.spotify_link);
          setError(null); // Clear error message on success
          setAuthorized(true);  // User is authorized
        } else {
          setAuthorized(false);  // User is not authorized
        }
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setError('Error fetching recommendation. Please try again.');
      if (error.response && error.response.status === 401) {
        setAuthorized(false);  // User is not authorized
      }
    }
  };

  return (
    <div className="App">
      <h1>Mood Melody</h1>
      <textarea
        value={description}
        onChange={handleInputChange}
        placeholder="Enter the desired song qualities or mood..."
      />
      <br />
      <button onClick={handleGetRecommendations}>Get Recommendations</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!authorized && (
        <div>
          <p style={{ color: 'red' }}>You are not authorized in Spotify.</p>
          <button onClick={() => window.location.href = 'http://localhost:5000/auth/login'}>Authorize</button>
        </div>
      )}
      {authorized && recommendations.length > 0 && (
        <div>
          <h2>Recommendations</h2>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
          {spotifyLink && (
            <div>
              <h2>Spotify Playlist</h2>
              <p>
                <a href={spotifyLink} target="_blank" rel="noopener noreferrer">
                  Open Playlist on Spotify
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
