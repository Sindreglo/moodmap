# MoodMap

A Next.js application that allows users to track and visualize moods around the world on an interactive map.

![MoodMap Preview](https://github.com/user-attachments/assets/7a2dde41-25f2-4532-997a-4a730e67c363)

## Features

- 🗺️ Interactive world map powered by Mapbox GL JS
- 😊 5-level mood selection (Very Bad to Very Good)
- 📍 Visual mood markers with color-coded dots on the map
- 🎨 Clean, minimal UI with SCSS styling
- 💾 Client-side state management (no backend required)
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Mapbox access token (get one free at [mapbox.com](https://www.mapbox.com/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sindreglo/moodmap.git
cd moodmap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Mapbox token:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Mapbox access token:
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### Running the Application

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Production build:
```bash
npm run build
npm start
```

## How to Use

1. Click the **"+ Add Your Mood"** button in the top-right corner
2. Select your current mood from 1 (Very Bad) to 5 (Very Good)
3. Click **"Submit Mood"** to add it to the map
4. View all submitted moods as colored dots on the world map
5. Click on any mood marker to see details (mood level and timestamp)

## Mood Colors

- 😢 Very Bad (1) - Red
- 😕 Bad (2) - Orange
- 😐 Neutral (3) - Yellow
- 🙂 Good (4) - Green
- 😄 Very Good (5) - Dark Green

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: SCSS (CSS Modules)
- **Mapping**: Mapbox GL JS
- **State Management**: React useState (local state)

## Project Structure

```
moodmap/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   ├── page.module.scss    # Page styles
│   └── globals.scss        # Global styles
├── components/
│   ├── Map.tsx             # Map component with Mapbox
│   ├── Map.module.scss     # Map styles
│   ├── MoodModal.tsx       # Mood selection modal
│   └── MoodModal.module.scss # Modal styles
├── .env.example            # Environment variable template
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## Screenshots

### Main Interface
![Main Interface](https://github.com/user-attachments/assets/7a2dde41-25f2-4532-997a-4a730e67c363)

### Mood Selection Modal
![Mood Selection](https://github.com/user-attachments/assets/be65fe74-bc91-4827-adc7-952a59706171)

### Selected Mood
![Selected Mood](https://github.com/user-attachments/assets/4a929ee8-67f6-4857-9177-9ba9febe8616)

### Mood on Map
![Mood on Map](https://github.com/user-attachments/assets/7861d646-a33c-443f-b65f-3cff79eea8f0)

### Mood Popup
![Mood Popup](https://github.com/user-attachments/assets/46074589-bb8d-4949-b815-3d622d401ca9)

## License

ISC