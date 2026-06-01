import { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Button, List, ListItem,
  ListItemText, Divider, Chip, CircularProgress,
} from '@mui/material';
import EventIcon               from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon              from '@mui/icons-material/Groups';
import TrendingUpIcon          from '@mui/icons-material/TrendingUp';
import TrendingDownIcon        from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from './api';

/* 카운트업 훅 */
function useCountUp(target) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    if (!target) return;
    let cur = 0;
    const step = target / 48;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.floor(cur));
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

/* 호버 리프트 공통 스타일 */
const lift = {
  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 40px rgba(109,40,217,0.16)',
  },
};

/* 통계 카드 */
function StatCard({ icon, label, rawValue, suffix = '', gradient, loading }) {
  const abs = useCountUp(loading ? 0 : Math.abs(rawValue));
  const isNeg = rawValue < 0;

  return (
    <Paper elevation={0} sx={{
      p: 3.5, borderRadius: 4,
      ...(gradient
        ? { background: gradient, color: 'white' }
        : { bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)' }),
      boxShadow: '0 2px 14px rgba(109,40,217,0.07)',
      ...lift,
    }}>
      <Box sx={{
        display: 'inline-flex', p: 1.2, borderRadius: 2.5, mb: 2.5,
        bgcolor: gradient ? 'rgba(255,255,255,0.18)' : 'rgba(124,58,237,0.1)',
      }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ opacity: gradient ? 0.78 : 0.6, fontWeight: 500, mb: 0.5 }}>
        {label}
      </Typography>
      {loading
        ? <Box sx={{ height: 48, display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={22} sx={{ color: gradient ? 'white' : 'primary.main' }} />
          </Box>
        : <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1 }}>
            {isNeg ? '-' : ''}{abs.toLocaleString()}{suffix}
          </Typography>
      }
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || '사용자';
  const labId    = localStorage.getItem('lab_id');

  const [schedules,    setSchedules]    = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [memberCount,  setMemberCount]  = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!labId) { setLoading(false); return; }
    Promise.all([
      api.get(`/labs/${labId}/schedules`),
      api.get(`/labs/${labId}/finances`),
      api.get('/labs/my-lab'),
    ]).then(([s, f, l]) => {
      setSchedules(s.data);
      setTransactions(f.data);
      setMemberCount(l.data.members?.length ?? 0);
    }).catch(err => console.error('대시보드 로딩 실패:', err))
      .finally(() => setLoading(false));
  }, [labId]);

  const today   = dayjs().format('YYYY-MM-DD');
  const balance = transactions.reduce((a, t) => t.type === 'income' ? a + t.amount : a - t.amount, 0);
  const upcoming = schedules.filter(s => s.date >= today).slice(0, 5);
  const recent   = transactions.slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '좋은 아침이에요';
    if (h < 18) return '반갑습니다';
    return '안녕하세요';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b', mb: 0.5 }}>
          {greeting()}, {userName}님 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dayjs().format('YYYY년 MM월 DD일')} · 랩실 현황을 한눈에 확인하세요.
        </Typography>
      </Box>

      {!labId ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔬</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>아직 소속된 랩실이 없어요</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>랩실을 새로 개설하거나 기존 랩실에 가입 신청을 해보세요!</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/join')} sx={{ px: 4 }}>
            랩실 개설 / 가입 신청하기
          </Button>
        </Paper>
      ) : (
        <>
          {/* 통계 카드 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>
            <StatCard
              icon={<AccountBalanceWalletIcon sx={{ color: 'white', fontSize: 22 }} />}
              label="랩실 공금 잔액"
              rawValue={balance}
              suffix=" 원"
              gradient="linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)"
              loading={loading}
            />
            <StatCard
              icon={<GroupsIcon sx={{ color: '#7c3aed', fontSize: 22 }} />}
              label="랩실 인원"
              rawValue={memberCount}
              suffix=" 명"
              loading={loading}
            />
            <StatCard
              icon={<EventIcon sx={{ color: '#7c3aed', fontSize: 22 }} />}
              label="오늘 일정"
              rawValue={schedules.filter(s => s.date === today).length}
              suffix=" 개"
              loading={loading}
            />
          </Box>

          {/* 하단 2분할 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>

            {/* 다가오는 일정 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 14px rgba(109,40,217,0.06)', ...lift }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b' }}>다가오는 일정</Typography>
                <Chip label={`${upcoming.length}건`} size="small" sx={{ bgcolor: '#ede9fe', color: '#7c3aed' }} />
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(109,40,217,0.06)' }} />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
              ) : upcoming.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '2.2rem', mb: 1 }}>📭</Typography>
                  <Typography variant="body2" color="text.secondary">등록된 일정이 없습니다.</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {upcoming.map((s, i) => {
                    const isToday = s.date === today;
                    return (
                      <ListItem key={s.schedule_id} sx={{ px: 0, py: 1.2, animation: `fadeInUp 0.3s ease ${i * 0.06 + 0.1}s both` }}>
                        <Box sx={{
                          width: 44, height: 44, borderRadius: 2.5, mr: 2, flexShrink: 0,
                          bgcolor: isToday ? '#7c3aed' : '#ede9fe',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Typography sx={{ color: isToday ? 'white' : '#7c3aed', fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.3 }}>
                            {dayjs(s.date).format('MM')}월
                          </Typography>
                          <Typography sx={{ color: isToday ? 'white' : '#7c3aed', fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>
                            {dayjs(s.date).format('DD')}
                          </Typography>
                        </Box>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600} sx={{ color: '#1e1b4b' }}>{s.title}</Typography>}
                        />
                        {isToday && <Chip label="오늘" size="small" sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontSize: '0.7rem' }} />}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Paper>

            {/* 최근 장부 */}
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 14px rgba(109,40,217,0.06)', ...lift }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b' }}>최근 장부 내역</Typography>
                <Chip label={`${transactions.length}건`} size="small" sx={{ bgcolor: '#ede9fe', color: '#7c3aed' }} />
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(109,40,217,0.06)' }} />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
              ) : recent.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '2.2rem', mb: 1 }}>📂</Typography>
                  <Typography variant="body2" color="text.secondary">등록된 내역이 없습니다.</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {recent.map((tx, i) => (
                    <ListItem key={tx.finance_id} sx={{ px: 0, py: 1.2, animation: `fadeInUp 0.3s ease ${i * 0.06 + 0.1}s both` }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 2, mr: 2, flexShrink: 0,
                        bgcolor: tx.type === 'income' ? '#dcfce7' : '#fee2e2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {tx.type === 'income'
                          ? <TrendingUpIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                          : <TrendingDownIcon sx={{ fontSize: 18, color: '#dc2626' }} />}
                      </Box>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={600} sx={{ color: '#1e1b4b' }} noWrap>{tx.description || '내역 없음'}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{String(tx.record_date)}</Typography>}
                      />
                      <Typography variant="body2" fontWeight={700} color={tx.type === 'income' ? '#16a34a' : '#dc2626'} sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}원
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>

          </Box>
        </>
      )}
    </Box>
  );
}
