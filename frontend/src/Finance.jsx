import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Fab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, CircularProgress,
} from '@mui/material';
import AddIcon                 from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';
import TrendingDownIcon         from '@mui/icons-material/TrendingDown';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs }         from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker }           from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import api from './api';

export default function Finance() {
  const labId = localStorage.getItem('lab_id');

  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [open,         setOpen]         = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [newTx, setNewTx] = useState({ type: 'expense', date: dayjs(), description: '', amount: '' });

  const fetchFinances = () => {
    if (!labId) { setLoading(false); return; }
    api.get(`/labs/${labId}/finances`)
      .then(res => setTransactions(res.data))
      .catch(err => console.error('장부 로딩 실패:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFinances(); }, [labId]);

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  const handleOpen  = () => { setNewTx({ type: 'expense', date: dayjs(), description: '', amount: '' }); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!newTx.description || !newTx.amount) { alert('내역과 금액을 입력하세요!'); return; }
    setSaving(true);
    try {
      await api.post(`/labs/${labId}/finances`, {
        type: newTx.type,
        amount: Number(newTx.amount),
        description: newTx.description,
        record_date: newTx.date.format('YYYY-MM-DD'),
      });
      handleClose();
      setLoading(true);
      fetchFinances();
    } catch (err) {
      alert(err.response?.data?.detail || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress color="primary" /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 3 }, py: 4, pb: 10 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
          Finance
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b' }}>
          회비 및 장부 관리
        </Typography>
      </Box>

      {/* 요약 카드 3개 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 4 }}>
        {/* 잔액 */}
        <Paper elevation={0} sx={{
          p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          transition: 'all 0.22s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(124,58,237,0.4)' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 20, opacity: 0.9 }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>현재 잔액</Typography>
          </Box>
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {balance >= 0 ? '' : '-'}{Math.abs(balance).toLocaleString()} 원
          </Typography>
        </Paper>

        {/* 총 수입 */}
        <Paper elevation={0} sx={{
          p: 3, borderRadius: 3, bgcolor: 'white',
          border: '1px solid rgba(22,163,74,0.15)',
          boxShadow: '0 2px 12px rgba(22,163,74,0.06)',
          transition: 'all 0.22s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(22,163,74,0.12)' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: '#dcfce7' }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: '#16a34a' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>총 수입</Typography>
          </Box>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>
            +{totalIncome.toLocaleString()} 원
          </Typography>
        </Paper>

        {/* 총 지출 */}
        <Paper elevation={0} sx={{
          p: 3, borderRadius: 3, bgcolor: 'white',
          border: '1px solid rgba(220,38,38,0.12)',
          boxShadow: '0 2px 12px rgba(220,38,38,0.05)',
          transition: 'all 0.22s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(220,38,38,0.12)' },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: '#fee2e2' }}>
              <TrendingDownIcon sx={{ fontSize: 18, color: '#dc2626' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>총 지출</Typography>
          </Box>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626' }}>
            -{totalExpense.toLocaleString()} 원
          </Typography>
        </Paper>
      </Box>

      {/* 장부 테이블 */}
      {!labId || transactions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>💸</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>
            {!labId ? '소속된 랩실이 없습니다.' : '등록된 장부 내역이 없어요.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            아래 + 버튼으로 첫 내역을 추가해보세요!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{
          borderRadius: 4, bgcolor: 'white',
          border: '1px solid rgba(109,40,217,0.08)',
          boxShadow: '0 2px 14px rgba(109,40,217,0.06)',
          overflow: 'hidden',
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(124,58,237,0.04)' }}>
                {['날짜', '내역', '분류', '금액'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#4b5563', borderBottom: '2px solid rgba(124,58,237,0.1)', py: 1.8 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((row, i) => (
                <TableRow
                  key={row.finance_id}
                  sx={{
                    borderLeft: `3px solid ${row.type === 'income' ? '#16a34a' : '#dc2626'}`,
                    transition: 'background 0.15s ease',
                    animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
                    '&:hover': { bgcolor: row.type === 'income' ? 'rgba(22,163,74,0.03)' : 'rgba(220,38,38,0.03)' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  <TableCell sx={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    {String(row.record_date)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: '#1e1b4b' }}>
                    {row.description || <Typography component="span" variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>내역 없음</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={row.type === 'income' ? <TrendingUpIcon style={{ fontSize: 14 }} /> : <TrendingDownIcon style={{ fontSize: 14 }} />}
                      label={row.type === 'income' ? '입금' : '출금'}
                      size="small"
                      sx={{
                        bgcolor: row.type === 'income' ? '#dcfce7' : '#fee2e2',
                        color:   row.type === 'income' ? '#16a34a' : '#dc2626',
                        border: 'none',
                        '& .MuiChip-icon': { color: 'inherit' },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: row.type === 'income' ? '#16a34a' : '#dc2626', fontSize: '0.95rem' }}>
                    {row.type === 'income' ? '+' : '-'}{row.amount.toLocaleString()} 원
                  </TableCell>
                  {/* 수정/삭제: 백엔드 미지원으로 비활성화
                  <TableCell>...</TableCell>
                  */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 추가 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e1b4b', pb: 0 }}>새 내역 추가</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>분류</InputLabel>
              <Select value={newTx.type} label="분류" onChange={e => setNewTx({ ...newTx, type: e.target.value })}>
                <MenuItem value="income">💚 입금 (+)</MenuItem>
                <MenuItem value="expense">❤️ 출금 (-)</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="날짜" value={newTx.date} onChange={v => setNewTx({ ...newTx, date: v })} slotProps={{ textField: { fullWidth: true } }} />
            </LocalizationProvider>
            <TextField label="사용 내역" fullWidth value={newTx.description} onChange={e => setNewTx({ ...newTx, description: e.target.value })} />
            <TextField label="금액 (원)" fullWidth type="number" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={handleClose} color="inherit" disabled={saving}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : '저장하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {labId && (
        <Fab
          color="primary"
          onClick={handleOpen}
          sx={{
            position: 'fixed', bottom: 36, right: 36,
            boxShadow: '0 8px 24px rgba(124,58,237,0.45)',
            transition: 'all 0.2s ease',
            '&:hover': { transform: 'scale(1.1)', boxShadow: '0 12px 32px rgba(124,58,237,0.55)' },
          }}
        >
          <AddIcon />
        </Fab>
      )}

    </Box>
  );
}
