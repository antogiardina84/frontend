// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Configurazione Day.js corretta
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Layout components
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import ConfigurazionePage from './pages/Configurazione/ConfigurazionePage';
import IngressiPage from './pages/Ingressi/IngressiPage';
import LavorazioniPage from './pages/Lavorazioni/LavorazioniPage';
import UscitePage from './pages/Uscite/UscitePage';
import AnalisiPage from './pages/Analisi/AnalisiPage';
import FatturazionePage from './pages/Fatturazione/FatturazionePage';
import CostiPage from './pages/Costi/CostiPage';
import GiacenzePage from './pages/Giacenze/GiacenzePage';
import ReportPage from './pages/Report/ReportPage';

// Context providers
import { NotificheProvider } from './contexts/NotificheContext';

// Carica plugin Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Imposta locale italiano
dayjs.locale('it');

// Tema Material-UI personalizzato
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider 
        dateAdapter={AdapterDayjs} 
        adapterLocale="it"
      >
        <CssBaseline />
        <NotificheProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="configurazione" element={<ConfigurazionePage />} />
                <Route path="ingressi" element={<IngressiPage />} />
                <Route path="lavorazioni" element={<LavorazioniPage />} />
                <Route path="uscite" element={<UscitePage />} />
                <Route path="analisi" element={<AnalisiPage />} />
                <Route path="fatturazione" element={<FatturazionePage />} />
                <Route path="costi" element={<CostiPage />} />
                <Route path="giacenze" element={<GiacenzePage />} />
                <Route path="report" element={<ReportPage />} />
              </Route>
            </Routes>
          </Router>
        </NotificheProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;