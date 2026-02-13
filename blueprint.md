# Project Blueprint

## Overview

This project is a music player application that allows users to search for songs, play them, and create playlists. It also has a feature to create and customize displays with various widgets that can be linked to IoT devices.

## Implemented Features

* **Song Search:** Users can search for songs using a search bar.
* **Music Player:** Users can play, pause, skip, and seek songs.
* **Playlist Management:** Users can add and remove songs from their personal playlist.
* **Authentication:** Users can log in to the application using email and password.
* **Playlist on Load:** The user's playlist is displayed by default when they visit the music page.
* **Loading Spinner:** A spinner is displayed while the playlist is loading.
* **Clear Search to Restore Playlist:** When the search input is cleared, the user's playlist is restored.
* **Shuffle Control:** Users can toggle between random and sequential playback.
* **Delete from Playlist:** Users can remove songs from their playlist.
* **Conditional Sign-In Icon:** A sign-in icon is displayed on the navbar for logged-out users, which opens a modal for authentication.
* **Album Information:** The music player now displays the album name for each song in the playlist and in the player view. The album name is also saved to the user's playlist when they like a song.
* **Compact Music List:** The music list has been redesigned to be more compact, allowing more songs to be displayed on the screen at once.
* **Removed Scrollable Container:** The scrollable container for the song list has been removed, allowing the page to scroll naturally with the song list.
* **Compact Song Card:** The song card has been redesigned to be more compact, with a 100x100px image and song information to the right, to maximize the number of songs visible on the screen.
* **Responsive Song Grid:** The song list is now a responsive grid, displaying multiple columns on larger screens and a single column on smaller screens, optimizing the layout for all devices.
* **Dynamic Display Feeds:** The display customization page now dynamically loads and renders feeds from the Firebase Realtime Database. Any feed created under `/<uid>/<deviceCode>/devFeeds` will be available as a draggable widget, allowing for a fully customizable display.


## Current Plan

* The user wants a responsive song list that doesn't appear too long. I have implemented a responsive grid layout that adjusts the number of columns based on the screen size, ensuring an optimal viewing experience on all devices.
