# SalesmanPro Admin Mobile App

This is the Android mobile application for the SalesmanPro Admin Portal. It provides a mobile interface for managing your business operations on the go.

## Features

- **Dashboard**: Overview of key business metrics including revenue, orders, customers, and products
- **Orders Management**: View, search, and filter orders by status
- **Customer Management**: Browse and search customer information
- **Product Management**: View and manage product inventory
- **User Profile**: Manage account settings and preferences
- **Authentication**: Secure login with token-based authentication

## Tech Stack

- React Native 0.72.7
- TypeScript
- React Navigation (Stack & Bottom Tabs)
- React Native Paper (UI Components)
- Axios (API Client)
- AsyncStorage (Local Storage)
- React Native Vector Icons

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- JDK 11 or higher
- Android SDK (API Level 33)

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API URL:

Create a `.env` file in the mobile-app directory with the following content:
```
API_URL=https://your-api-url.com/api
```

Or update the API_BASE_URL in `src/services/api.ts` directly.

4. Install Android dependencies:
```bash
cd android
./gradlew clean
cd ..
```

## Running the App

### Android

1. Start the Metro bundler:
```bash
npm start
```

2. In a new terminal, run the Android app:
```bash
npm run android
```

Or you can build and run using Android Studio:
- Open the `android` folder in Android Studio
- Wait for Gradle sync to complete
- Click "Run" button or use Shift+F10

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

### Android App Bundle (AAB)

```bash
cd android
./gradlew bundleRelease
```

The AAB will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

## Project Structure

```
mobile-app/
├── android/                 # Android native code
│   ├── app/
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/salesmanpro/  # Java/Kotlin code
│   │           ├── res/                    # Android resources
│   │           └── AndroidManifest.xml
│   ├── build.gradle
│   └── settings.gradle
├── ios/                     # iOS native code (future)
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── App.tsx                 # Root component
├── index.js                # Entry point
├── package.json
└── tsconfig.json
```

## API Integration

The mobile app connects to the same backend API as the web application. Ensure your backend API is running and accessible.

### API Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/admin/{companyId}/dashboard/stats` - Dashboard statistics
- `GET /api/admin/{companyId}/orders` - List orders
- `GET /api/admin/{companyId}/customers` - List customers
- `GET /api/admin/{companyId}/products` - List products

## Configuration

### Changing App Name

1. Update `app.json`:
```json
{
  "name": "YourAppName",
  "displayName": "Your App Display Name"
}
```

2. Update `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Changing App Icon

Replace the icon files in:
- `android/app/src/main/res/mipmap-*dpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-*dpi/ic_launcher_round.png`

### Changing Package Name

1. Update `android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.yourcompany.appname"
    ...
}
```

2. Rename the Java package directories and update imports

## Troubleshooting

### Metro bundler issues

```bash
npm start -- --reset-cache
```

### Android build issues

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Clear all caches

```bash
watchman watch-del-all
rm -rf node_modules
npm install
npm start -- --reset-cache
```

## Contributing

This mobile app is part of the SalesmanPro project. For contribution guidelines, please refer to the main project README.

## License

This project is part of SalesmanPro and follows the same license.

## Support

For issues and questions:
- Create an issue in the main repository
- Contact the development team

## Roadmap

### Upcoming Features
- [ ] iOS support
- [ ] Push notifications
- [ ] Offline mode
- [ ] Biometric authentication
- [ ] Dark mode
- [ ] Order details screen
- [ ] Product editing
- [ ] Customer details
- [ ] Sales reports and analytics
- [ ] Real-time order updates
- [ ] Barcode scanning for inventory
- [ ] Multi-language support

## Screenshots

_(Screenshots will be added after UI implementation is complete)_

## Notes

- This is an initial implementation focusing on core admin features
- The app is designed to work with the existing SalesmanPro backend API
- Additional features from the web admin panel can be progressively added
- The app follows React Native best practices and uses TypeScript for type safety
