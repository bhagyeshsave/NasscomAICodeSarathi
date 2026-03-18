# Omni-Calculator (All-in-One Premium Tools)

A premium, responsive, and adaptive Web Application built with React, TypeScript, Vite, and Tailwind CSS v4.
Designed intelligently for Mobile, Tablet, Desktop, and Ultra-wide screens.

## 🚀 Features

- **Standard & Scientific Calculator**: Built-in math parsing logic with live calculation histories and syntax protections (prevents broken double-operator queries). Includes complex evaluation like logarithms and trigonometry.
- **Live Currency Converter**: Fetches global real-time exchange rates securely and elegantly filters them to map directly to recognized countries & world currencies.
- **Advanced Unit Converter**: Contains 9 major conversion metrics seamlessly managed: Length, Area, Weight, Temperature, Volume, Speed, Time, Data Storage, Energy. 
- **Finance Suite**: Handles detailed financial queries with dynamic currency formatting. Calculate Monthly EMIs, Mortgages (with down payments), Simple & Compound Interest (with configurable frequencies).
- **Responsive Dark/Light Theme**: A meticulously designed fluid glassmorphism interface that dynamically shifts cleanly between light and dark OS preferences.

## ⚙️ Setup Instructions

This project is configured using **Vite**.

1. **Prerequisites**: Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
2. **Installation**: Navigate recursively to the `omni-calculator` directory via terminal, then install its Node dependencies.
   ```bash
   cd omni-calculator
   npm install
   ```

3. **Running the Application Locally**: Start up the local Vite development server. Automatic hot-reloading is configured by default.
   ```bash
   npm run dev
   ```

4. **Production Build**: Generate optimized, production static files in the `/dist` directory.
   ```bash
   npm run build
   ```

## 📐 Technology Engine
- **Framework**: `React + TS`
- **Compiler**: `Vite`
- **Engine Math**: `mathjs`
- **Design Toolkit**: `@tailwindcss/vite` (Tailwind CSS v4)
- **Animations**: `framer-motion`
- **Icons**: `lucide-react`
