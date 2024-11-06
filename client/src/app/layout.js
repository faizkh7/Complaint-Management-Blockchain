"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { store } from "@/app/store";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Worker } from "@react-pdf-viewer/core";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="night">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Provider store={store}>
          <body className={inter.className}>
            <ToastContainer />
            <Navbar />
            {children}
            <Footer />
          </body>
        </Provider>
      </Worker>
    </html>
  );
}
