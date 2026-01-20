# Project Blueprint

## Overview

This project is a music player application that allows users to search for songs, play them, and create playlists.

## Implemented Features

* **Song Search:** Users can search for songs using a search bar.
* **Music Player:** Users can play, pause, skip, and seek songs.
* **Playlist Management:** Users can add and remove songs from their personal playlist.
* **Authentication:** Users can log in to the application.
* **Playlist on Load:** The user's playlist is displayed by default when they visit the music page.
* **Loading Spinner:** A spinner is displayed while the playlist is loading.
* **Clear Search to Restore Playlist:** When the search input is cleared, the user's playlist is restored.
* **Shuffle Control:** Users can toggle between random and sequential playback.
* **Delete from Playlist:** Users can remove songs from their playlist.

## Current Plan

* The user wants to fix a bug where deleting a song from the playlist is not working. The issue is that the wrong database function was being used. The plan is to replace `updateValuesToDatabase` with `setValueToDatabase` and set the song's value to `null` to properly delete it. The `handleLike` function will use `updateValuesToDatabase` to add songs to the playlist.
