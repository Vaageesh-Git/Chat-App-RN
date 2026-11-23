# 💬 Chat App (React Native & Expo)

A cross-platform real-time mobile chat application built with **React Native** and **Expo SDK 58**. It supports 1-on-1 direct messaging, group conversations, media attachments (both gallery selection and live camera capture), search filtering, and user management.

---

## 🚀 Features

- **Conversations Hub**:
  - Browse all active 1-on-1 direct messages and group conversations.
  - Real-time search to instantly filter conversations by name or creator.
  - Pull-to-refresh (`RefreshControl`) to synchronize with the backend.
  - Clean card design with initials avatar and sender details.

- **Interactive Chat Screen**:
  - Message bubble UI separating sent messages (right/blue) and received messages (left/white).
  - Formatted timestamps for each message.
  - Support for text messages and base64 image transmissions.
  - **In-Chat Camera**: Capture photos directly from your phone camera and send them into the chat.
  - **In-Chat Gallery**: Pick images from your photo library with an instant preview before sending.
  - Optimistic message sending for instant UI feedback.
  - Automatic scrolling to the newest message.

- **User Discovery & Group Creation**:
  - List registered users with profile bio and names.
  - Toggle selection between **Direct Message (DM)** mode and **Group Chat** mode.
  - Real-time user search filter.
  - Visual selection badges with active highlights and selected user counter.

- **Media & Hardware Integration**:
  - Native camera capture using `expo-image-picker` and `expo-camera`.
  - Photo library selection with permission handling.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React Native 0.88 with Expo SDK 58
- **Navigation**:
  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs` (Tab Navigation for Chats, Users, and Camera)
  - `@react-navigation/native-stack` (Stack Navigation for Conversations & Chat)
- **Media & Hardware**:
  - `expo-image-picker`
  - `expo-camera`
  - `expo-file-system`
- **Networking**: Native Fetch API with Basic Authentication
- **Push & Notifications**: `@react-native-firebase/app` and `@react-native-firebase/messaging`

---

## 📂 Project Structure

```
chat_app/
├── App.js                   # Application root with Bottom Tab Navigator
├── app.json                 # Expo project configuration
├── screens/
│   ├── config.js            # Centralized API Base URL & Auth configuration
│   ├── Stack.jsx            # Stack navigator for Conversation -> Chat
│   ├── ConversationScreen.jsx # Conversation list with search & pull-to-refresh
│   ├── ChatScreen.jsx       # Chat messaging screen with bubbles & media
│   ├── AllUsers.jsx         # User list, search, and DM/Group creation
│   ├── CameraScreen.jsx     # Standalone camera capture utility
│   ├── ImagePicker.jsx      # Standalone gallery picker utility
│   └── RawCameraScreen.jsx  # Custom camera view implementation
└── assets/                  # App icons and splash assets
```

---

## ⚙️ Configuration & Setup

### 1. Configure the API Backend
Open `screens/config.js` and set your server's IP address:

```javascript
export const API_BASE_URL = 'http://<YOUR_LOCAL_IP>:3000';
export const AUTH_HEADER = 'Basic first:second';
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```

Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go on your physical device.

---

## 👨‍💻 Author

- **GitHub**: [@Vaageesh-Git](https://github.com/Vaageesh-Git)
