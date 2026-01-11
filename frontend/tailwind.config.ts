import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#101113",
                card: "#1c1d20",
                toss: {
                    blue: "#3182f6",
                    red: "#f04452",
                },
                gray: {
                    100: "#f2f4f6",
                    200: "#e5e8eb",
                    300: "#d1d6db",
                    400: "#b0b8c1",
                    500: "#8b95a1",
                    600: "#6b7684",
                    700: "#4e5968",
                    800: "#333d4b",
                    900: "#191f28",
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
