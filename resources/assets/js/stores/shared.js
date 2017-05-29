import { assign } from 'lodash'
import isMobile from 'ismobilejs'

import { http } from '../services'
import { userStore, preferenceStore, artistStore, albumStore, songStore, playlistStore, queueStore, settingStore } from '.'

export const sharedStore = {
  state: {
    songs: [],
    albums: [],
    artists: [],
    favorites: [],
    queued: [],
    interactions: [],
    users: [],
    settings: [],
    currentUser: null,
    playlists: [],
    useLastfm: false,
    useYouTube: false,
    useiTunes: false,
    allowDownload: false,
    currentVersion: '',
    latestVersion: '',
    cdnUrl: '',
    originalMediaPath: ''
  },

  init () {
    return new Promise((resolve, reject) => {
      http.get('data', ({ data }) => {
        assign(this.state, data)
        // Don't allow downloading on mobile devices
        this.state.allowDownload = this.state.allowDownload && !isMobile.any

        // Always disable YouTube integration on mobile.
        this.state.useYouTube = this.state.useYouTube && !isMobile.phone

        // If this is a new user, initialize his preferences to be an empty object.
        if (!this.state.currentUser.preferences) {
          this.state.currentUser.preferences = {}
        }

        userStore.init(this.state.users, this.state.currentUser)
        preferenceStore.init(this.state.preferences)
        settingStore.init(this.state.settings)

        // Keep a copy of the media path. We'll need this to properly warn the user later.
        this.state.originalMediaPath = this.state.settings.media_path

        http.get(data.data_url, ({ data }) => {
          assign(this.state, data)

          artistStore.init(this.state.artists)
          albumStore.init(this.state.albums)
          songStore.init(this.state.songs)
          songStore.initInteractions(this.state.interactions)
          playlistStore.init(this.state.playlists)
          queueStore.init()

          resolve(this.state)
        }, error => reject(error))

      }, error => reject(error))
    })
  }
}
