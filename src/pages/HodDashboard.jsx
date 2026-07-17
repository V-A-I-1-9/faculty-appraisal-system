import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import MUI components for the new design
import { Box, Typography, Paper, Button, Chip, CircularProgress, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Avatar } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import Divider from '@mui/material/Divider';

const HodDashboard = () => {
    const navigate = useNavigate();
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [myAppraisalInfo, setMyAppraisalInfo] = useState({ status: 'Not Started', id: null });
    // State for HOD's own appraisal details
    const [principalRemarks, setPrincipalRemarks] = useState('');
    const [finalApiScore, setFinalApiScore] = useState(null);
    const [hrScores, setHrScores] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch the HOD's own appraisal status + remarks + scores
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const currentYear = new Date().getFullYear();
                const { data: myAppraisal } = await supabase
                    .from('appraisals')
                    .select('id, status, principal_remarks, grand_api_score_final, part2_hr_score, part3_hr_score, part4_hr_score')
                    .eq('user_id', user.id)
                    .eq('assessment_year_start', currentYear)
                    .single();
                if (myAppraisal) {
                    setMyAppraisalInfo({ status: myAppraisal.status, id: myAppraisal.id });
                    setPrincipalRemarks(myAppraisal.principal_remarks || '');
                    setFinalApiScore(myAppraisal.grand_api_score_final || null);
                    if (myAppraisal.part2_hr_score != null) {
                        setHrScores({
                            part2: myAppraisal.part2_hr_score,
                            part3: myAppraisal.part3_hr_score,
                            part4: myAppraisal.part4_hr_score,
                        });
                    }
                }
            }

            // Fetch department staff appraisals (existing logic)
            const { data, error } = await supabase
                .from('profiles')
                .select(`*, department:departments(name), appraisals(id, status, assessment_year_start)`)
                .eq('role', 'staff');

            if (error) {
                console.error("Error fetching faculty list:", error);
            } else {
                const currentYear = new Date().getFullYear();
                const processedList = data.map(faculty => {
                    const latestAppraisal = faculty.appraisals.find(app => app.assessment_year_start === currentYear);
                    return {
                        ...faculty,
                        appraisal_status: latestAppraisal ? latestAppraisal.status : 'Not Started',
                        appraisal_id: latestAppraisal ? latestAppraisal.id : null,
                    };
                });
                setFacultyList(processedList);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Grade calculation for HOD's own appraisal
    const myGrade = useMemo(() => {
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

    const handleOpenProfileModal = (profile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsModalOpen(false);
        setSelectedProfile(null);
    };

    const renderStatusChip = (status) => {
        switch (status) {
            case 'submitted_by_staff':
                return <Chip icon={<RateReviewIcon />} label="Pending Review" color="warning" />;
            case 'reviewed_by_hod':
                return <Chip icon={<CheckCircleIcon />} label="Review Complete" color="success" />;
            case 'draft':
                return <Chip icon={<PendingIcon />} label="Draft" color="primary" variant="outlined" />;
            default:
                return <Chip icon={<HourglassEmptyIcon />} label="Not Started" variant="outlined" />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const isMyAppraisalSubmitted = myAppraisalInfo.status === 'submitted_by_staff' || myAppraisalInfo.status === 'reviewed_by_hod';
    
    // Helper to get the status chip for the HOD's own appraisal
    const getMyAppraisalChip = () => {
        switch (myAppraisalInfo.status) {
            case 'draft':
                return <Chip icon={<PendingIcon />} label="In Progress (Draft)" color="primary" />;
            case 'submitted_by_staff':
                return <Chip icon={<CheckCircleIcon />} label="Submitted to Principal" color="success" />;
            case 'reviewed_by_hod':
                return <Chip icon={<CheckCircleIcon />} label="Review Complete" color="secondary" />;
            default:
                return <Chip icon={<HourglassEmptyIcon />} label="Not Started" variant="outlined" />;
        }
    };

    // Action button for HOD's own appraisal
    const getMyActionButton = () => {
        if (isMyAppraisalSubmitted) {
            return (
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate('/appraisal')}
                >
                    View My Appraisal
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
                {myAppraisalInfo.status === 'Not Started' ? 'Start Appraisal' : 'Continue Appraisal'}
            </Button>
        );
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                HOD Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                Review and manage the appraisals for your department faculty.
            </Typography>

            {/* --- Grade & Score Card (shown when HOD's appraisal has been reviewed) --- */}
            {myGrade && finalApiScore != null && (
                <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(156,39,176,0.08) 100%)', border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: { xs: 3, sm: 6 } }}>
                        {/* Grade Badge */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 500, color: 'text.secondary' }}>My Grade</Typography>
                            <Avatar sx={{ 
                                bgcolor: getGradeColor(myGrade), 
                                width: 72, height: 72, mx: 'auto', mt: 0.5,
                                fontSize: '2rem', fontWeight: 700
                            }}>
                                {myGrade}
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
            )}

            {/* --- MY APPRAISAL CARD --- */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h6" component="h2">My Appraisal</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">Status:</Typography>
                            {getMyAppraisalChip()}
                        </Box>
                    </Box>
                    {getMyActionButton()}
                </Box>
            </Paper>

            {/* --- Principal Remarks Card — always visible once submitted --- */}
            {isMyAppraisalSubmitted && (
                <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: principalRemarks ? 'primary.main' : 'divider', borderRadius: 2 }}>
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
            )}

            {/* --- Review Progress Card --- */}
            {(() => {
                const total = facultyList.length;
                const reviewed = facultyList.filter(f => f.appraisal_status === 'reviewed_by_hod').length;
                const pending = total - reviewed;
                const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;
                const isComplete = percentage === 100;

                if (total === 0) return null;

                return (
                    <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: isComplete ? 'success.light' : 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <AssignmentTurnedInIcon color={isComplete ? 'success' : 'primary'} />
                            <Typography variant="h6" component="h2">
                                Review Progress
                            </Typography>
                            <Chip 
                                label={`${percentage}%`} 
                                size="small" 
                                color={isComplete ? 'success' : 'primary'} 
                                sx={{ ml: 'auto', fontWeight: 700, fontSize: '0.85rem' }} 
                            />
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            color={isComplete ? 'success' : 'primary'}
                            sx={{ height: 10, borderRadius: 5, mb: 2, bgcolor: isComplete ? 'success.50' : 'grey.200' }} 
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                You have completed <strong style={{ color: isComplete ? '#2e7d32' : '#1976d2' }}>{reviewed} out of {total}</strong> reviews
                            </Typography>
                            {isComplete ? (
                                <Chip icon={<CheckCircleIcon />} label="All reviews complete!" color="success" size="small" variant="outlined" />
                            ) : (
                                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                                    {pending} review{pending !== 1 ? 's' : ''} remaining
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                );
            })()}

            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Department Faculty Appraisals</Typography>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="faculty table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Staff Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Staff ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Appraisal Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facultyList.length > 0 ? (
                            facultyList.map((faculty) => (
                                <TableRow key={faculty.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{faculty.full_name}</TableCell>
                                    <TableCell>{faculty.staff_id}</TableCell>
                                    <TableCell>{renderStatusChip(faculty.appraisal_status)}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <IconButton color="primary" onClick={() => handleOpenProfileModal(faculty)} title="View Profile">
                                                <PersonIcon />
                                            </IconButton>
                                            {faculty.appraisal_status === 'submitted_by_staff' ? (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    component={Link}
                                                    to={`/hod/review/${faculty.appraisal_id}`}
                                                    startIcon={<RateReviewIcon />}
                                                >
                                                    Review
                                                </Button>
                                            ) : (
                                                <Button variant="contained" size="small" disabled>Review</Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="text.secondary" sx={{ p: 3 }}>
                                        No staff members found in your department.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Profile View Dialog (Modal) */}
            <Dialog open={isModalOpen} onClose={handleCloseProfileModal} fullWidth maxWidth="sm">
                <DialogTitle>Staff Profile</DialogTitle>
                <DialogContent>
                    {selectedProfile && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}><Typography><strong>Name:</strong> {selectedProfile.full_name}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Staff ID:</strong> {selectedProfile.staff_id}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {selectedProfile.email}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Contact:</strong> {selectedProfile.contact_number || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Department:</strong> {selectedProfile.department.name}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Designation:</strong> {selectedProfile.present_designation || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Date Acquired:</strong> {selectedProfile.date_acquired || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Highest Qualification:</strong> {selectedProfile.highest_qualification}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Specialization:</strong> {selectedProfile.specialization}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Research Guide:</strong> {selectedProfile.is_research_guide ? 'Yes' : 'No'}</Typography></Grid>
                            {selectedProfile.is_research_guide && <Grid item xs={12} sm={6}><Typography><strong>Candidates Supervised:</strong> {selectedProfile.supervised_candidates_count}</Typography></Grid>}
                            <Grid item xs={12} sm={6}><Typography><strong>Years at MITM:</strong> {selectedProfile.service_years_mitm}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Previous Experience:</strong> {selectedProfile.previous_experience} years</Typography></Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProfileModal}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HodDashboard;