# 🛠️ Jeeva Learning - Mobile Development Setup Guide

## 📋 Overview

This guide provides complete step-by-step instructions for setting up your development environment to build the Jeeva Learning mobile app using **React Native** and **Expo**.

**Platform:** iOS & Android  
**Framework:** React Native + Expo  
**Language:** TypeScript  
**Version:** 1.0

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] macOS (for iOS development) or Windows/Linux (for Android only)
- [ ] Internet connection
- [ ] Administrator/sudo access on your machine
- [ ] At least 20GB free disk space
- [ ] 8GB+ RAM recommended

---

## 1️⃣ Install Core Tools

### 1.1 Node.js & npm

**Required Version:** Node.js 18+ or 20+ (LTS recommended)

**Install via Homebrew (macOS):**

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

**Install via Official Installer (Windows/macOS):**

1. Visit [nodejs.org](https://nodejs.org)
2. Download LTS version (20.x)
3. Run installer and follow prompts
4. Restart terminal/command prompt

**Verify Installation:**

```bash
node --version
npm --version
```

---

### 1.2 Git

**macOS:**

```bash
# Git usually comes pre-installed, verify:
git --version

# If not installed, install via Homebrew:
brew install git
```

**Windows:**

1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run installer with default options
3. Restart terminal

**Configure Git:**

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### 1.3 Expo CLI

**Install Globally:**

```bash
npm install -g expo-cli

# Verify installation
expo --version
```

**Alternative (npx - no global install):**

```bash
# You can use npx instead of global install
npx expo --version
```

---

### 1.4 Watchman (macOS/Linux - Recommended)

Watchman watches files for changes and triggers rebuilds.

**macOS:**

```bash
brew install watchman

# Verify
watchman --version
```

**Linux (Ubuntu/Debian):**

```bash
# Install dependencies
sudo apt-get install -y autoconf automake build-essential python-dev libtool

# Clone and install Watchman
git clone https://github.com/facebook/watchman.git
cd watchman
git checkout v2023.11.20.00
./autogen.sh
./configure
make
sudo make install
```

---

## 2️⃣ iOS Development Setup (macOS Only)

### 2.1 Install Xcode

**From App Store:**

1. Open Mac App Store
2. Search for "Xcode"
3. Click "Get" (14GB+ download)
4. Wait for installation (can take 30-60 minutes)

**Verify Installation:**

```bash
xcode-select --version
```

**Install Xcode Command Line Tools:**

```bash
xcode-select --install

# Accept license
sudo xcodebuild -license accept
```

---

### 2.2 Install iOS Simulator

1. Open Xcode
2. Go to **Xcode → Settings → Platforms**
3. Download iOS Simulator (if not already installed)
4. Download iOS 17.0+ runtime

**Verify Simulators:**

```bash
xcrun simctl list devices
```

**Create Custom Simulator (Optional):**

```bash
# List available device types
xcrun simctl list devicetypes

# Create iPhone 15 simulator
xcrun simctl create "iPhone 15" "iPhone 15"
```

---

### 2.3 Install CocoaPods

CocoaPods manages iOS dependencies.

**Install:**

```bash
sudo gem install cocoapods

# Verify
pod --version
```

**If using Ruby version manager (rbenv/rvm):**

```bash
gem install cocoapods
```

---

## 3️⃣ Android Development Setup

### 3.1 Install Java Development Kit (JDK)

**Required Version:** JDK 17 (recommended)

**macOS:**

```bash
brew install openjdk@17

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
java --version
```

**Windows:**

1. Download JDK 17 from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [Adoptium](https://adoptium.net/)
2. Run installer
3. Set JAVA_HOME environment variable:
   - System Properties → Environment Variables
   - New → Variable: `JAVA_HOME`, Value: `C:\Program Files\Java\jdk-17`
   - Add to Path: `%JAVA_HOME%\bin`

---

### 3.2 Install Android Studio

**Download & Install:**

1. Visit [developer.android.com/studio](https://developer.android.com/studio)
2. Download Android Studio
3. Run installer
4. Follow setup wizard:
   - Choose "Standard" installation
   - Accept all licenses
   - Let it download SDK components (8GB+)

**Configure Android SDK:**

1. Open Android Studio
2. Go to **Settings → Appearance & Behavior → System Settings → Android SDK**
3. Install these SDK platforms:
   - ✅ Android 14.0 (API 34) - Latest
   - ✅ Android 13.0 (API 33)
4. Switch to **SDK Tools** tab:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM installer) - macOS/Windows

---

### 3.3 Set Environment Variables

**macOS/Linux (~/.zshrc or ~/.bash_profile):**

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Apply changes
source ~/.zshrc
```

**Windows (Environment Variables):**

1. Open System Properties → Environment Variables
2. Add new variables:
   - `ANDROID_HOME`: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
3. Edit Path variable, add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

**Verify:**

```bash
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME%  # Windows

adb --version
emulator -version
```

---

### 3.4 Create Android Emulator

**Using Android Studio:**

1. Open Android Studio
2. Click **More Actions → Virtual Device Manager**
3. Click **Create Device**
4. Select device (e.g., Pixel 7)
5. Download system image (Android 13 or 14)
6. Configure AVD:
   - Name: Pixel_7_API_34
   - Graphics: Hardware - GLES 2.0
   - RAM: 2048 MB (or more)
7. Click Finish

**Using Command Line:**

```bash
# List available system images
sdkmanager --list | grep system-images

# Download system image
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create AVD
avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_7"

# List AVDs
emulator -list-avds
```

**Test Emulator:**

```bash
emulator -avd Pixel_7_API_34
```

---

## 4️⃣ Code Editor Setup

### 4.1 Install Visual Studio Code

**Download & Install:**

1. Visit [code.visualstudio.com](https://code.visualstudio.com)
2. Download for your OS
3. Install and open VS Code

---

### 4.2 Essential VS Code Extensions

Install these extensions for optimal development:

**Required:**

- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **React Native Tools** (msjsdiag.vscode-react-native)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **TypeScript** (ms-vscode.vscode-typescript-next)

**Recommended:**

- **Auto Rename Tag** (formulahendry.auto-rename-tag)
- **Path Intellisense** (christian-kohler.path-intellisense)
- **GitLens** (eamodio.gitlens)
- **Error Lens** (usernamehw.errorlens)
- **Material Icon Theme** (PKief.material-icon-theme)
- **Thunder Client** (rangav.vscode-thunder-client) - API testing

**Install via Command Palette:**

```
Cmd/Ctrl + Shift + P → "Extensions: Install Extensions"
```

**Or via terminal:**

```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension msjsdiag.vscode-react-native
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

---

### 4.3 VS Code Settings

**Create/Update settings.json:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative",
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 5️⃣ Create New Expo Project

### 5.1 Initialize Project

**Create Project:**

```bash
# Navigate to your projects folder
cd ~/Projects

# Create new Expo app with TypeScript
npx create-expo-app jeeva-mobile-app --template expo-template-blank-typescript

# Navigate to project
cd jeeva-mobile-app
```

**Or use Expo CLI:**

```bash
expo init jeeva-mobile-app
# Select: blank (TypeScript)
cd jeeva-mobile-app
```

---

### 5.2 Install Dependencies

**Core Dependencies:**

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

**Navigation:**

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

**UI & State Management:**

```bash
npm install zustand @tanstack/react-query notistack
npm install react-native-gesture-handler react-native-reanimated
```

**Media & Utilities:**

```bash
npm install expo-av expo-image-picker expo-notifications
npm install date-fns expo-linking
```

**Dev Dependencies:**

```bash
npm install -D @types/react @types/react-native
```

---

### 5.3 Project Structure

**Create folder structure:**

```bash
mkdir -p src/{components,screens,navigation,hooks,context,utils,types,api,constants}
mkdir -p src/components/{auth,common,learning}
mkdir -p assets/{images,fonts,icons}
```

**Final structure:**

```
jeeva-mobile-app/
├── src/
│   ├── api/              # API clients
│   ├── components/       # React components
│   │   ├── auth/
│   │   ├── common/
│   │   └── learning/
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation config
│   ├── hooks/            # Custom hooks
│   ├── context/          # Context providers
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   └── constants/        # App constants
├── assets/               # Static assets
├── app.json              # Expo config
├── tsconfig.json         # TypeScript config
└── package.json
```

---

## 6️⃣ Configuration Files

### 6.1 Environment Variables

**Create .env file:**

```bash
touch .env
```

**Add environment variables:**

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Config
EXPO_PUBLIC_APP_NAME=Jeeva Learning
EXPO_PUBLIC_API_TIMEOUT=30000
```

**Install dotenv:**

```bash
npm install dotenv
```

**Note:** Expo automatically loads variables prefixed with `EXPO_PUBLIC_`

---

### 6.2 TypeScript Configuration

**Update tsconfig.json:**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

**Install babel plugin for path aliases:**

```bash
npm install -D babel-plugin-module-resolver
```

**Update babel.config.js:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@hooks": "./src/hooks",
            "@utils": "./src/utils",
            "@api": "./src/api",
            "@types": "./src/types",
          },
        },
      ],
    ],
  };
};
```

---

### 6.3 ESLint & Prettier

**Install:**

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**Create .eslintrc.js:**

```javascript
module.exports = {
  extends: [
    "expo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
```

**Create .prettierrc:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

---

### 6.4 App Configuration (app.json)

**Update app.json:**

```json
{
  "expo": {
    "name": "Jeeva Learning",
    "slug": "jeeva-learning",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#007AFF"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.jeeva.learning",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to upload profile pictures.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photos to upload images."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#007AFF"
      },
      "package": "com.jeeva.learning",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "jeevalearning",
    "plugins": ["expo-router"]
  }
}
```

---

## 7️⃣ Running the App

### 7.1 Start Development Server

**Start Expo server:**

```bash
npm start
# or
npx expo start
```

This opens the Expo DevTools in your browser.

---

### 7.2 Run on iOS Simulator

**Method 1: Press 'i' in terminal**

```bash
# After npm start, press 'i'
# This automatically opens iOS simulator
```

**Method 2: Specific simulator**

```bash
npx expo run:ios --simulator="iPhone 15"
```

**Method 3: Via Expo Go app**

1. Install Expo Go from App Store on your iPhone
2. Scan QR code from terminal
3. App opens in Expo Go

---

### 7.3 Run on Android Emulator

**Method 1: Press 'a' in terminal**

```bash
# After npm start, press 'a'
# This automatically opens Android emulator
```

**Method 2: Specific emulator**

```bash
# Start emulator first
emulator -avd Pixel_7_API_34

# Then run
npx expo run:android
```

**Method 3: Via Expo Go app**

1. Install Expo Go from Play Store on Android device
2. Scan QR code from terminal
3. App opens in Expo Go

---

### 7.4 Run on Physical Device

**iOS (via Expo Go):**

1. Install Expo Go from App Store
2. Ensure iPhone and computer on same Wi-Fi
3. Scan QR code with Camera app
4. Opens in Expo Go

**Android (via Expo Go):**

1. Install Expo Go from Play Store
2. Ensure device and computer on same Wi-Fi
3. Scan QR code with Expo Go app

---

## 8️⃣ Debugging Tools

### 8.1 React Native Debugger

**Install:**

```bash
# macOS
brew install --cask react-native-debugger

# Windows/Linux: Download from GitHub
# https://github.com/jhen0409/react-native-debugger/releases
```

**Usage:**

1. Start React Native Debugger
2. In your app, press `Cmd+D` (iOS) or `Cmd+M` (Android)
3. Select "Debug" from menu
4. Debugger connects automatically

---

### 8.2 Flipper (Meta's debugging platform)

**Install:**

```bash
# macOS
brew install --cask flipper

# Or download from: https://fbflipper.com
```

**Features:**

- Network inspector
- Layout inspector
- Logs viewer
- React DevTools integration
- Performance monitor

---

### 8.3 Chrome DevTools

**Enable:**

1. In app, shake device or press `Cmd+D`/`Cmd+M`
2. Select "Debug Remote JS"
3. Opens Chrome at `http://localhost:19000/debugger-ui`
4. Open Chrome DevTools (F12)

---

## 9️⃣ Supabase Setup

### 9.1 Create Supabase Client

**Create lib/supabase.ts:**

```typescript
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

### 9.2 Test Connection

**Create screens/TestScreen.tsx:**

```typescript
import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function TestScreen() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const { data, error } = await supabase.from('modules').select('count')
    setConnected(!error)
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Supabase: {connected ? '✅ Connected' : '❌ Not Connected'}</Text>
    </View>
  )
}
```

---

## 🔟 Common Issues & Solutions

### Issue 1: Metro Bundler Cache

**Problem:** App not updating with changes

**Solution:**

```bash
# Clear cache
npx expo start --clear

