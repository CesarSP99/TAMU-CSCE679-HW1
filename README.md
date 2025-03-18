# 679 - Coding Assignment 1

This project visualizes temperature data using **D3.js**, built with **Vite**.

## 🌐 Live Demo

The project is deployed and can be accessed [cloud.cesarsp.com:13000](cloud.cesarsp.com:13000)

## 🚀 Getting Started

### **1️⃣ Install Dependencies**

Make sure you have **Node.js** installed, then run:

```sh
npm install
```

### **2️⃣ Start Development Server**

To start the Vite development server:

```sh
npm run dev
```

This will run the project and provide a local URL (e.g., `http://localhost:5173/`).

---

## 📦 **Dockerizing the Project**

To build and run this project inside a **Docker container**, follow these steps:

### **1️⃣ Build Docker Image**

```sh
docker build -t 679-hw-1 .
```

### **2️⃣ Run the Container**

```sh
docker run -d -p 8080:80 --name hw-1 679-hw-1
```

Now, the app will be accessible at:\
[**http://localhost:8080**](http://localhost:8080)
