#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define color codes for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================================${NC}"
echo -e "${BLUE}    Study & Productivity Tracker - Android APK & Capacitor Setup ${NC}"
echo -e "${BLUE}=================================================================${NC}"

# 1. Build the web app
echo -e "\n${YELLOW}[1/4] Compiling the web application (Vite production build)...${NC}"
npm run build

# 2. Check if android platform is already added
if [ ! -d "android" ]; then
    echo -e "\n${YELLOW}[2/4] Adding the Android platform wrapper...${NC}"
    npx cap add android
else
    echo -e "\n${YELLOW}[2/4] Android platform wrapper already exists. Skipping 'add'...${NC}"
fi

# 3. Sync assets to android platform
echo -e "\n${YELLOW}[3/4] Syncing web assets and plugins to Android project...${NC}"
npx cap sync android

# 4. Success message and guidance
echo -e "\n${GREEN}=================================================================${NC}"
echo -e "${GREEN}✨ Capacitor and PWA setup completed successfully! ✨${NC}"
echo -e "${GREEN}=================================================================${NC}"
echo -e "\n${YELLOW}To compile this project into a native Android APK:${NC}"
echo -e "  1. Open the Android project in Android Studio:"
echo -e "     ${BLUE}npx cap open android${NC}"
echo -e "  2. Run the application on a connected device or emulator directly:"
echo -e "     ${BLUE}npx cap run android${NC}"
echo -e "  3. To build a debug APK in Android Studio, go to:"
echo -e "     ${BLUE}Build -> Build Bundle(s) / APK(s) -> Build APK(s)${NC}"
echo -e "     The APK will be generated under: ${BLUE}android/app/build/outputs/apk/debug/app-debug.apk${NC}"
echo -e "  4. To build a production-ready signed APK/AAB for Google Play, go to:"
echo -e "     ${BLUE}Build -> Generate Signed Bundle / APK...${NC}"
echo -e "\n${YELLOW}Tip:${NC} Every time you make updates to the web code, rebuild and sync with:"
echo -e "     ${BLUE}npm run build && npx cap sync${NC}\n"