# Or
rm -rf node_modules
npm install
npx expo start
```

---

### Issue 2: iOS Simulator Not Opening

**Problem:** Simulator doesn't start

**Solution:**

```bash
# Open Xcode first
open /Applications/Xcode.app

# Reset simulator
xcrun simctl erase all

# Try again
npx expo run:ios
```

---

### Issue 3: Android Emulator Slow

**Problem:** Emulator running slowly

**Solution:**

1. Increase AVD RAM: Android Studio → AVD Manager → Edit → Advanced → RAM: 4096MB
2. Enable hardware acceleration:
   ```bash
   # macOS/Linux
   echo "hw.gpu.enabled = yes" >> ~/.android/avd/[AVD_NAME].avd/config.ini
   ```
3. Use physical device instead

---

### Issue 4: Module Not Found

**Problem:** Can't resolve module

**Solution:**

```bash
# Clear watchman
watchman watch-del-all

# Clear Metro
rm -rf /tmp/metro-*

# Reinstall
rm -rf node_modules
npm install

# Restart
npx expo start --clear
```

---

### Issue 5: Unable to Connect to Supabase

**Problem:** Connection timeout

**Solution:**

1. Check .env file exists and has correct values
2. Verify network connection
3. Test from browser: `https://your-project.supabase.co/rest/v1/`
4. Check Supabase project is not paused
5. Ensure environment variables are prefixed with `EXPO_PUBLIC_`

