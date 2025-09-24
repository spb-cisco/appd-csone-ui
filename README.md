# AppDynamics Sentinel - CS1 UI

A modern React-based monitoring dashboard for AppDynamics Sentinel CS1 environment.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠 Technology Stack

- **Frontend Framework**: React 17.0.2
- **Build Tool**: Vite 7.x
- **Language**: TypeScript
- **UI Components**: @magnetic/button (Cisco's design system)
- **Styling**: CSS3
- **Linting**: ESLint

## 📁 Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── main.tsx         # Application entry point
├── index.css        # Global styles
└── vite-env.d.ts    # Vite type definitions
```

## 🎨 Design Guidelines

- Clean, modern interface optimized for monitoring dashboards
- Responsive design for various screen sizes
- Consistent with Cisco's design language via @magnetic components
- Performance-focused with real-time data visualization capabilities

## 🚀 Ready to Design!

Your clean slate is ready. Start building your monitoring dashboard components in the `src/` directory.

## 📝 Development Notes

- React 17 is used for compatibility with @magnetic/button
- All custom components have been removed for a fresh start
- Development server runs on http://localhost:5173
- Hot module replacement (HMR) is enabled for fast development