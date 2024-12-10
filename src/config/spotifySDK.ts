import { SpotifyApi } from '@spotify/web-api-ts-sdk'

export const spotifyApi = SpotifyApi.withUserAuthorization(
  import.meta.env.VITE_CLIENT_ID,
  import.meta.env.VITE_REDIRECT_URI,
  [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-follow-read',
    'user-top-read',
    'user-read-recently-played',
    'user-read-email',
    'user-read-private',
  ],
)
