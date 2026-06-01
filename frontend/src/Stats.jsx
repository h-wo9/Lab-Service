import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress,
  LinearProgress, Divider, Chip,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon               from '@mui/icons-material/Groups';
import EventIcon                from '@mui/icons-material/Event';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';
import TrendingDownIcon         from '@mui/icons-material/TrendingDown';
import ReceiptLongIcon          from '@mui/icons-material/ReceiptLong';
import api from './api';

/* 공통 호버 리프트 */
const lift = {
  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(109,40,217,0.15)' },
};

/* 요약 카드 */
function SummaryCard({ icon, label, value, sub, gradient }) {
  return (
    <Paper elevation={0} sx={{
      p: 3, borderRadius: 4, cursor: 'default',
      ...(gradient
        ? { background: gradient, color: 'white', boxShadow: '0 4px 20px rgba(124,58,237,0.25)' }
        : { bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }),
      ...lift,
    }}>
      <Box sx={{ display: 'inline-flex', p: 1.2, borderRadius: 2.5, mb: 2, bgcolor: gradient ? 'rgba(255,255,255,0.18)' : 'rgba(124,58,237,0.09)' }}>
        {icon}
      </Box>
      <Typography variant="body2" sx={{ opacity: gradient ? 0.8 : 0.55, fontWeight: 500, mb: 0.4 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</Typography>
      {sub && <Typography variant="caption" sx={{ opacity: 0.6, mt: 0.3, display: 'block' }}>{sub}</Typography>}
    </Paper>
  );
}

export default function Stats() {
  const labId = localStorage.getItem('lab_id');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!labId) { setLoading(false); return; }
    api.get(`/labs/${labId}/stats`)
      .then(res => setData(res.data))
      .catch(err => console.error('통계 로딩 실패:', err))
      .finally(() => setLoading(false));
  }, [labId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress color="primary" /></Box>;
  }

  if (!labId || !data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }} className="page-enter">
        <Paper elevation={0} sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '2px dashed rgba(124,58,237,0.2)', bgcolor: 'rgba(124,58,237,0.02)', maxWidth: 420 }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>📊</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e1b4b', mb: 1 }}>소속된 랩실이 없습니다.</Typography>
          <Typography variant="body2" color="text.secondary">랩실에 가입하면 통계를 확인할 수 있습니다.</Typography>
        </Paper>
      </Box>
    );
  }

  const { summary, monthly_finance, fee_stats } = data;
  const financeTotal  = summary.total_income + summary.total_expense;
  const incomeAngle   = financeTotal > 0 ? (summary.total_income / financeTotal) * 360 : 180;
  const incomePercent = financeTotal > 0 ? Math.round(summary.total_income / financeTotal * 100) : 50;

  /* 월별 바 차트 최대값 */
  const maxMonthly = Math.max(1, ...monthly_finance.flatMap(m => [m.income, m.expense]));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }} className="page-enter">

      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 2.5, textTransform: 'uppercase', mb: 0.5 }}>
          Statistics
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e1b4b', mb: 0.5 }}>
          랩실 통계 분석
        </Typography>
        <Typography variant="body2" color="text.secondary">
          장부, 일정, 회비 납부 현황을 한눈에 확인하세요.
        </Typography>
      </Box>

      {/* ── 요약 카드 6개 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)' }, gap: 2, mb: 3 }}>
        <SummaryCard
          icon={<AccountBalanceWalletIcon sx={{ color: 'white', fontSize: 20 }} />}
          label="현재 잔액"
          value={`${summary.balance >= 0 ? '' : '-'}${Math.abs(summary.balance).toLocaleString()} 원`}
          gradient="linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)"
        />
        <SummaryCard
          icon={<TrendingUpIcon sx={{ color: '#16a34a', fontSize: 20 }} />}
          label="총 수입"
          value={`+${summary.total_income.toLocaleString()} 원`}
          sub={`${summary.total_transactions}건 중 수입`}
        />
        <SummaryCard
          icon={<TrendingDownIcon sx={{ color: '#dc2626', fontSize: 20 }} />}
          label="총 지출"
          value={`-${summary.total_expense.toLocaleString()} 원`}
        />
        <SummaryCard
          icon={<GroupsIcon sx={{ color: '#7c3aed', fontSize: 20 }} />}
          label="랩실 인원"
          value={`${summary.total_members} 명`}
        />
        <SummaryCard
          icon={<EventIcon sx={{ color: '#7c3aed', fontSize: 20 }} />}
          label="총 일정"
          value={`${summary.total_schedules} 개`}
        />
        <SummaryCard
          icon={<ReceiptLongIcon sx={{ color: '#7c3aed', fontSize: 20 }} />}
          label="장부 내역"
          value={`${summary.total_transactions} 건`}
        />
      </Box>

      {/* ── 중단: 도넛 차트 + 회비 납부 현황 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>

        {/* 수입/지출 비율 도넛 차트 */}
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 12px rgba(109,40,217,0.06)', ...lift }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b', mb: 0.5 }}>수입 / 지출 비율</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            전체 장부 기준 비율 분석 (GROUP BY type)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {/* 도넛 */}
            <Box sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
              <Box sx={{
                width: 150, height: 150, borderRadius: '50%',
                background: financeTotal > 0
                  ? `conic-gradient(#16a34a 0deg ${incomeAngle}deg, #dc2626 ${incomeAngle}deg 360deg)`
                  : '#e5e7eb',
              }} />
              {/* 가운데 구멍 */}
              <Box sx={{
                position: 'absolute', top: '22%', left: '22%',
                width: '56%', height: '56%', borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e1b4b', lineHeight: 1.1 }}>
                  {incomePercent}%
                </Typography>
                <Typography sx={{ fontSize: '0.6rem', color: '#6b7280' }}>수입 비율</Typography>
              </Box>
            </Box>

            {/* 범례 */}
            <Box sx={{ flex: 1, minWidth: 120 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#16a34a', flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">수입</Typography>
                  <Typography fontWeight={700} sx={{ color: '#16a34a' }}>
                    +{summary.total_income.toLocaleString()} 원
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#dc2626', flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">지출</Typography>
                  <Typography fontWeight={700} sx={{ color: '#dc2626' }}>
                    -{summary.total_expense.toLocaleString()} 원
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 회비 납부 현황 */}
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 12px rgba(109,40,217,0.06)', ...lift }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b', mb: 0.5 }}>회비 납부 현황</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            납부 완료 / 미납 현황 (JOIN + GROUP BY is_paid)
          </Typography>

          {fee_stats.total === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>📋</Typography>
              <Typography variant="body2" color="text.secondary">아직 청구된 회비가 없습니다.</Typography>
            </Box>
          ) : (
            <>
              {/* 납부율 숫자 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">납부율</Typography>
                <Typography fontWeight={700} sx={{ color: '#7c3aed' }}>{fee_stats.rate}%</Typography>
              </Box>

              {/* 프로그레스 바 */}
              <LinearProgress
                variant="determinate"
                value={fee_stats.rate}
                sx={{
                  height: 10, borderRadius: 5, mb: 3,
                  bgcolor: '#fee2e2',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                  },
                }}
              />

              {/* 통계 숫자 3개 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.5 }}>
                {[
                  { label: '총 납부 건수', value: fee_stats.total, color: '#1e1b4b' },
                  { label: '납부 완료',    value: fee_stats.paid,  color: '#16a34a' },
                  { label: '미납',         value: fee_stats.unpaid, color: '#dc2626' },
                ].map(item => (
                  <Box key={item.label} sx={{ textAlign: 'center', p: 1.5, borderRadius: 2.5, bgcolor: '#f8f6ff' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, lineHeight: 1.1 }}>
                      {item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* ── 월별 장부 바 차트 ── */}
      <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(109,40,217,0.08)', boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e1b4b' }}>월별 장부 추이</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[{ color: '#16a34a', label: '수입' }, { color: '#dc2626', label: '지출' }].map(l => (
              <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: l.color }} />
                <Typography variant="caption" color="text.secondary">{l.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
          월별 수입/지출 합계 (GROUP BY DATE_FORMAT + SUM)
        </Typography>

        {monthly_finance.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>📊</Typography>
            <Typography variant="body2" color="text.secondary">아직 장부 내역이 없습니다.</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, minWidth: monthly_finance.length * 80, pb: 1 }}>
              {monthly_finance.map((m, i) => {
                const incomeH  = Math.max(4, (m.income  / maxMonthly) * 160);
                const expenseH = Math.max(4, (m.expense / maxMonthly) * 160);
                return (
                  <Box key={m.month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1, animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
                    {/* 바 묶음 */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.8, height: 164 }}>
                      {/* 수입 바 */}
                      <Box sx={{ width: 22, height: incomeH, bgcolor: '#16a34a', borderRadius: '5px 5px 0 0', transition: 'height 0.6s ease', position: 'relative' }}>
                        {m.income > 0 && (
                          <Typography sx={{
                            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                            fontSize: '0.55rem', color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap', mb: 0.3,
                          }}>
                            {(m.income / 1000).toFixed(0)}k
                          </Typography>
                        )}
                      </Box>
                      {/* 지출 바 */}
                      <Box sx={{ width: 22, height: expenseH, bgcolor: '#dc2626', borderRadius: '5px 5px 0 0', transition: 'height 0.6s ease', position: 'relative' }}>
                        {m.expense > 0 && (
                          <Typography sx={{
                            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                            fontSize: '0.55rem', color: '#dc2626', fontWeight: 700, whiteSpace: 'nowrap', mb: 0.3,
                          }}>
                            {(m.expense / 1000).toFixed(0)}k
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* 월 라벨 */}
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.72rem' }}>
                      {m.month.slice(5)}월
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            {/* X축 기준선 */}
            <Box sx={{ height: '1px', bgcolor: 'rgba(109,40,217,0.1)', mt: 0 }} />
          </Box>
        )}
      </Paper>

    </Box>
  );
}