---

### Issue 6: Build Failed

**Problem:** iOS/Android build fails

**Solution:**

```bash
# iOS
cd ios
pod install --repo-update
cd ..

# Android
cd android
./gradlew clean
cd ..

# Rebuild
npx expo run:ios
# or
npx expo run:android
```

---

## 1️⃣1️⃣ Useful Commands

### Development

```bash
# Start dev server
npm start

# Start with clear cache
npm start -- --clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Debugging

```bash
# Open React Native debugger
open "rndebugger://set-debugger-loc?host=localhost&port=19000"

# View logs
npx react-native log-ios
npx react-native log-android

# Check bundle
npx expo export
```

### Cleanup

```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
rm -rf /tmp/metro-*
watchman watch-del-all
npm install
npm start -- --clear
```

---

## 1️⃣2️⃣ Team Collaboration

### Git Setup

**Initialize Git:**

```bash
git init
git add .
git commit -m "Initial commit: Jeeva Learning mobile app"
```

**Connect to GitHub:**

```bash
git remote add origin https://github.com/Jeeva-Edtech-app/jeeva-mobile-app.git
git branch -M main
git push -u origin main
```

**Create .gitignore:**

```
# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Build
*.jks
*.p8
*.p12
*.key
*.mobileprovision
```

---

### Code Review Checklist

Before submitting PR:

- [ ] Code follows TypeScript best practices
- [ ] All new features have tests
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] No console.log statements
- [ ] Environment variables not hardcoded
- [ ] Comments added for complex logic
- [ ] UI matches Figma designs
- [ ] Tested on both iOS and Android
- [ ] No performance issues

---

## 1️⃣3️⃣ OAuth Authentication (Google & Apple)

### 13.1 Google Sign-In Setup

**Install Dependencies:**

```bash
npm install @react-native-google-signin/google-signin
npx expo install expo-auth-session expo-crypto
```

**Configure Supabase:**

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

**Google Cloud Console Setup:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Configure consent screen
6. Create credentials:
   - **Web client** - For Supabase redirect
   - **iOS client** - For iOS app
   - **Android client** - For Android app
7. Copy Client IDs and add to Supabase + app config

**Implementation:**

```typescript
// src/services/auth.ts
import { supabase } from "@/lib/supabase";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "jeevalearning://auth/callback",
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    // Open OAuth URL
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      "jeevalearning://auth/callback",
    );

    if (result.type === "success") {
      // Extract tokens from URL
      const { url } = result;
      // Handle session...
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
}
```

---

### 13.2 Apple Sign-In Setup

**Install Dependencies:**

```bash
npx expo install expo-apple-authentication
```

**Configure Supabase:**

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Configure Apple Developer settings (Services ID, Team ID, Key ID)

**Apple Developer Setup:**

1. Go to [developer.apple.com](https://developer.apple.com)
2. Certificates, IDs & Profiles → Identifiers
3. Create App ID (if not exists)
4. Enable "Sign In with Apple" capability
5. Create Services ID:
   - Identifier: com.jeeva.learning.signin
   - Return URLs: `https://your-project.supabase.co/auth/v1/callback`
