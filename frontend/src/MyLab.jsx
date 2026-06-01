import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, Chip, CircularProgress, Divider,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import api from './api';

/* 이름 이니셜 기반 아바타 색상 */
const AVATAR_COLORS = [
  'linear-gradient(135deg, #7c3aed, #a855f7)',
  'linear-gradient(135deg, #db2777, #ec4899)',
  'linear-gradient(135deg, #0891b2, #22d3ee)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
  'linear-gradient(135deg, #dc2626, #f87171)',
];
const avatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function MyLab() {
  const [labInfo, setLabInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/labs/my-lab')
      .then(res => setLabInfo(res.data))
      .catch(err => console.error('랩실 정보 로딩 실패:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress color="primary" /></Box>;
  }

  if (!labInfo) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }} className="page-enter">
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

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
          My Lab
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b' }}>
          랩실 관리
        </Typography>
      </Box>

      {/* 랩실 정보 카드 */}
      <Paper elevation={0} sx={{
        p: 4, borderRadius: 4, mb: 4,
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 배경 데코 */}
        <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)', top: -60, right: -40, pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.18)' }}>
              <GroupIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>{labInfo.name}</Typography>
              <Typography sx={{ opacity: 0.75, fontSize: '0.82rem' }}>
                {labInfo.field}
              </Typography>
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

      {/* 랩장 섹션 */}
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

      {/* 랩원 그리드 */}
      {members.length > 0 && (
        <>
          <Divider sx={{ mb: 3, borderColor: 'rgba(109,40,217,0.08)' }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b', mb: 2 }}>
            👥 랩원 ({members.length}명)
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {members.map((m, i) => (
              <Paper
                key={m.student_id}
                elevation={0}
                sx={{
                  p: 2.5, borderRadius: 3, bgcolor: 'white',
                  border: '1px solid rgba(109,40,217,0.08)',
                  boxShadow: '0 2px 8px rgba(109,40,217,0.04)',
                  display: 'flex', alignItems: 'center', gap: 1.8,
                  transition: 'all 0.2s ease',
                  animation: `fadeInUp 0.35s ease ${i * 0.06 + 0.1}s both`,
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(109,40,217,0.12)',
                    transform: 'translateY(-3px)',
                    borderColor: 'rgba(124,58,237,0.2)',
                  },
                }}
              >
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

    </Box>
  );
}
