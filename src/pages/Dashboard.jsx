import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import additional MUI components for a richer UI
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Chip, Avatar } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GradeIcon from '@mui/icons-material/Grade';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appraisalInfo, setAppraisalInfo] = useState({ status: 'Not Started', id: null });
    // State for remarks from HOD and Principal
    const [hodRemarks, setHodRemarks] = useState(null);
    const [principalRemarks, setPrincipalRemarks] = useState('');
    const [finalApiScore, setFinalApiScore] = useState(null);
    // State for HR scores (needed for grade calculation)
    const [hrScores, setHrScores] = useState(null);

    useEffect(() => {
        const checkUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select(`*, department:departments(name), appraisals(id, status, assessment_year_start, hod_remarks, principal_remarks, grand_api_score_final, part2_hr_score, part3_hr_score, part4_hr_score)`)
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            } else if (data) {
                if (data.role === 'principal') { navigate('/principal-dashboard'); return; }
                if (data.role === 'hod') { navigate('/hod-dashboard'); return; }

                setUserProfile(data);

                const currentYear = new Date().getFullYear();
                const currentAppraisal = data.appraisals.find(app => app.assessment_year_start === currentYear);
                if (currentAppraisal) {
                    setAppraisalInfo({ status: currentAppraisal.status, id: currentAppraisal.id });
                    setHodRemarks(currentAppraisal.hod_remarks || null);
                    setPrincipalRemarks(currentAppraisal.principal_remarks || '');
                    setFinalApiScore(currentAppraisal.grand_api_score_final || null);
                    if (currentAppraisal.part2_hr_score != null) {
                        setHrScores({
                            part2: currentAppraisal.part2_hr_score,
                            part3: currentAppraisal.part3_hr_score,
                            part4: currentAppraisal.part4_hr_score,
                        });
                    }
                }
            } else {
                navigate('/create-profile');
            }
            setLoading(false);
        };
        checkUserProfile();
    }, [navigate]);

    // Faculty Grade Calculation (same logic as PrincipalView)
    const facultyGrade = useMemo(() => {
        if (!finalApiScore || !hrScores) return null;
        const p2_percent = (hrScores.part2 / 350) * 100;
        const p3_percent = (hrScores.part3 / 170) * 100;
        const p4_percent = (hrScores.part4 / 180) * 100;
        const grand = finalApiScore;

        if (p2_percent >= 60 && p3_percent >= 60 && p4_percent >= 60 && grand >= 70) return 'A';
        if (p2_percent >= 50 && p3_percent >= 50 && p4_percent >= 50 && grand >= 60) return 'B';
        if (p2_percent >= 50 && p3_percent <= 50 && p4_percent >= 50 && grand >= 55) return 'C';
        if (p2_percent >= 50 && p3_percent >= 50 && p4_percent <= 50 && grand >= 50) return 'D';
        if (p2_percent >= 50 && p3_percent <= 50 && p4_percent <= 50 && grand >= 40) return 'E';
        if (p2_percent < 50 && p3_percent < 50 && p4_percent < 50) return 'F';
        return 'Not Categorized';
    }, [finalApiScore, hrScores]);

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': case 'B': return 'success.main';
            case 'C': case 'D': return 'warning.main';
            case 'E': case 'F': return 'error.main';
            default: return 'text.secondary';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const isSubmitted = appraisalInfo.status === 'submitted_by_staff' || appraisalInfo.status === 'reviewed_by_hod';

    const getStatusChip = () => {
        switch (appraisalInfo.status) {
            case 'draft':
                return <Chip icon={<PendingIcon />} label="In Progress (Draft)" color="primary" />;
            case 'submitted_by_staff':
                return <Chip icon={<CheckCircleIcon />} label="Submitted — Awaiting HOD Review" color="success" />;
            case 'reviewed_by_hod':
                 return <Chip icon={<CheckCircleIcon />} label="Reviewed by HOD" color="secondary" />;
            default:
                return <Chip label="Not Started" variant="outlined" />;
        }
    };

    const getActionButton = () => {
        if (isSubmitted) {
            return (
                <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate('/appraisal')}
                >
                    View Submitted Appraisal
                </Button>
            );
        }
        return (
            <Button 
                variant="contained" 
                size="large"
                startIcon={<EditNoteIcon />}
                onClick={() => navigate('/appraisal')}
            >
                {appraisalInfo.status === 'Not Started' ? 'Start Appraisal' : 'Continue Editing'}
            </Button>
        );
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Welcome back, {userProfile?.full_name || 'User'}!
            </Typography>

            <Grid container spacing={3}>
                {/* Grade & Score Card — prominent, full width when grade exists */}
                {facultyGrade && finalApiScore != null && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(156,39,176,0.08) 100%)', border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: { xs: 3, sm: 6 } }}>
                                {/* Grade Badge */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 500, color: 'text.secondary' }}>Faculty Grade</Typography>
                                    <Avatar sx={{ 
                                        bgcolor: getGradeColor(facultyGrade), 
                                        width: 72, height: 72, mx: 'auto', mt: 0.5,
                                        fontSize: '2rem', fontWeight: 700
                                    }}>
                                        {facultyGrade}
                                    </Avatar>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                                <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />
                                {/* Final API Score */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 500, color: 'text.secondary' }}>Final API Score</Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2, mt: 0.5 }}>
                                        {finalApiScore.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                                <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />
                                {/* Part-wise HR Scores */}
                                {hrScores && (
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                                            <Typography variant="caption" color="text.secondary">Part II</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{hrScores.part2?.toFixed(1)}<Typography component="span" variant="caption" color="text.secondary">/350</Typography></Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                                            <Typography variant="caption" color="text.secondary">Part III</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{hrScores.part3?.toFixed(1)}<Typography component="span" variant="caption" color="text.secondary">/170</Typography></Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                                            <Typography variant="caption" color="text.secondary">Part IV</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{hrScores.part4?.toFixed(1)}<Typography component="span" variant="caption" color="text.secondary">/180</Typography></Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                )}

                {/* Main Action Card */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Your Annual Appraisal
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Typography variant="body1">Current Status:</Typography>
                            {getStatusChip()}
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {isSubmitted 
                                ? 'Your appraisal has been submitted. Click below to view your submitted form, scores, and any reviewer remarks.'
                                : 'Click the button below to fill out or review your self-appraisal form for the current assessment period.'
                            }
                        </Typography>
                        {getActionButton()}
                    </Paper>
                </Grid>

                {/* Profile Information Card */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountCircleIcon color="action" />
                            <Typography variant="h6" component="h2">
                                Your Information
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2"><strong>Name:</strong> {userProfile?.full_name}</Typography>
                            <Typography variant="body2"><strong>Staff ID:</strong> {userProfile?.staff_id}</Typography>
                            <Typography variant="body2"><strong>Email:</strong> {userProfile?.email}</Typography>
                            <Typography variant="body2"><strong>Department:</strong> {userProfile?.department?.name}</Typography>
                        </Box>
                    </Paper>
                </Grid>
                {/* HOD & Principal Remarks — always visible once submitted */}
                {isSubmitted && (
                    <>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, border: '1px solid', borderColor: hodRemarks && (hodRemarks.strengths || hodRemarks.concerns || hodRemarks.suggestions) ? 'secondary.main' : 'divider', borderRadius: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <RateReviewIcon color={hodRemarks && (hodRemarks.strengths || hodRemarks.concerns || hodRemarks.suggestions) ? 'secondary' : 'disabled'} />
                                <Typography variant="h6" component="h2" sx={{ color: hodRemarks && (hodRemarks.strengths || hodRemarks.concerns || hodRemarks.suggestions) ? 'secondary.main' : 'text.secondary' }}>
                                    HOD's Remarks
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            {hodRemarks && (hodRemarks.strengths || hodRemarks.concerns || hodRemarks.suggestions) ? (
                                <>
                                    {hodRemarks.strengths && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Strengths:</Typography>
                                            <Typography variant="body2" color="text.secondary">{hodRemarks.strengths}</Typography>
                                        </Box>
                                    )}
                                    {hodRemarks.concerns && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Concerns:</Typography>
                                            <Typography variant="body2" color="text.secondary">{hodRemarks.concerns}</Typography>
                                        </Box>
                                    )}
                                    {hodRemarks.suggestions && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Suggestions:</Typography>
                                            <Typography variant="body2" color="text.secondary">{hodRemarks.suggestions}</Typography>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <PendingIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Awaiting HOD Review
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled">
                                        Remarks will appear here once the HOD completes their review.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, border: '1px solid', borderColor: principalRemarks ? 'primary.main' : 'divider', borderRadius: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <RateReviewIcon color={principalRemarks ? 'primary' : 'disabled'} />
                                <Typography variant="h6" component="h2" sx={{ color: principalRemarks ? 'primary.main' : 'text.secondary' }}>
                                    Principal's Remarks
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            {principalRemarks ? (
                                <Typography variant="body2" color="text.secondary">{principalRemarks}</Typography>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <PendingIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Awaiting Principal's Remarks
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled">
                                        Remarks will appear here once the Principal reviews your appraisal.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
};

export default Dashboard;