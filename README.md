# MistriG

MistriG is a web platform that connects skilled workers like plumbers, electricians, and carpenters with clients who need their services.

## Features

- **User Authentication**: Separate login systems for workers and clients
- **Service Discovery**: Find skilled workers based on your location
- **Interactive Map**: View workers near you with a dynamic radar visualization
- **Service Categories**: Filter workers by different service categories
- **Profile Management**: Create and manage your profile as a worker or client

## Technologies Used

- Node.js
- Express.js
- HTML/CSS/JavaScript
- Leaflet.js for maps
- Local storage for authentication

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   node server.js
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `views/`: Contains all HTML files and frontend assets
  - `index.html`: Homepage
  - `src/pages/`: Login, registration, and feature pages
  - `src/style.css`: Global styling
- `server.js`: Express server setup and API endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details. 