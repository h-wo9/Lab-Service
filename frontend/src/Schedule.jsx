import { 
  Box, Typography, Button, Paper, List, ListItem, 
  Avatar, Divider, Chip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';

function Schedule() {
  // 임시 일정 데이터
  const schedules = [
    { 
      id: 1, 
      date: dayjs().format('YYYY-MM-DD'), 
      time: '14:00 - 16:00', 
      title: '랩실 주간 회의', 
      location: '제1세미나실',
      type: '회의'
    },
    { 
      id: 2, 
      date: dayjs().add(1, 'day').format('YYYY-MM-DD'), 
      time: '10:00 - 11:30', 
      title: '김교수님 개별 면담 (홍길동)', 
      location: '교수님 연구실',
      type: '면담'
    },
    { 
      id: 3, 
      date: dayjs().add(3, 'day').format('YYYY-MM-DD'), 
      time: '16:00 - 18:00', 
      title: '프로젝트 중간 점검 세미나', 
      location: '랩실 메인 테이블',
      type: '세미나'
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}>
      
      {/* 🌸 상단 헤더 영역 (제목 & 추가 버튼) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.dark', mb: 1 }}>
            일정 확인하기
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            랩실의 주요 회의, 세미나, 면담 일정을 확인하고 관리하세요.
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ 
            borderRadius: 2, 
            px: 3, 
            py: 1, 
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(156, 39, 176, 0.3)'
          }}
        >
          새 일정 추가
        </Button>
      </Box>

      {/* 📅 일정 리스트 영역 */}
      <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'white', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
        <List disablePadding>
          {schedules.map((schedule, index) => (
            <Box key={schedule.id}>
              <ListItem sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
                
                {/* 왼쪽: 날짜 정보 */}
                <Box sx={{ minWidth: '120px', textAlign: { xs: 'left', sm: 'center' } }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {dayjs(schedule.date).format('DD')}일
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {dayjs(schedule.date).format('YYYY. MM.')}
                  </Typography>
                  {schedule.date === dayjs().format('YYYY-MM-DD') && (
                    <Chip label="오늘" color="error" size="small" sx={{ mt: 1, fontWeight: 'bold' }} />
                  )}
                </Box>

                {/* 중앙: 일정 아이콘 & 디테일 */}
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)', color: 'primary.main', width: 48, height: 48 }}>
                    <EventNoteIcon />
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={schedule.type} size="small" sx={{ bgcolor: '#f3e5f5', color: 'primary.dark', fontWeight: 'bold' }} />
                      <Typography variant="h6" fontWeight="bold">
                        {schedule.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mt: 1 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" /> {schedule.time}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" /> {schedule.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

              </ListItem>
              {/* 마지막 아이템이 아니면 구분선 추가 */}
              {index < schedules.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>
      
    </Box>
  );
}

export default Schedule;