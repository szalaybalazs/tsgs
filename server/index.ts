import express from "express";
import postgres from "postgres";
import cors from "cors";

const PORT = process.env.PORT || 4000;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = postgres(process.env.DATABASE_URL); // will use psql environment variables

// import bodyParser from 'body-parser';

const app = express();
app.use(cors());

// app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const rows = await sql`SELECT NOW()`;
  res.send(`Hello World!\n\nServer time: ${rows[0].now}`);
});

app.get("/api/areas", async (req, res) => {
  const rows =
    await sql`SELECT *, ST_AsGeoJSON(ST_ForceRHR(ST_Transform(ST_GeomFromEWKB(geom), 4326)))::json as geometry FROM won`;

  const features = rows.map(({ geom, geometry, ...area }) => {
    geom;
    return {
      type: "Feature",
      properties: {
        ...area,
      },
      geometry: geometry,
    };
  });

  const geoJSON = {
    type: "FeatureCollection",
    features: features,
  };

  res.json(geoJSON);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
