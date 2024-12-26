import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProviderComponent from "@/hooks/QueryProvider";
import { ThemeProvider } from "@/hooks/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your digital knowledge base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <QueryProviderComponent>
        <body className={`${inter.className} `}>
          <ThemeProvider attribute="class" defaultTheme="" enableSystem>
            {children}{" "}
          </ThemeProvider>
        </body>
      </QueryProviderComponent>

      <script
        async
        src="https://telegram.org/js/telegram-widget.js?15"
        data-telegram-post="channel_name/post_id"
        data-width="100%"
      ></script>
    </html>
  );
}