6. Create Key for Sign In with Apple
7. Download key file (.p8)

**Update app.json:**

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    },
    "plugins": ["expo-apple-authentication"]
  }
}
```

**Implementation:**

```typescript
// src/services/auth.ts
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";

export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Sign in to Supabase with Apple token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken!,
      nonce: credential.nonce,
    });

    if (error) throw error;

    // Update user profile with Apple data
    const { user } = data;
    await supabase.from("user_profiles").upsert({
      user_id: user.id,
      full_name: credential.fullName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
        : "",
    });
  } catch (error) {
    console.error("Apple sign-in error:", error);
  }
}
```

**UI Component:**

```typescript
// src/components/auth/AppleSignInButton.tsx
import * as AppleAuthentication from 'expo-apple-authentication'
import { Platform } from 'react-native'

export function AppleSignInButton({ onSuccess }: { onSuccess: () => void }) {
  // Apple Sign-In only available on iOS
  if (Platform.OS !== 'ios') return null

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={{ width: '100%', height: 50 }}
      onPress={async () => {
        await signInWithApple()
        onSuccess()
      }}
    />
  )
}
```

---

### 13.3 OAuth Provider Tracking

**Update User Record:**

```typescript
// After successful OAuth sign-in
async function updateUserProvider(
  userId: string,
  provider: "google" | "apple",
) {
  await supabase
    .from("users")
    .update({
      oauth_provider: provider,
      oauth_id: user.id, // From OAuth provider
    })
    .eq("id", userId);
}
```

---

## 1️⃣4️⃣ Profile Completion Flow

### 14.1 Profile Completion Screen

**Purpose:** Collect essential user information after first-time registration.

**Required Fields:**

- Full Name
- Phone Number (with country code)
- Current Country (for payment gateway routing)
- Date of Birth
- Gender
- NMC Attempts (0 if first time)
- Using coaching? (Yes/No)

**Navigation Logic:**

```typescript
// src/navigation/AuthNavigator.tsx
import { useAuth } from '@/hooks/useAuth'

