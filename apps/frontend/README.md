# Web Scraper Frontend

A modern, responsive React frontend for the Web Scraper v2 application.

## 🚀 Features

- **Modern UI/UX**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Real-time Updates**: Live job status monitoring and updates
- **Recipe Management**: View, create, edit, and validate scraping recipes
- **Job Monitoring**: Track scraping jobs with real-time progress updates
- **Storage Management**: Monitor storage usage and manage data
- **Dark Mode Ready**: Built with modern design principles

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services and utilities
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 3000

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Environment Variables

The frontend is configured to proxy API requests to the backend. In development, it automatically proxies `/api/*` requests to `http://localhost:3000`.

### Vite Configuration

- **Port**: 3001 (different from backend)
- **API Proxy**: Automatically proxies to backend on port 3000
- **Build Output**: `dist/` directory
- **Source Maps**: Enabled for debugging

## 📱 Pages & Features

### 1. Dashboard
- Overview statistics
- Quick actions
- Recent jobs
- System status

### 2. Recipes
- Recipe management
- Search and filtering
- Validation
- Create/edit/delete operations

### 3. Jobs
- Job monitoring
- Real-time status updates
- Progress tracking
- Download results

### 4. Storage
- Storage statistics
- Usage monitoring
- Data management
- Cleanup operations

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions
- **Success**: Green for positive states
- **Warning**: Yellow for caution states
- **Error**: Red for error states
- **Neutral**: Gray scales for text and borders

### Components
- **Buttons**: Primary, secondary, danger, success variants
- **Cards**: Consistent card layouts with shadows
- **Forms**: Styled form inputs with validation
- **Badges**: Status indicators with colors
- **Modals**: Overlay dialogs for actions

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔌 API Integration

### Backend Communication
- RESTful API endpoints
- Automatic error handling
- Request/response interceptors
- Real-time updates via polling

### Key Endpoints
- `/api/recipes/*` - Recipe management
- `/api/scrape/*` - Scraping operations
- `/api/storage/*` - Storage management
- `/health` - Health check

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- **ESLint**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (via Tailwind CSS)

### State Management

Uses Zustand for lightweight state management:
- **Recipes**: Recipe data and loading states
- **Jobs**: Job data and real-time updates
- **UI**: Sidebar state, active tabs, modals

## 🚀 Deployment

### Build Process

1. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Serve static files:**
   The `dist/` directory contains the built application ready for deployment.

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Server**: Nginx, Apache, Express static serving

## 🔒 Security Considerations

- **CORS**: Configured for development and production
- **API Proxy**: Secure communication with backend
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Secure error messages

## 📊 Performance

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Optimized Builds**: Vite optimizations
- **Bundle Analysis**: Build size monitoring

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Update documentation as needed
4. Test on multiple screen sizes
5. Ensure accessibility compliance

## 📝 License

MIT License - see LICENSE file for details.

## 🔗 Related

- [Backend API Documentation](../README.md)
- [Recipe System Documentation](../RECIPE_SYSTEM_IMPLEMENTATION.md)
- [WooCommerce Integration](../README.md#csv-output)
