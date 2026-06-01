import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  InputAdornment, Alert, CircularProgress,
} from '@mui/material';
import PersonIcon  from '@mui/icons-material/Person';
import LockIcon    from '@mui/icons-material/Lock';
import BadgeIcon   from '@mui/icons-material/Badge';
import api from './api';

/* ── 좌측 브랜딩 패널 데코 원 ── */
function DecoCircle({ size, top, left, bottom, right, opacity = 0.07 }) {
  return (
    <Box sx={{
      position: 'absolute',
      width: size, height: size,
      borderRadius: '50%',
      background: 'rgba(255,255,255,1)',
      opacity,
      top, left, bottom, right,
      pointerEvents: 'none',
    }} />
  );
}

export default function Login() {
  const [isLoginMode, setIsLoginMode]     = useState(true);
  const [userId, setUserId]               = useState('');
  const [password, setPassword]           = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userName, setUserName]           = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [errorMsg, setErrorMsg]           = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLoginMode) {
      if (!userId || !password) { setErrorMsg('아이디와 비밀번호를 모두 입력해주세요.'); return; }
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('username', userId);
        params.append('password', password);
        const { data } = await api.post('/users/login', params);
        localStorage.setItem('access_token', data.access_token);

        const meRes = await api.get('/users/me');
        localStorage.setItem('user_name', meRes.data.name);
        localStorage.setItem('user_id',   meRes.data.student_id);
        localStorage.setItem('lab_id',    meRes.data.lab_id ?? '');
        localStorage.setItem('user_role', meRes.data.role ?? 'student');

        navigate('/dashboard');
      } catch (err) {
        setErrorMsg(err.response?.data?.detail || '로그인에 실패했습니다. 학번과 비밀번호를 확인해주세요.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!userId || !password || !userName) { setErrorMsg('모든 항목을 입력해주세요.'); return; }
      if (password !== passwordConfirm)      { setErrorMsg('비밀번호가 일치하지 않습니다.'); return; }
      setIsLoading(true);
      try {
        await api.post('/users/signup', { student_id: userId, password, name: userName });
        alert('회원가입이 완료되었습니다! 로그인해주세요.');
        setPassword(''); setPasswordConfirm('');
        setIsLoginMode(true);
      } catch (err) {
        setErrorMsg(err.response?.data?.detail || '회원가입에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setUserId(''); setPassword(''); setPasswordConfirm(''); setUserName(''); setErrorMsg('');
  };

  /* ── 공용 TextField 스타일 ── */
  const fieldSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      transition: 'box-shadow 0.2s',
      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(124,58,237,0.15)' },
    },
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── 좌측: 브랜딩 패널 ── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0f0826 0%, #2d1060 45%, #5b21b6 80%, #7c3aed 100%)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 10s ease infinite',
        p: 6,
      }}>
        {/* 데코 원들 */}
        <DecoCircle size={520} top={-160} right={-160} opacity={0.04} />
        <DecoCircle size={320} bottom={-80} left={-80} opacity={0.05} />
        <DecoCircle size={160} top="38%" right="12%" opacity={0.06} />

        {/* 콘텐츠 */}
        <Box sx={{ position: 'relative', textAlign: 'center', color: 'white', maxWidth: 400, animation: 'fadeInUp 0.7s ease both' }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: 3.5, mx: 'auto', mb: 4,
            background: 'rgba(255,255,255,0.13)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800 }}>L</Typography>
          </Box>

          <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
            랩실 관리 시스템
          </Typography>
          <Typography sx={{ opacity: 0.65, mb: 5, fontSize: '0.95rem' }}>
            한신대학교 
          </Typography>

          {['간편한 일정 및 회의 관리', '회비 및 장부 관리', '한눈에 보이는 랩원 멤버 관리'].map((text, i) => (
            <Box key={text} sx={{
              mb: 1.5, px: 3, py: 1.4, borderRadius: 10,
              background: 'rgba(255,255,255,0.09)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.14)',
              animation: `fadeInUp 0.5s ease ${0.2 + i * 0.1}s both`,
            }}>
              <Typography sx={{ fontSize: '0.88rem', opacity: 0.9 }}>{text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── 우측: 폼 패널 ── */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: { xs: 3, md: 5.5 },
        py: 4,
        bgcolor: 'white',
        overflowY: 'auto',
        animation: 'fadeIn 0.5s ease both',
      }}>

        {/* 모바일 로고 */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography fontWeight="bold" color="white">L</Typography>
          </Box>
          <Typography fontWeight="bold" sx={{ color: '#1e1b4b' }}>랩실 관리 시스템</Typography>
        </Box>

        <Typography variant="overline" sx={{ color: '#7c3aed', letterSpacing: 2, fontWeight: 700, mb: 0.5, fontSize: '0.7rem' }}>
          {isLoginMode ? 'SIGN IN' : 'SIGN UP'}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 0.5 }}>
          {isLoginMode ? '반가워요!' : '새 계정 만들기'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: errorMsg ? 2 : 3.5 }}>
          {isLoginMode ? '학번과 비밀번호를 입력해 주세요.' : '가입 정보를 입력해 주세요.'}
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{errorMsg}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <TextField
              fullWidth variant="outlined" placeholder="이름 (실명)"
              value={userName} onChange={e => setUserName(e.target.value)}
              sx={fieldSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }}
            />
          )}

          <TextField
            fullWidth variant="outlined" placeholder="아이디 (학번)"
            value={userId} onChange={e => setUserId(e.target.value)}
            sx={fieldSx}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }}
          />

          <TextField
            fullWidth type="password" variant="outlined" placeholder="비밀번호"
            value={password} onChange={e => setPassword(e.target.value)}
            sx={{ ...fieldSx, mb: isLoginMode ? 3.5 : 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }}
          />

          {!isLoginMode && (
            <TextField
              fullWidth type="password" variant="outlined" placeholder="비밀번호 확인"
              value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
              sx={{ ...fieldSx, mb: 3.5 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }}
            />
          )}

          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={isLoading}
            sx={{ py: 1.6, mb: 2, fontSize: '1rem', fontWeight: 700 }}
          >
            {isLoading
              ? <CircularProgress size={22} color="inherit" />
              : (isLoginMode ? '로그인' : '회원가입 완료')}
          </Button>

          <Button
            fullWidth variant="text" onClick={switchMode} disabled={isLoading}
            sx={{
              color: 'text.secondary', fontWeight: 500,
              '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
            }}
          >
            {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </Button>
        </Box>
      </Box>

    </Box>
  );
}
