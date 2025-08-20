import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import additional MUI components for a richer UI
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Chip } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // New state to hold the status of the current appraisal
    const [appraisalInfo, setAppraisalInfo] = useState({ status: 'Not Started', id: null });

    useEffect(() => {
        const checkUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }

            // Updated query to also fetch the department name and the latest appraisal status
            const { data, error } = await supabase
                .from('profiles')
                .select(`*, department:departments(name), appraisals(id, status, assessment_year_start)`)
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            } else if (data) {
                if (data.role === 'principal') { navigate('/principal-dashboard'); return; }
                if (data.role === 'hod') { navigate('/hod-dashboard'); return; }

                setUserProfile(data);

                // Find the appraisal for the current year and set its status
                const currentYear = new Date().getFullYear();
                const currentAppraisal = data.appraisals.find(app => app.assessment_year_start === currentYear);
                if (currentAppraisal) {
                    setAppraisalInfo({ status: currentAppraisal.status, id: currentAppraisal.id });
                }
            } else {
                navigate('/create-profile');
            }
            setLoading(false);
        };
        checkUserProfile();
    }, [navigate]);
    
    // A better loading indicator
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Helper to determine chip color and icon based on status
    const getStatusChip = () => {
        switch (appraisalInfo.status) {
            case 'draft':
                return <Chip icon={<PendingIcon />} label="In Progress (Draft)" color="primary" />;
            case 'submitted_by_staff':
                return <Chip icon={<CheckCircleIcon />} label="Submitted to HOD" color="success" />;
            case 'reviewed_by_hod':
                 return <Chip icon={<CheckCircleIcon />} label="Review Complete" color="secondary" />;
            default:
                return <Chip label="Not Started" variant="outlined" />;
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Welcome back, {userProfile?.full_name || 'User'}!
            </Typography>

            <Grid container spacing={4}>
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
                            Click the button below to fill out or review your self-appraisal form for the current assessment period.
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<EditNoteIcon />}
                            onClick={() => navigate('/appraisal')}
                        >
                            {appraisalInfo.status === 'Not Started' ? 'Start Appraisal' : 'View / Edit Appraisal'}
                        </Button>
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
            </Grid>
        </Box>
    );
};

export default Dashboard;