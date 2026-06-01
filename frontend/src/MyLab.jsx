import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, Chip, CircularProgress, Divider,
  Tabs, Tab, Button,
} from '@mui/material';
import GroupIcon      from '@mui/icons-material/Group';
import StarIcon       from '@mui/icons-material/Star';
import PersonIcon     from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon     from '@mui/icons-material/Cancel';
import HourglassIcon  from '@mui/icons-material/HourglassEmpty';
import api from './api';

const AVATAR_COLORS = [
  'linear-gradient(135deg,#7c3aed,#a855f7)',
  'linear-gradient(135deg,#db2777,#ec4899)',
  'linear-gradient(135deg,#0891b2,#22d3ee)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#dc2626,#f87171)',
];
const avatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const STATUS_MAP = {
  pending:  { label: '대기 중',  color: '#d97706', bg: '#fef3c7', icon: <HourglassIcon  sx={{ fontSize: 14 }} /> },
  approved: { label: '승인됨',   color: '#16a34a', bg: '#dcfce7', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  rejected: { label: '반려됨',   color: '#dc2626', bg: '#fee2e2', icon: <CancelIcon      sx={{ fontSize: 14 }} /> },
};

export default function MyLab() {
  const isLeader = localStorage.getItem('user_role') === 'leader';

  const [labInfo,  setLabInfo]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState(0);  // 0: 멤버, 1: 가입 신청

  /* 가입 신청 목록 */
  const [apps,      setApps]       = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    api.get('/labs/my-lab')
      .then(res => setLabInfo(res.data))
      .catch(err => console.error('랩실 정보 로딩 실패:', err))
      .finally(() => setLoading(false));
  }, []);

  /* 탭 전환 시 가입 신청 목록 로드 */
  useEffect(() => {
    if (tab !== 1 || !labInfo) return;
    setAppsLoading(true);
    api.get(`/labs/${labInfo.lab_id}/applications`)
      .then(res => setApps(res.data))
      .catch(err => console.error('신청 목록 로딩 실패:', err))
      .finally(() => setAppsLoading(false));
  }, [tab, labInfo]);

  /* 승인 / 반려 처리 */
  const handleStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApps(prev => prev.map(a => a.app_id === appId ? { ...a, status } : a));
    } catch (err) {
      alert(err.response?.data?.detail || '처리에 실패했습니다.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress color="primary" /></Box>;
  }

  if (!labInfo) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }} className="page-enter">
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)', maxWidth: 420 }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔬</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>소속된 랩실이 없어요</Typography>
          <Typography variant="body2" color="text.secondary">랩실을 새로 개설하거나 기존 랩실에 가입해 보세요!</Typography>
        </Paper>
      </Box>
    );
  }

  const leader  = labInfo.members.find(m => m.role === 'leader');
  const members = labInfo.members.filter(m => m.role !== 'leader');
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
          My Lab
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b' }}>랩실 관리</Typography>
      </Box>

      {/* 랩실 정보 카드 */}
      <Paper elevation={0} sx={{
        p: 4, borderRadius: 4, mb: 4,
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)',
        color: 'white', boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)', top: -60, right: -40, pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.18)' }}>
              <GroupIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>{labInfo.name}</Typography>
              <Typography sx={{ opacity: 0.75, fontSize: '0.82rem' }}>{labInfo.field}</Typography>
            </Box>
          </Box>
          {labInfo.description && (
            <Typography sx={{ opacity: 0.82, fontSize: '0.9rem', mb: 2.5 }}>{labInfo.description}</Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`총 ${labInfo.members.length}명`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
            <Chip label={labInfo.field} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
          </Box>
        </Box>
      </Paper>

      {/* 탭 (랩장이면 2개, 아니면 탭 없이 바로 멤버 목록) */}
      {isLeader ? (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 3,
              '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' },
              '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#7c3aed,#a855f7)', height: 3, borderRadius: 2 },
            }}
          >
            <Tab label="멤버 목록" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  가입 신청 관리
                  {pendingCount > 0 && (
                    <Chip label={pendingCount} size="small" sx={{ height: 18, fontSize: '0.7rem', bgcolor: '#7c3aed', color: 'white', ml: 0.5 }} />
                  )}
                </Box>
              }
            />
          </Tabs>

          {tab === 0 && <MemberSection leader={leader} members={members} />}
          {tab === 1 && (
            <ApplicationSection
              apps={apps}
              loading={appsLoading}
              onStatus={handleStatus}
            />
          )}
        </>
      ) : (
        <MemberSection leader={leader} members={members} />
      )}

    </Box>
  );
}

