# 🦅 WiNGSPAN API Service

A lightweight, stateless Node.js service designed to proxy **Tripwire** intel for offensive operations. It maintains an active session with the Torpedo Delivery Tripwire server and provides a clean JSON API for external hunter tools.

## 🎯 Purpose
To provide a stable, high-performance data feed of current wormhole signatures and system status without requiring every tool to handle complex Tripwire login handshakes or session masks.

## 🚀 Technical Specs
* **Language:** Node.js (ES Modules)
* **Update Frequency:** 2 Minutes (Configurable)
* **Footprint:** < 64MB RAM
* **Endpoint:** `GET /data`

## 🛠️ Installation & Deployment

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
TRIPWIRE_USER=your_username
TRIPWIRE_PASS=your_password
PORT=9090