export function RootNavigator() {
  const { user, profile } = useAuth()

  if (!user) {
    return <AuthStack /> // Login/Signup screens
  }

  if (!profile?.profile_completed) {
    return <ProfileCompletionScreen />
  }

  return <MainApp /> // Dashboard and main features
}
```

**Profile Completion UI:**

```typescript
// src/screens/ProfileCompletionScreen.tsx
import { useState } from 'react'
import { View, TextInput, Button, Picker } from 'react-native'
import { supabase } from '@/lib/supabase'

export function ProfileCompletionScreen() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    country_code: '+91',
    current_country: 'India',
    date_of_birth: '',
    gender: '',
    nmc_attempts: 0,
    uses_coaching: false,
  })

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('user_profiles').upsert({
      user_id: user!.id,
      ...formData,
      profile_completed: true, // Mark as completed
    })

    // Navigate to dashboard
  }

  return (
    <View>
      <TextInput
        placeholder="Full Name"
        value={formData.full_name}
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
      />

      <TextInput
        placeholder="Phone Number"
        value={formData.phone_number}
        keyboardType="phone-pad"
        onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
      />

      <Picker
        selectedValue={formData.current_country}
        onValueChange={(value) => setFormData({ ...formData, current_country: value })}
      >
        <Picker.Item label="India" value="India" />
        <Picker.Item label="United Kingdom" value="UK" />
        <Picker.Item label="United States" value="USA" />
        <Picker.Item label="Canada" value="Canada" />
        <Picker.Item label="Australia" value="Australia" />
        {/* Add more countries */}
      </Picker>

      <Button title="Complete Profile" onPress={handleSubmit} />
    </View>
  )
}
```

---

## 1️⃣5️⃣ Payment Integration (Stripe & Razorpay)

### 15.1 Install Payment SDKs

**Stripe:**

```bash
npm install @stripe/stripe-react-native
```

**Razorpay:**

```bash
npm install react-native-razorpay
```

**Update app.json:**

```json
{
  "expo": {
    "plugins": ["@stripe/stripe-react-native"]
  }
}
```

---

### 15.2 Stripe Integration

**Setup Stripe Provider:**

```typescript
// App.tsx
import { StripeProvider } from '@stripe/stripe-react-native'

export default function App() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
      {/* Your app */}
    </StripeProvider>
  )
}
```

**Payment Screen:**

```typescript
// src/screens/PaymentScreen.tsx
import { useStripe } from '@stripe/stripe-react-native'