/* ── 멤버 목록 섹션 ── */
function MemberSection({ leader, members }) {
  return (
    <>
      {leader && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b', mb: 2 }}>⭐ 랩장</Typography>
          <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 3, mb: 3,
            border: '2px solid rgba(124,58,237,0.2)',
            background: 'rgba(124,58,237,0.03)',
            display: 'flex', alignItems: 'center', gap: 2,
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: '0 8px 24px rgba(124,58,237,0.14)', transform: 'translateY(-2px)' },
          }}>
            <Avatar sx={{ width: 52, height: 52, fontSize: '1.2rem', fontWeight: 700, background: avatarColor(leader.name), boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              {leader.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                <Typography fontWeight={700} sx={{ color: '#1e1b4b' }}>{leader.name}</Typography>
                <Chip label="랩장" size="small" sx={{ bgcolor: '#7c3aed', color: 'white', fontSize: '0.7rem', height: 20 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">{leader.student_id}</Typography>
            </Box>
          </Paper>
        </>
      )}

      {members.length > 0 && (
        <>
          <Divider sx={{ mb: 3, borderColor: 'rgba(109,40,217,0.08)' }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b', mb: 2 }}>
            👥 랩원 ({members.length}명)
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {members.map((m, i) => (
              <Paper key={m.student_id} elevation={0} sx={{
                p: 2.5, borderRadius: 3, bgcolor: 'white',
                border: '1px solid rgba(109,40,217,0.08)',
                boxShadow: '0 2px 8px rgba(109,40,217,0.04)',
                display: 'flex', alignItems: 'center', gap: 1.8,
                transition: 'all 0.2s ease',
                animation: `fadeInUp 0.35s ease ${i * 0.06 + 0.1}s both`,
                '&:hover': { boxShadow: '0 8px 24px rgba(109,40,217,0.12)', transform: 'translateY(-3px)', borderColor: 'rgba(124,58,237,0.2)' },
              }}>
                <Avatar sx={{ width: 44, height: 44, fontSize: '1rem', fontWeight: 700, background: avatarColor(m.name) }}>
                  {m.name.charAt(0)}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography fontWeight={600} sx={{ color: '#1e1b4b', fontSize: '0.9rem' }} noWrap>{m.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.student_id}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </>
      )}
    </>
  );
}

/* ── 가입 신청 관리 섹션 ── */
function ApplicationSection({ apps, loading, onStatus }) {
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>;
  }

  if (apps.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)' }}>
        <Typography sx={{ fontSize: '3rem', mb: 2 }}>📬</Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>접수된 신청서가 없습니다.</Typography>
        <Typography variant="body2" color="text.secondary">가입 신청이 들어오면 여기에 표시됩니다.</Typography>
      </Paper>
    );
  }

  const pending  = apps.filter(a => a.status === 'pending');
  const resolved = apps.filter(a => a.status !== 'pending');

  return (
    <Box>
      {/* 대기 중 신청 */}
      {pending.length > 0 && (
        <>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#d97706', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HourglassIcon sx={{ fontSize: 16 }} /> 대기 중 ({pending.length}건)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {pending.map((app, i) => (
              <AppCard key={app.app_id} app={app} onStatus={onStatus} index={i} />
            ))}
          </Box>
        </>
      )}

      {/* 처리 완료 신청 */}
      {resolved.length > 0 && (
        <>
          <Divider sx={{ mb: 3, borderColor: 'rgba(109,40,217,0.08)' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#6b7280', mb: 2 }}>
            처리 완료 ({resolved.length}건)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {resolved.map((app, i) => (
              <AppCard key={app.app_id} app={app} onStatus={onStatus} index={i} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

/* ── 신청서 카드 ── */
function AppCard({ app, onStatus, index }) {
  const s = STATUS_MAP[app.status] || STATUS_MAP.pending;

  return (
    <Paper elevation={0} sx={{
      p: 3, borderRadius: 3, bgcolor: 'white',
      border: '1px solid rgba(109,40,217,0.08)',
      boxShadow: '0 2px 10px rgba(109,40,217,0.05)',
      animation: `fadeInUp 0.3s ease ${index * 0.06}s both`,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: '0 6px 20px rgba(109,40,217,0.1)' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              {app.student_id.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight={700} sx={{ color: '#1e1b4b', fontSize: '0.95rem' }}>
                {app.student_id}
              </Typography>
              {app.applied_at && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(app.applied_at).toLocaleDateString('ko-KR')} 신청
                </Typography>
              )}
            </Box>
            <Chip
              icon={s.icon}
              label={s.label}
              size="small"
              sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, border: 'none', '& .MuiChip-icon': { color: s.color } }}
            />
          </Box>

          {/* 지원 동기 */}
          <Paper elevation={0} sx={{ p: 1.8, borderRadius: 2, bgcolor: '#f8f6ff', border: '1px solid rgba(124,58,237,0.08)' }}>
            <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {app.content}
            </Typography>
          </Paper>
        </Box>

        {/* 승인 / 반려 버튼 (대기 중일 때만) */}
        {app.status === 'pending' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
              onClick={() => onStatus(app.app_id, 'approved')}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, boxShadow: 'none', fontSize: '0.8rem' }}
            >
              승인
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
              onClick={() => onStatus(app.app_id, 'rejected')}
              sx={{ borderColor: '#dc2626', color: '#dc2626', '&:hover': { bgcolor: '#fee2e2', borderColor: '#dc2626' }, fontSize: '0.8rem' }}
            >
              반려
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
