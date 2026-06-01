import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Tabs, Tab, TextField, Button,
  CircularProgress, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import AddBoxIcon      from '@mui/icons-material/AddBox';
import GroupAddIcon    from '@mui/icons-material/GroupAdd';
import ScienceIcon     from '@mui/icons-material/Science';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from './api';

export default function JoinLab() {
  const navigate = useNavigate();

  // 이미 랩실이 있으면 대시보드로
  useEffect(() => {
    if (localStorage.getItem('lab_id')) navigate('/dashboard', { replace: true });
  }, []);

  const [tab, setTab] = useState(0);

  /* ── 탭 1: 랩실 개설 ── */
  const [form,        setForm]        = useState({ name: '', field: '', description: '' });
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = async () => {
    if (!form.name.trim() || !form.field.trim()) {
      setCreateError('랩실 이름과 연구 분야는 필수 항목입니다.'); return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/labs', {
        name:        form.name.trim(),
        field:       form.field.trim(),
        description: form.description.trim(),
        leader_id:   '',   // 서버에서 토큰으로 덮어씀
      });
      // 내 정보 갱신 (lab_id, role 업데이트)
      const meRes = await api.get('/users/me');
      localStorage.setItem('lab_id',    meRes.data.lab_id ?? '');
      localStorage.setItem('user_role', meRes.data.role   ?? 'student');
      navigate('/dashboard');
    } catch (err) {
      setCreateError(err.response?.data?.detail || '랩실 개설에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  /* ── 탭 2: 기존 랩실 가입 신청 ── */
  const [labs,        setLabs]        = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);

  // 탭 전환 시 랩 목록 로드
  useEffect(() => {
    if (tab !== 1) return;
    setLabsLoading(true);
    api.get('/labs')
      .then(res => setLabs(res.data))
      .catch(err => console.error('랩 목록 로딩 실패:', err))
      .finally(() => setLabsLoading(false));
  }, [tab]);

  // 지원서 다이얼로그
  const [dialog,       setDialog]      = useState({ open: false, lab: null });
  const [content,      setContent]     = useState('');
  const [applying,     setApplying]    = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const openApply  = (lab) => { setDialog({ open: true, lab }); setContent(''); setApplySuccess(false); };
  const closeApply = ()    => setDialog({ open: false, lab: null });

  const handleApply = async () => {
    if (!content.trim()) { alert('지원 동기를 입력해주세요.'); return; }
    setApplying(true);
    try {
      await api.post(`/labs/${dialog.lab.lab_id}/applications`, {
        student_id: '',            // 서버에서 토큰으로 덮어씀
        content:    content.trim(),
      });
      setApplySuccess(true);
    } catch (err) {
      alert(err.response?.data?.detail || '가입 신청에 실패했습니다.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
          Lab
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b', mb: 0.5 }}>
          랩실 참여하기
        </Typography>
        <Typography variant="body2" color="text.secondary">
          새 랩실을 개설하거나, 기존 랩실에 가입을 신청하세요.
        </Typography>
      </Box>

      {/* 탭 */}
      <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 14px rgba(109,40,217,0.06)', overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2, pt: 1,
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.9rem', minHeight: 48 },
            '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #7c3aed, #a855f7)', height: 3, borderRadius: 2 },
          }}
        >
          <Tab icon={<AddBoxIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="랩실 개설하기" />
          <Tab icon={<GroupAddIcon sx={{ fontSize: 18 }} />}         iconPosition="start" label="기존 랩실 가입 신청" />
        </Tabs>

        <Box sx={{ p: 4 }}>

          {/* ── 탭 1: 개설 폼 ── */}
          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1.2, borderRadius: 2, background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  <ScienceIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography fontWeight={700} sx={{ color: '#1e1b4b' }}>새 랩실 개설</Typography>
                  <Typography variant="caption" color="text.secondary">개설하면 자동으로 랩장 권한이 부여됩니다.</Typography>
                </Box>
              </Box>

              {createError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{createError}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="랩실 이름 *"
                  fullWidth
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="예) 데이터베이스 연구실"
                />
                <TextField
                  label="연구 분야 *"
                  fullWidth
                  value={form.field}
                  onChange={e => setForm({ ...form, field: e.target.value })}
                  placeholder="예) 데이터베이스, 인공지능, 네트워크"
                />
                <TextField
                  label="랩실 소개"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="랩실에 대한 간단한 소개를 입력해주세요."
                />
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ borderColor: 'rgba(109,40,217,0.3)', color: '#7c3aed' }}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ px: 4 }}>
                  {creating ? <CircularProgress size={20} color="inherit" /> : '랩실 개설하기'}
                </Button>
              </Box>
            </Box>
          )}

          {/* ── 탭 2: 기존 랩실 목록 ── */}
          {tab === 1 && (
            <Box>
              {labsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
              ) : labs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🔭</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>등록된 랩실이 없습니다.</Typography>
                  <Typography variant="body2" color="text.secondary">첫 번째 탭에서 새 랩실을 개설해보세요!</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {labs.map((lab, i) => (
                    <Paper
                      key={lab.lab_id}
                      elevation={0}
                      sx={{
                        p: 2.5, borderRadius: 3,
                        border: '1px solid rgba(109,40,217,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
                        transition: 'all 0.2s ease',
                        animation: `fadeInUp 0.3s ease ${i * 0.06}s both`,
                        '&:hover': { boxShadow: '0 6px 20px rgba(109,40,217,0.1)', borderColor: 'rgba(124,58,237,0.25)' },
                      }}
                    >
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography fontWeight={700} sx={{ color: '#1e1b4b' }}>{lab.name}</Typography>
                          <Chip label={lab.field} size="small" sx={{ bgcolor: '#ede9fe', color: '#7c3aed', fontSize: '0.7rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          랩장 학번: {lab.leader_id}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GroupAddIcon />}
                        onClick={() => openApply(lab)}
                        sx={{ borderColor: 'rgba(124,58,237,0.4)', color: '#7c3aed', flexShrink: 0, '&:hover': { bgcolor: '#ede9fe' } }}
                      >
                        지원하기
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}

        </Box>
      </Paper>

      {/* ── 가입 신청 다이얼로그 ── */}
      <Dialog open={dialog.open} onClose={closeApply} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1e1b4b', pb: 0 }}>
          {dialog.lab?.name} 가입 신청
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {applySuccess ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: '#16a34a', mb: 2 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b', mb: 1 }}>
                신청이 완료되었습니다!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                랩장의 승인을 기다려주세요. 승인되면 랩실 기능을 이용할 수 있습니다.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                랩장에게 전달할 지원 동기나 자기소개를 작성해주세요.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="지원 동기 / 자기소개"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="이 랩실에 지원하는 이유와 간단한 자기소개를 작성해주세요."
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          {applySuccess ? (
            <Button onClick={closeApply} variant="contained" fullWidth>확인</Button>
          ) : (
            <>
              <Button onClick={closeApply} color="inherit" disabled={applying}>취소</Button>
              <Button onClick={handleApply} variant="contained" disabled={applying}>
                {applying ? <CircularProgress size={18} color="inherit" /> : '신청하기'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
}
