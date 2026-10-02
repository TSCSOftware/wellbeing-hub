"use strict";


const express = require("express");
const path = require("path");

// Load environment variables from .env when available.
require("dotenv").config({
  path: path.resolve(process.cwd(), ".env"),
});

const sendPush = require("./send-push");

const app = express();
const HOST = "0.0.0.0";
const PORT = 3030;

// Trust the first reverse proxy when deployed behind Nginx, Apache,
// Cloudflare, Render, Railway, or a similar hosting platform.
app.set("trust proxy", 1);

// Parse application/json request bodies.
app.use(
  express.json({
    limit: "100kb",
  })
);

// Return a clear error when malformed JSON is submitted.
app.use(function handleInvalidJson(error, req, res, next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      error: "The request body contains invalid JSON.",
    });
  }

  return next(error);
});

// Basic health-check endpoint.
app.get("/health", function healthCheck(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "firebase-push-server",
  });
});

// Firebase push-notification endpoint.
// The same handler processes OPTIONS requests for CORS preflight.
app.options("/api/send-push", sendPush);
app.post("/api/send-push", sendPush);

// Return JSON for unknown routes.
app.use(function notFound(req, res) {
  return res.status(404).json({
    error: "Route not found.",
  });
});

// Handle unexpected Express errors without exposing stack traces.
app.use(function errorHandler(error, req, res, next) {
  console.error("Unhandled server error", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: "Internal server error.",
  });
});

const server = app.listen(PORT, HOST, function onServerStarted() {
  console.log("Server running at http://" + HOST + ":" + PORT);
  console.log("Health check: http://" + HOST + ":" + PORT + "/health");
  console.log("Push endpoint: POST http://" + HOST + ":" + PORT + "/api/send-push");
});

// Shut down cleanly when the process receives a termination signal.
function shutdown(signal) {
  console.log(signal + " received. Closing HTTP server...");

  server.close(function onServerClosed(error) {
    if (error) {
      console.error("Failed to close HTTP server", error);
      process.exit(1);
    }

    console.log("HTTP server closed.");
    process.exit(0);
  });

  // Force shutdown if active connections do not close within 10 seconds.
  setTimeout(function forceShutdown() {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", function onSigterm() {
  shutdown("SIGTERM");
});

process.on("SIGINT", function onSigint() {
  shutdown("SIGINT");
});

module.exports = app;
