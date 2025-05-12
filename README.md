# democra.C - Real-time Political Rating App

democra.C is a news aggregation platform that enables crowd-sourced political ratings and insights, with comprehensive tracking of Israeli politicians across multiple news sources.

## Features

- News aggregation from multiple Israeli news sources
- Real-time political ratings system
- Identification of politicians mentioned in news articles
- Full RTL (right-to-left) Hebrew interface
- Dark mode support
- Mobile-responsive design
- Expandable/collapsible news cards
- Politician profile images

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **Mobile App**: Capacitor for Android

## Architecture

The application consists of:

1. A web server that fetches news from RSS feeds
2. A database storing politicians and user ratings
3. A React frontend for displaying news and collecting ratings
4. An Android app wrapper for mobile distribution

## Running the Web App

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run start
```

## Android App

The Android version of the app is built using Capacitor. See the [Android README](android/README.md) for detailed instructions on building and deploying the Android app.

### Building the Android App

Quick steps:

1. Build the web app
   ```bash
   npm run build
   ```

2. Sync the web assets with Capacitor
   ```bash
   npx cap sync android
   ```

3. Open in Android Studio
   ```bash
   npx cap open android
   ```

4. Build and sign the AAB file in Android Studio

## Google Play Store Submission

Assets and information for Google Play Store submission are available in the `google_play_assets` directory, including:

- Screenshots
- Privacy policy
- Store listing information
- Keystore instructions

## Project Structure

- `server/`: Backend Express server code
- `client/`: React frontend application
- `shared/`: Shared types between frontend and backend
- `android/`: Capacitor Android project
- `attached_assets/`: Images and assets used in the app
- `google_play_assets/`: Assets for Google Play Store submission

## Database

The app uses PostgreSQL with Drizzle ORM. The main entities are:

- Politicians: Information about Israeli politicians
- Ratings: User ratings for politicians related to specific articles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License