export function PaymentScreen({ planId, couponCode }: Props) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const handleStripePayment = async () => {
    // Call backend to create checkout session
    const response = await fetch(`${API_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, couponCode }),
    })

    const { sessionId, clientSecret } = await response.json()

    // Initialize payment sheet
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Jeeva Learning',
    })

    if (initError) {
      Alert.alert('Error', initError.message)
      return
    }

    // Present payment sheet
    const { error: presentError } = await presentPaymentSheet()

    if (!presentError) {
      Alert.alert('Success', 'Payment successful!')
      // Navigate to dashboard
    }
  }

  return <Button title="Pay with Stripe" onPress={handleStripePayment} />
}
```

---

### 15.3 Razorpay Integration

**Payment Screen:**

```typescript
// src/screens/PaymentScreen.tsx
import RazorpayCheckout from 'react-native-razorpay'

export function PaymentScreen({ planId, couponCode, user }: Props) {
  const handleRazorpayPayment = async () => {
    // Call backend to create order
    const response = await fetch(`${API_URL}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, couponCode }),
    })

    const { orderId, amount, currency } = await response.json()

    // Open Razorpay checkout
    const options = {
      description: 'NMC CBT Exam Preparation',
      image: 'https://your-logo-url.png',
      currency: currency,
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount,
      name: 'Jeeva Learning',
      order_id: orderId,
      prefill: {
        email: user.email,
        contact: user.phone_number,
        name: user.full_name,
      },
      theme: { color: '#007aff' },
    }

    RazorpayCheckout.open(options)
      .then(async (data) => {
        // Payment successful
        // Verify on backend
        await fetch(`${API_URL}/api/razorpay/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            paymentId: data.razorpay_payment_id,
            signature: data.razorpay_signature,
          }),
        })

        Alert.alert('Success', 'Payment successful!')
      })
      .catch((error) => {
        Alert.alert('Payment Failed', error.description)
      })
  }

  return <Button title="Pay with Razorpay" onPress={handleRazorpayPayment} />
}
```

---

### 15.4 Payment Gateway Routing

**Auto-select gateway based on country:**

```typescript
// src/utils/payment.ts
export function selectPaymentGateway(country: string): 'stripe' | 'razorpay' {
  return country === 'India' ? 'razorpay' : 'stripe'
}

// Usage in payment screen
const PaymentScreen = ({ plan, user }: Props) => {
  const gateway = selectPaymentGateway(user.current_country)

  return (
    <View>
      <PlanCard plan={plan} />

      {gateway === 'stripe' ? (
        <StripePaymentButton plan={plan} />
      ) : (
        <RazorpayPaymentButton plan={plan} />
      )}
    </View>
  )
}
```

---

## 1️⃣6️⃣ Trial Mode & Content Gating

### 16.1 Subscription Status Hook

**Create custom hook:**

```typescript
// src/hooks/useSubscription.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setSubscription(data);
    setLoading(false);
  };

  const hasAccess = (contentType: string, contentId?: string) => {
    if (!subscription) return false;

    // Check if subscription is active
    if (
      subscription.status === "active" &&
      new Date(subscription.end_date) > new Date()
    ) {
      return true;
    }

    // Trial mode restrictions
    if (subscription.status === "trial") {
      // Allow 1 learning module and 1 practice module
      const trialContent = {
        learning: ["module-id-1"],
        practice: ["topic-id-1"],
      };

      if (
        contentType === "learning" &&
        trialContent.learning.includes(contentId)
      ) {
        return true;
      }

      if (
        contentType === "practice" &&
        trialContent.practice.includes(contentId)
      ) {
        return true;
      }

      if (contentType === "mock_exam") {
        return false; // Mock exams locked in trial
      }
    }

    return false;
  };

  return { subscription, loading, hasAccess };
}
```

---

### 16.2 Content Gating Component

**Lock indicator:**

```typescript
// src/components/ContentLock.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export function ContentLock({ type }: { type: 'upgrade' | 'renew' }) {
  const navigation = useNavigation()

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ fontSize: 48 }}>🔒</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
        {type === 'upgrade' ? 'Upgrade to Access' : 'Subscription Expired'}
      </Text>
      <Text style={{ color: '#666', marginTop: 5 }}>
        {type === 'upgrade'
          ? 'Unlock all content with a premium plan'
          : 'Renew your subscription to continue'}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#007aff',
          padding: 15,
          borderRadius: 8,
          marginTop: 20
        }}
        onPress={() => navigation.navigate('SubscriptionPlans')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {type === 'upgrade' ? 'View Plans' : 'Renew Now'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

**Usage in screens:**

```typescript
// src/screens/LessonScreen.tsx
import { useSubscription } from '@/hooks/useSubscription'
import { ContentLock } from '@/components/ContentLock'

export function LessonScreen({ route }: Props) {
  const { lessonId, moduleId } = route.params
  const { user } = useAuth()
  const { hasAccess } = useSubscription(user.id)

  if (!hasAccess('learning', moduleId)) {
    return <ContentLock type="upgrade" />
  }

  return <LessonContent lessonId={lessonId} />
}
```

---

### 16.3 Trial Badge UI

**Show trial badge on free content:**

```typescript
// src/components/TrialBadge.tsx
import { View, Text } from 'react-native'

export function TrialBadge() {
  return (
    <View style={{
      backgroundColor: '#34C759',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    }}>
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        FREE TRIAL
      </Text>
    </View>
  )
}

// Usage in module cards
<ModuleCard module={module}>
  {isTrial && <TrialBadge />}
</ModuleCard>
```

---

## 1️⃣7️⃣ Next Steps

After setup is complete:

1. **Verify Everything Works:**

   ```bash
   npm start
   # Test on iOS simulator
   # Test on Android emulator
   ```

2. **Follow Documentation:**
   - [MOBILE_APP_FEATURES.md](./MOBILE_APP_FEATURES.md) - Complete feature specs
   - [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) - Payment setup details
   - [Authentication Flow](./AUTHENTICATION_FLOW.md)
   - [API Documentation](./API_DOCUMENTATION.md)
   - [UI Design Specs](./UI_DESIGN_SPECS.md)

3. **Start Building:**
   - Implement authentication screens (Email, Google, Apple)
   - Create profile completion flow
   - Set up navigation (Bottom tabs, Stack navigators)
   - Build 3 core modules (Practice, Learning, Mock Exam)
   - Integrate payment gateways (Stripe, Razorpay)
   - Implement trial mode and content gating
   - Add AI JeevaBot chat interface
   - Create reusable components
   - Integrate Supabase APIs

---

## 📚 Additional Resources

### Official Documentation

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Community

- [Expo Discord](https://chat.expo.dev)
- [React Native Community](https://reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Learning Resources

- [React Native School](https://www.reactnativeschool.com)
- [Expo YouTube Channel](https://www.youtube.com/c/expo-io)
- [William Candillon YouTube](https://www.youtube.com/c/wcandillon)

---

## 🆘 Getting Help

### Troubleshooting Steps

1. Check this guide's Common Issues section
2. Search [Expo Forums](https://forums.expo.dev)
3. Check [GitHub Issues](https://github.com/expo/expo/issues)
4. Ask on [Stack Overflow](https://stackoverflow.com) with tags: `react-native`, `expo`, `supabase`
5. Contact team lead: vollstek@gmail.com

---

## ✅ Setup Verification Checklist

Before starting development, verify:

**Core Tools:**

- [ ] Node.js 18+ installed
- [ ] Git configured
- [ ] Expo CLI working
- [ ] VS Code with extensions

**iOS (macOS only):**

- [ ] Xcode installed
- [ ] iOS Simulator working
- [ ] CocoaPods installed

**Android:**

- [ ] JDK 17 installed
- [ ] Android Studio configured
- [ ] Android SDK installed
- [ ] Emulator created and working

**Project:**

- [ ] Project created and dependencies installed
- [ ] TypeScript configured
- [ ] Environment variables set
- [ ] Supabase connection working
- [ ] App runs on iOS/Android

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md)
- [Feature Specifications](./FEATURE_SPECIFICATIONS.md)
- [UI Design Specs](./UI_DESIGN_SPECS.md)

---

**Version:** 2.0  
**Last Updated:** October 18, 2025  
**Maintained by:** vollstek@gmail.com

**Recent Updates (v2.0):**

- Added OAuth authentication setup (Google & Apple Sign-In)
- Added profile completion flow implementation
- Added dual payment gateway integration (Stripe & Razorpay)
- Added trial mode & content gating implementation
- Updated environment setup for new features

---

**🎉 Setup Complete! You're ready to build the Jeeva Learning mobile app!**
