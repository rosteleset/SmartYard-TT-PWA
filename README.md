# SmartYard-TT-PWA

This project is a mobile and web application built using **Ionic**, **Vue 3**, **TypeScript**, and **Vite**. It also supports PWA functionality, with **Capacitor** used for integrating with native device features.

### Main Technologies

- **Vue 3** with **TypeScript** for frontend development.
- **Ionic** for building responsive user interfaces.
- **Capacitor** for cross-platform integration with device features.
- **Vite** for fast build times.

### Key Dependencies

- **@ionic/vue** and **@ionic/vue-router** — component library and router for Ionic.
- **pinia** — for state management.
- **vue-i18n** — for internationalization.
- **leaflet** and **vue-leaflet** — for map display.
- **vite-plugin-pwa** — for PWA support.
- **workbox-core** — for PWA caching management.

### npm Scripts

- **`npm run dev`** — run the application in development mode with Vite.
- **`npm run build`** — build the application for production.
- **`npm run preview`** — preview the built project.
- **`npm run lint`** — run ESLint to check the code.

### Installation and Running

1. **Clone the repository:**

   ```bash
   git clone <URL to your repository>
   cd tt
   ```

2. **Install dependencies:**

   Make sure you have Node.js installed (the recommended version is specified in `.nvmrc`, if present).

   ```bash
   npm install
   ```

3. **Run the project in development mode:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview the built project:**

   ```bash
   npm run preview
   ```

### Capacitor Configuration

The following configuration is set in the `capacitor.config.ts` file:

- **appId**: `com.rosteleset.tt` — the application identifier.
- **appName**: `tt` — the name of the application.
- **webDir**: `dist` — the directory where Vite builds the production project.

Capacitor is used to interact with native device features, such as the camera, status bar, keyboard, and more.

### Vite Configuration

The `vite.config.ts` file includes:

- **Plugins**: uses `@vitejs/plugin-legacy` for compatibility with older browsers and `vite-plugin-pwa` for PWA support.
- **Environment Variables**: settings are loaded using `loadEnv`, allowing the use of `.env` files for different configurations based on the environment.

### Directory Structure

- **src/** — the main application directory containing all components, pages, and logic.
- **public/** — static files that are directly accessible, such as images and icons.
- **resources/** — additional resources for the project, such as icons and splash screens for mobile applications.
- **tests/** — folder containing tests for components and functionality.
- **node_modules/** — installed dependencies.
- **dev-dist/** — intermediate build created by Vite in development mode.

### Environment Variables

The project configuration uses environment variables stored in the `.env` file. The following variables are defined in this file:

- **VITE_BASE_PATH**: The base path used as a prefix for all routes.
- **VITE_SERVER_URL**: The server URL for making API requests.
- **VITE_TILE_SERVER**: The tile server URL.
- **VITE_CRS**: Coordinate Reference System.
- **VITE_DEFAULT_LOCALE**: The default language for the application.

To configure the environment variables for your project, follow these steps:

Copy the `default.env` file and rename it to `.env` using the following command:

```bash
cp default.env .env
```

On Windows, the command will be:

```cmd
copy default.env .env
```

Fill in the environment variables in the `.env` file with values appropriate for your development environment.

### License

This project is licensed under *

### Additional Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Vue 3 Documentation](https://v3.vuejs.org/)