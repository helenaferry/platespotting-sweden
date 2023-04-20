import "../styles/tailwind.css";
import type { AppProps } from "next/app";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useState } from "react";
import { Provider } from "react-redux";
import store from "./../store/store";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "leaflet/dist/leaflet.css";
import "node_modules/leaflet-geosearch/dist/geosearch.css";

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  let theme = createTheme({
    typography: {
      h1: {
        fontSize: 36,
        fontWeight: "bold",
        paddingTop: 56,
      },
      h2: {
        fontSize: 24,
      },
    },
    palette: {
      primary: {
        main: "#0471A6",
      },
    },
  });
  theme = responsiveFontSizes(theme);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeProvider theme={theme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </LocalizationProvider>
      </Provider>
    </SessionContextProvider>
  );
}

export default MyApp;
