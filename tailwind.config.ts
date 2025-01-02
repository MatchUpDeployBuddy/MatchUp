import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(81, 89%, 61%)", // #BBF246
          foreground: "hsl(200, 20%, 12%)", // #192126
          "50": "hsl(81, 89%, 95%)",
          "100": "hsl(81, 89%, 90%)",
          "200": "hsl(81, 89%, 80%)",
          "300": "hsl(81, 89%, 70%)",
          "400": "hsl(81, 89%, 61%)", // #BBF246
          "500": "hsl(81, 89%, 55%)",
          "600": "hsl(81, 89%, 49%)",
          "700": "hsl(81, 89%, 43%)",
          "800": "hsl(81, 89%, 37%)",
          "900": "hsl(81, 89%, 31%)",
        },
        secondary: {
          DEFAULT: "hsl(104, 35%, 60%)", // #89C66D
          foreground: "hsl(0, 0%, 0%)", // #000000
          "50": "hsl(104, 35%, 95%)",
          "100": "hsl(104, 35%, 90%)",
          "200": "hsl(104, 35%, 80%)",
          "300": "hsl(104, 35%, 70%)",
          "400": "hsl(104, 35%, 60%)", // #89C66D
          "500": "hsl(104, 35%, 50%)",
          "600": "hsl(104, 35%, 40%)",
          "700": "hsl(104, 35%, 30%)",
          "800": "hsl(104, 35%, 20%)",
          "900": "hsl(104, 35%, 10%)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        text: {
          primary: "hsl(200, 20%, 12%)", // #192126
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
