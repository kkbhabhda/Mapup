const express = require('express');
const bodyParser = require('body-parser');
const turf = require('@turf/turf');

const app = express();
const PORT = 3000;
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with your actual authentication token

// Middleware
app.use(bodyParser.json());

// Header-based authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Linestring validation function
const isValidLinestring = (linestring) => {
  return (
    linestring &&
    linestring.type === 'LineString' &&
    Array.isArray(linestring.coordinates) &&
    linestring.coordinates.length >= 2
  );
};

// POST /intersections endpoint
app.post('/intersections', (req, res) => {
  // Validation and error handling for linestring
  const linestring = req.body.linestring;
  if (!isValidLinestring(linestring)) {
    return res.status(400).json({ error: 'Invalid linestring' });
  }

  // Sample data of lines
  const lineData = require('./lines.json');
  console.log(lineData)

  // Finding intersections
  const intersectingLines = [];
  for (let i = 0; i < lineData.length; i++) {
    const lineString = lineData[i].linestring;
    console.log(linestring)
    const intersects = turf.lineIntersect(linestring, lineString);
    if (intersects.features.length > 0) {
      intersects.features.forEach((feature) => {
        const intersectionPoint = feature.geometry.coordinates;
        intersectingLines.push({
          lineIndex: i,
          intersectionPoint: intersectionPoint,
        });
      });
    }
  }

  // Returning intersections or empty array
  if (intersectingLines.length === 0) {
    res.json({ message: 'No intersections found', intersections: [] });
  } else {
    res.json({ message: 'Intersections found', intersections: intersectingLines });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
