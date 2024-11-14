const swaggerUi = require("swagger-ui-express");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./dbConn"); 
const YAML = require('yamljs');
const app = express();

const appRoutes = require("./Routes/appRoutes.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));


const swaggerDocument = YAML.load('./swagger.yaml'); 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

dotenv.config();

// Call the connectDB function to connect to the database
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("App running at: http://localhost:3000/");
    });
  })
  .catch((err) => {
    console.error("Failed to start the server:", err.message);
  });

app.get(["/","/ping"], async (req, res) => {
  res.json({ status: "Server Active" });
});

app.use("/api", appRoutes);
