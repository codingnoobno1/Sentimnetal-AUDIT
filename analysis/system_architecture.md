# Analysis: Single-Node Forensic Architecture

This document outlines the interconnected layers of the Sentimnetal AUDIT system, detailing how the mobile, web, and backend components synchronize for full-spectrum AI auditing.

## 🌉 The Synchronized Bridge
The system operates as a **Triad Distributed Node**:
1.  **Station (Laptop)**: Runs the local LLMs (Mistral, Phi) and handles heavy weight-layer compute.
2.  **Sentinel (Express @ 3020)**: Acts as the "Forensic Judge". Uses Gemini/Mistral Cloud APIs to audit the local model's output.
3.  **Command (Flutter Mobile)**: Provides the premium remote interface to trigger audits and visualize the forensic trace.

## 📡 Backend Specifications
-   **FastAPI (Laptop - 5000)**: Manages local model storage, hardware monitoring, and raw inference.
-   **Express.js (Judge - 3020)**: Executes the `7+4` scoring logic.
    -   `POST /evaluate`: The primary forensic endpoint.
    -   `POST /compare`: Strategic battle endpoint for two models.

## 🗄️ Forensic Data Flow
1.  **Trigger**: User sends a prompt from Flutter.
2.  **Inference**: Laptop (5000) generates an answer using a local model.
3.  **Judge**: The answer is sent to Express (3020). 
4.  **Analysis**: Express uses Gemini to score the answer across 11 dimensions.
5.  **Visualization**: Flutter renders Radar Charts and forensic bars based on the JSON response.
