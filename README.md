# CM3070-SafeBuddy
Source code for CM3070 Final Year Project. SafeBuddy is an emergency responder app for local disaster preparedness and response. SafeBuddy combines disaster education with real-time emergency response capabilities, providing users with accessible emergency information and response tools. The app focuses on helping users who may be living independently for the first time or are actively engaged in professional environments and daily commutes.

## Features

- **Edu Games** - Learn about Earthquakes, Tsunamis, Floods, and Landslides, and what you should do before, during, and after. Materials are available in English, Simplified-Chinese, Malay, and Tamil.

  ***Reading***: Get badges after completing each module, and get an extra badge when you finish all four!

  ***Quiz***: Challenge your knowledge with a simple quiz to get you extra prepared!

   ***Build An Emergency Kit***: What should you bring in an emergency? Find out what stuff really matters!
-  **Add Contacts** - Add a contact simply by keying in their email (must be a registered user).
-  **Location Sharing** - Share your real-time location with contacts, available in One-Time or Live Sharing (you can track movement!)
-  **Call Local Emergency** - Call 999 (Singapore's emergency number) with a press of a button!
-  **Notifications**

     - Daily reminders
    -  Real-time alerts (via Expo Notifications)
  
- **Profile Settings** 
  - Manage notifications
  - Update personal info

## Tech Stack

- **React Native** with Expo
- **Firebase Authentication** & Firestore  
- **Jest** (unit testing)

## Installation & Setup

**Clone the repository:**
```bash
git clone https://github.com/celleztial/CM3070-SafeBuddy
cd CM3070-SafeBuddy
```

**Install Expo CLI (if not already installed)**
```bash
npm install -g expo-cli
```

**Install Dependencies**
```bash
npm install
```

**Run**
```bash
npx expo start
```

**To open the app in your mobile device**
- install Expo Go app from the App Store or Google Play Store
- Scan the QR code generated in the terminal after running npx expo start


