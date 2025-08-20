import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import MUI components for the new design
import { Box, Typography, Paper, Button, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonIcon from '@mui/icons-material/Person';

const HodDashboard = () => {
    const navigate = useNavigate();
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
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

    const handleOpenProfileModal = (profile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsModalOpen(false);
        setSelectedProfile(null);
    };

    // --- THIS IS THE CORRECTED, FULL FUNCTION ---
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
    
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                HOD Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Review and manage the appraisals for your department faculty.
            </Typography>

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