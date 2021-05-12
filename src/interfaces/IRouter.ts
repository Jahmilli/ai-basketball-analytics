import { Router } from "express";

// For any routing related classes to implement
export interface IRouter {
  setupRoutes: () => Router;
  getRouter: () => Router;
  getPrefix: () => string;
}
