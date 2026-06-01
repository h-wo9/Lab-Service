import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './Login';
import Dashboard from './Dashboard';
import MyLab from './MyLab';
import Schedule from './Schedule';
import Layout from './Layout';
import Finance from './Finance';
import Stats   from './Stats';
import JoinLab from './JoinLab';
import Fee     from './Fee';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7c3aed',
      light: '#ede9fe',
      dark: '#5b21b6',
    },
    background: {
      default: '#f8f6ff',
    },
  },
  typography: {
    fontFamily: "'Spoqa Han Sans Neo', 'Pretendard', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

function PrivateRoute({ children }) {
  return localStorage.getItem('access_token')
    ? children
    : <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab"       element={<MyLab />} />
            <Route path="/schedule"  element={<Schedule />} />
            <Route path="/finance"   element={<Finance />} />
            <Route path="/stats"    element={<Stats />} />
            <Route path="/join"     element={<JoinLab />} />
            <Route path="/fee"      element={<Fee />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
