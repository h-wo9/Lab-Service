import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Fab, Chip, Avatar,
  CircularProgress, Collapse, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  LinearProgress,
} from '@mui/material';
import AddIcon        from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon     from '@mui/icons-material/Cancel';
import PaidIcon       from '@mui/icons-material/Paid';
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

export default function Fee() {
  const labId    = localStorage.getItem('lab_id');
  const userId   = localStorage.getItem('user_id');
  const isLeader = localStorage.getItem('user_role') === 'leader';

  const [fees,     setFees]     = useState([]);
  const [members,  setMembers]  = useState([]);
  const [payments, setPayments] = useState({});   // { fee_id: [PaymentInfo] }
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null); // 펼쳐진 fee_id

  /* 청구 모달 */
  const [open,     setOpen]    = useState(false);
  const [newFee,   setNewFee]  = useState({ title: '', amount: '' });
  const [creating, setCreating] = useState(false);

  const loadAll = () => {
    if (!labId) { setLoading(false); return; }
    Promise.all([
      api.get(`/labs/${labId}/fees`),
      api.get('/labs/my-lab'),
    ]).then(([feesRes, labRes]) => {
      const feeList = feesRes.data;
      setFees(feeList);
      setMembers(labRes.data.members || []);

      // 모든 회비의 납부현황을 병렬로 가져옴
      return Promise.all(
        feeList.map(f =>
          api.get(`/fees/${f.fee_id}/payments`).then(r => [f.fee_id, r.data])
        )
      );
    }).then(pairs => {
      const map = {};
      for (const [id, data] of pairs) map[id] = data;
      setPayments(map);
    }).catch(err => console.error('회비 로딩 실패:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, [labId]);

  /* 납부하기 */
  const handlePay = async (feeId) => {
    try {
      await api.put(`/fees/${feeId}/pay`);
      const res = await api.get(`/fees/${feeId}/payments`);
      setPayments(prev => ({ ...prev, [feeId]: res.data }));
    } catch (err) {
      alert(err.response?.data?.detail || '납부 처리에 실패했습니다.');
    }
  };

  /* 회비 청구 */
  const handleCreate = async () => {
    if (!newFee.title.trim() || !newFee.amount) { alert('제목과 금액을 입력해주세요.'); return; }
    setCreating(true);
    try {
      await api.post(`/labs/${labId}/fees`, {
        title:  newFee.title.trim(),
        amount: Number(newFee.amount),
      });
      setOpen(false);
      setNewFee({ title: '', amount: '' });
      setLoading(true);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.detail || '회비 청구에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  /* 멤버 이름 조회 */
  const getName = (studentId) =>
    members.find(m => m.student_id === studentId)?.name ?? studentId;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress color="primary" /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, md: 3 }, py: 4, pb: 10 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
            Fees
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b', mb: 0.5 }}>회비 관리</Typography>
          <Typography variant="body2" color="text.secondary">
            회비 청구 내역과 납부 현황을 확인하세요.
          </Typography>
        </Box>
        {isLeader && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ flexShrink: 0 }}>
            회비 청구하기
          </Button>
        )}
      </Box>

      {/* 빈 상태 */}
      {!labId || fees.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>💳</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>
            {!labId ? '소속된 랩실이 없습니다.' : '아직 청구된 회비가 없어요.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLeader ? '오른쪽 위 버튼으로 첫 회비를 청구해보세요!' : '랩장이 회비를 청구하면 여기에 표시됩니다.'}
          </Typography>
        </Paper>
      ) : (

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fees.map((fee, idx) => {
            const feePayments  = payments[fee.fee_id] || [];
            const paidCount    = feePayments.filter(p => p.is_paid).length;
            const totalCount   = feePayments.length;
            const paidRate     = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
            const myPayment    = feePayments.find(p => p.student_id === userId);
            const isExpanded   = expanded === fee.fee_id;

            return (
              <Paper
                key={fee.fee_id}
                elevation={0}
                sx={{
                  borderRadius: 4, overflow: 'hidden',
                  border: '1px solid rgba(109,40,217,0.1)',
                  boxShadow: '0 2px 12px rgba(109,40,217,0.06)',
                  animation: `fadeInUp 0.35s ease ${idx * 0.07}s both`,
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 6px 24px rgba(109,40,217,0.12)' },
                }}
              >
                {/* 회비 헤더 */}
                <Box sx={{
                  p: 3, display: 'flex', alignItems: 'center', gap: 2,
                  background: isExpanded
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(168,139,250,0.05))'
                    : 'white',
                  transition: 'background 0.2s ease',
                }}>
                  <Box sx={{ p: 1.2, borderRadius: 2.5, background: 'linear-gradient(135deg,#4c1d95,#7c3aed)', flexShrink: 0 }}>
                    <PaidIcon sx={{ color: 'white', fontSize: 22 }} />
                  </Box>

                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography fontWeight={700} sx={{ color: '#1e1b4b' }}>{fee.title}</Typography>
                      <Chip
                        label={`${fee.amount.toLocaleString()} 원`}
                        size="small"
                        sx={{ bgcolor: '#ede9fe', color: '#7c3aed', fontWeight: 700 }}
                      />
                      {myPayment && (
                        <Chip
                          icon={myPayment.is_paid
                            ? <CheckCircleIcon style={{ fontSize: 14 }} />
                            : <CancelIcon style={{ fontSize: 14 }} />}
                          label={myPayment.is_paid ? '내 납부 완료' : '내 미납'}
                          size="small"
                          sx={{
                            bgcolor: myPayment.is_paid ? '#dcfce7' : '#fee2e2',
                            color:   myPayment.is_paid ? '#16a34a'  : '#dc2626',
                            '& .MuiChip-icon': { color: 'inherit' },
                          }}
                        />
                      )}
                    </Box>

                    {/* 납부 진행도 */}
                    {totalCount > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={paidRate}
                          sx={{
                            flex: 1, height: 6, borderRadius: 3,
                            bgcolor: '#fee2e2',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: 'linear-gradient(90deg,#7c3aed,#a855f7)',
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#6b7280', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {paidCount} / {totalCount} 명
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* 내 납부하기 버튼 */}
                  {myPayment && !myPayment.is_paid && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handlePay(fee.fee_id)}
                      sx={{ flexShrink: 0, fontSize: '0.78rem' }}
                    >
                      납부하기
                    </Button>
                  )}

                  {/* 펼치기 버튼 */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setExpanded(isExpanded ? null : fee.fee_id)}
                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ flexShrink: 0, borderColor: 'rgba(124,58,237,0.3)', color: '#7c3aed', fontSize: '0.78rem', '&:hover': { bgcolor: '#ede9fe' } }}
                  >
                    납부 현황
                  </Button>
                </Box>

                {/* 납부 현황 패널 */}
                <Collapse in={isExpanded} timeout={240}>
                  <Divider sx={{ borderColor: 'rgba(109,40,217,0.08)' }} />
                  <Box sx={{ p: 3, bgcolor: 'rgba(248,246,255,0.7)' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#1e1b4b', mb: 2 }}>
                      멤버별 납부 현황
                    </Typography>
                    {feePayments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">납부 내역이 없습니다.</Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 1.5 }}>
                        {feePayments.map(p => {
                          const name    = getName(p.student_id);
                          const isMe    = p.student_id === userId;
                          return (
                            <Box
                              key={p.payment_id}
                              sx={{
                                p: 1.8, borderRadius: 2.5,
                                bgcolor: p.is_paid ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.04)',
                                border:  `1px solid ${p.is_paid ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.14)'}`,
                                display: 'flex', alignItems: 'center', gap: 1.5,
                              }}
                            >
                              <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700, background: avatarColor(name), flexShrink: 0 }}>
                                {name.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#1e1b4b' }} noWrap>
                                  {name} {isMe && <span style={{ color: '#7c3aed', fontSize: '0.7rem' }}>(나)</span>}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{p.student_id}</Typography>
                              </Box>
                              {p.is_paid
                                ? <CheckCircleIcon sx={{ fontSize: 20, color: '#16a34a', flexShrink: 0 }} />
                                : <CancelIcon     sx={{ fontSize: 20, color: '#ef4444', flexShrink: 0 }} />}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* 청구 모달 (랩장만) */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e1b4b', pb: 0 }}>새 회비 청구</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            청구 시 현재 소속된 모든 랩원에게 납부 내역이 자동 생성됩니다.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="회비 제목"
              fullWidth
              autoFocus
              value={newFee.title}
              onChange={e => setNewFee({ ...newFee, title: e.target.value })}
              placeholder="예) 6월 랩실 정기 회비"
            />
            <TextField
              label="금액 (원)"
              fullWidth
              type="number"
              value={newFee.amount}
              onChange={e => setNewFee({ ...newFee, amount: e.target.value })}
              placeholder="예) 10000"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpen(false)} color="inherit" disabled={creating}>취소</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? <CircularProgress size={18} color="inherit" /> : '청구하기'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
