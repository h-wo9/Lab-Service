import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Divider, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs }         from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker }           from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import api from './api';

export default function Schedule() {
  const labId = localStorage.getItem('lab_id');

  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);

  /* 추가/수정 공용 모달 */
  const [open,     setOpen]    = useState(false);
  const [mode,     setMode]    = useState('add');        // 'add' | 'edit'
  const [editId,   setEditId]  = useState(null);         // 수정 중인 schedule_id
  const [saving,   setSaving]  = useState(false);
  const [form,     setForm]    = useState({ title: '', date: dayjs() });

  const fetchSchedules = () => {
    if (!labId) { setLoading(false); return; }
    api.get(`/labs/${labId}/schedules`)
      .then(res => setSchedules(res.data))
      .catch(err => console.error('일정 로딩 실패:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchedules(); }, [labId]);

  /* 추가 모달 열기 */
  const handleAddOpen = () => {
    setMode('add');
    setEditId(null);
    setForm({ title: '', date: dayjs() });
    setOpen(true);
  };

  /* 수정 모달 열기 */
  const handleEditOpen = (s) => {
    setMode('edit');
    setEditId(s.schedule_id);
    setForm({ title: s.title, date: dayjs(s.date) });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  /* 삭제 */
  const handleDelete = async (scheduleId) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/schedules/${scheduleId}`);
      setSchedules(prev => prev.filter(s => s.schedule_id !== scheduleId));
    } catch (err) {
      alert(err.response?.data?.detail || '삭제에 실패했습니다.');
    }
  };

  /* 저장 (추가 / 수정 공용) */
  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('일정 제목을 입력해주세요.'); return; }
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), date: form.date.format('YYYY-MM-DD') };

      if (mode === 'add') {
        await api.post(`/labs/${labId}/schedules`, payload);
      } else {
        await api.put(`/schedules/${editId}`, payload);
      }

      handleClose();
      setLoading(true);
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.detail || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const today  = dayjs().format('YYYY-MM-DD');
  const sorted = [...schedules].sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress color="primary" /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
            Schedule
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b', mb: 0.5 }}>
            일정 확인하기
          </Typography>
          <Typography variant="body2" color="text.secondary">
            랩실 회의, 세미나, 면담 일정을 확인하세요.
          </Typography>
        </Box>
        {labId && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddOpen}
            sx={{ mt: 1, px: 2.5, py: 1.1, flexShrink: 0 }}
          >
            새 일정 추가
          </Button>
        )}
      </Box>

      {/* 빈 상태 */}
      {!labId || sorted.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>📅</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>
            {!labId ? '소속된 랩실이 없습니다.' : '등록된 일정이 없어요.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!labId ? '랩실에 가입하면 일정을 확인할 수 있습니다.' : '오른쪽 위 버튼으로 첫 일정을 추가해보세요!'}
          </Typography>
        </Paper>
      ) : (

        /* ── 타임라인 ── */
        <Box sx={{ position: 'relative' }}>
          {/* 세로 연결선 */}
          <Box sx={{
            position: 'absolute', left: 56, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg, #7c3aed 0%, rgba(124,58,237,0.1) 100%)',
            borderRadius: 1,
          }} />

          {sorted.map((s, i) => {
            const isPast  = s.date < today;
            const isToday = s.date === today;
            const dotColor = isToday ? '#7c3aed' : s.date > today ? '#a78bfa' : '#d1d5db';
            const cardBg   = isToday
              ? 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(168,139,250,0.04) 100%)'
              : 'white';

            return (
              <Box key={s.schedule_id} sx={{ display: 'flex', gap: 3, mb: 2.5, animation: `fadeInUp 0.35s ease ${i * 0.07}s both` }}>

                {/* 날짜 컬럼 */}
                <Box sx={{ width: 56, flexShrink: 0, textAlign: 'center', pt: 2.5 }}>
                  <Typography sx={{ color: isToday ? '#7c3aed' : isPast ? '#9ca3af' : '#4b5563', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1 }}>
                    {dayjs(s.date).format('DD')}
                  </Typography>
                  <Typography sx={{ color: isToday ? '#a78bfa' : '#9ca3af', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {dayjs(s.date).format('MMM')}
                  </Typography>
                </Box>

                {/* 도트 */}
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', pt: 3.2, zIndex: 1 }}>
                  <Box sx={{
                    width: 12, height: 12, borderRadius: '50%',
                    bgcolor: dotColor,
                    border: `2px solid ${isToday ? '#ede9fe' : 'white'}`,
                    boxShadow: isToday ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
                    ml: '-7px', flexShrink: 0,
                  }} />
                </Box>

                {/* 카드 */}
                <Paper elevation={0} sx={{
                  flex: 1, p: 2.5, borderRadius: 3,
                  background: cardBg,
                  border: isToday ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(109,40,217,0.07)',
                  boxShadow: isToday ? '0 4px 20px rgba(124,58,237,0.1)' : '0 2px 8px rgba(109,40,217,0.04)',
                  transition: 'all 0.2s ease',
                  '&:hover': { boxShadow: '0 8px 28px rgba(124,58,237,0.14)', transform: 'translateX(4px)' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    {/* 제목 + 뱃지 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
                      {isToday && <Chip label="오늘" size="small" sx={{ bgcolor: '#7c3aed', color: 'white', fontSize: '0.7rem', height: 22 }} />}
                      {isPast  && <Chip label="완료" size="small" variant="outlined" sx={{ borderColor: '#d1d5db', color: '#9ca3af', fontSize: '0.7rem', height: 22 }} />}
                      <Typography variant="body1" fontWeight={isToday ? 700 : 600} sx={{ color: isPast ? '#9ca3af' : '#1e1b4b' }}>
                        {s.title}
                      </Typography>
                    </Box>

                    {/* 수정 / 삭제 버튼 */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditOpen(s)}
                        sx={{ color: '#9ca3af', transition: 'all 0.15s ease', '&:hover': { color: '#7c3aed', bgcolor: '#ede9fe' } }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(s.schedule_id)}
                        sx={{ color: '#9ca3af', transition: 'all 0.15s ease', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {dayjs(s.date).format('YYYY년 MM월 DD일 (ddd)')}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── 추가 / 수정 공용 모달 ── */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e1b4b', pb: 0 }}>
          {mode === 'add' ? '새 일정 추가' : '일정 수정'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="일정 제목"
              fullWidth
              autoFocus
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="예) 랩실 주간 회의, 교수님 면담"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="날짜"
                value={form.date}
                onChange={v => setForm({ ...form, date: v })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={handleClose} color="inherit" disabled={saving}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving
              ? <CircularProgress size={18} color="inherit" />
              : mode === 'add' ? '저장하기' : '수정 완료'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
