import express from 'express';
import cors from 'cors';

import { S3Route } from "routes";

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setConfiguration();
    this.setRoutes();
  }

  setConfiguration() {
    this.express.use(cors())
    this.express.use(express.json({ limit: "50mb" }));
    this.express.use(express.urlencoded({ limit: "50mb", extended: true }));
  }

  setRoutes() {
    this.express.use('/', S3Route)
  }
}

export default new App().express