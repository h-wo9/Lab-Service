import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Avatar,
} from '@mui/material';
import DashboardIcon           from '@mui/icons-material/Dashboard';
import GroupsIcon              from '@mui/icons-material/Groups';
import EventNoteIcon           from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon                from '@mui/icons-material/Paid';
import BarChartIcon            from '@mui/icons-material/BarChart';
import LogoutIcon              from '@mui/icons-material/Logout';

const W = 260;

const NAV = [
  { text: '대시보드',   icon: <DashboardIcon />,            path: '/dashboard' },
  { text: '랩실 관리',  icon: <GroupsIcon />,               path: '/lab' },
  { text: '일정',       icon: <EventNoteIcon />,            path: '/schedule' },
  { text: '장부 관리',  icon: <AccountBalanceWalletIcon />, path: '/finance' },
  { text: '회비 관리',  icon: <PaidIcon />,                 path: '/fee' },
  { text: '통계 분석',  icon: <BarChartIcon />,             path: '/stats' },
];

export default function Layout() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const userName  = localStorage.getItem('user_name') || '사용자';
  const userRole  = localStorage.getItem('user_role') || 'student';
  const initial   = userName.charAt(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>

      {/* ── 사이드바 ── */}
      <Drawer
        variant="permanent"
        sx={{
          width: W,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: W,
            border: 'none',
            background: '#150e35',
            boxShadow: '4px 0 32px rgba(0,0,0,0.28)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* 로고 */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124,58,237,0.55)',
              flexShrink: 0,
            }}>
              <Typography fontWeight="bold" color="white" sx={{ fontSize: '1rem' }}>L</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                랩실 관리 시스템
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.65rem' }}>
                Lab Management
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 유저 카드 */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{
            p: 1.8, borderRadius: 2.5,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.09)',
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Avatar sx={{
              width: 38, height: 38, fontSize: '0.95rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
              boxShadow: '0 2px 10px rgba(124,58,237,0.5)',
            }}>
              {initial}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }} noWrap>
                {userName}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.7rem' }}>
                {userRole === 'leader' ? '⭐ 랩장' : '랩원'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 구분선 */}
        <Box sx={{ height: '1px', mx: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.07)' }} />

        {/* 메뉴 */}
        <List sx={{ px: 1.5 }}>
          {NAV.map(({ text, icon, path }) => {
            const active = location.pathname === path;
            return (
              <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(path)}
                  sx={{
                    borderRadius: 2, py: 1.15,
                    borderLeft: active ? '3px solid #a78bfa' : '3px solid transparent',
                    bgcolor: active ? 'rgba(124,58,237,0.28)' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.52)',
                    transition: 'all 0.18s ease',
                    '& .MuiListItemIcon-root': {
                      color: active ? '#c4b5fd' : 'rgba(255,255,255,0.38)',
                      minWidth: 38,
                      transition: 'color 0.18s ease',
                    },
                    '&:hover': {
                      bgcolor: active ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.07)',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'rgba(196,181,253,0.9)' },
                    },
                  }}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
                  />
                  {active && (
                    <Box sx={{
                      width: 6, height: 6, borderRadius: '50%',
                      bgcolor: '#c4b5fd',
                      boxShadow: '0 0 8px #c4b5fd',
                    }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* 메뉴와 로그아웃 사이 투명 공백 (spacer) */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 로그아웃 */}
        <Box sx={{ p: 2, pt: 0 }}>
          <Box sx={{ height: '1px', mb: 2, bgcolor: 'rgba(255,255,255,0.07)' }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2, py: 1.1,
              color: 'rgba(255,255,255,0.45)',
              transition: 'all 0.18s ease',
              '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.35)', minWidth: 38 },
              '&:hover': {
                bgcolor: 'rgba(239,68,68,0.15)',
                color: '#fca5a5',
                '& .MuiListItemIcon-root': { color: '#f87171' },
              },
            }}
          >
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="로그아웃" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* ── 메인 콘텐츠 ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: '#f8f6ff',
          backgroundImage: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.07) 0%, transparent 55%)',
          p: 3,
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
