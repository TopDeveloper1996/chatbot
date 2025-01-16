import type { Config } from "tailwindcss";

// Default are on https://tailwindcss.nuxtjs.org/tailwind/config#default-configuration
export default <Partial<Config>>{
    theme: {
        extend: {
            colors: {
                accent: "#1AA1E0",
                background: "#13192F",
                surface: "#1E2742",
                surface_variant: "#1E2742",
                outline: "#475569",
                text: "#D2D2D2",
                passive: "rgba(var(--passive-invoices-color))",
                active: "rgba(var(--active-invoices-color))",
            },
        },
    },
    plugins: [],
    content: [],
};
