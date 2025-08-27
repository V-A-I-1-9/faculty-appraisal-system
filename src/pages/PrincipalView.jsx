import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import MUI components for the new design
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, TextField, Chip, Avatar } from '@mui/material';
import { toast } from 'react-toastify';

const PrincipalView = () => {
    const { appraisalId } = useParams();
    const [loading, setLoading] = useState(true);
    const [appraisalData, setAppraisalData] = useState(null);
    const [error, setError] = useState(null);

    // State for Principal's own remarks
    const [principalRemarks, setPrincipalRemarks] = useState('');

    useEffect(() => {
        const fetchAppraisal = async () => {
            if (!appraisalId) return;
            const { data, error } = await supabase.from('appraisals').select(`*, profile:profiles (*, department:departments(*))`).eq('id', appraisalId).single();

            if (error) {
                setError("Failed to load appraisal data.");
            } else {
                setAppraisalData(data);
                setPrincipalRemarks(data.principal_remarks || '');
            }
            setLoading(false);
        };
        fetchAppraisal();
    }, [appraisalId]);
    // --- Faculty Category Calculation ---
    const facultyCategory = useMemo(() => {
        if (!appraisalData || !appraisalData.grand_api_score_final) return 'N/A';
        
        // The category is based on the FINAL HOD-reviewed scores.
        const p2_hr = appraisalData.part2_hr_score;
        const p3_hr = appraisalData.part3_hr_score;
        const p4_hr = appraisalData.part4_hr_score;
        const grand_score = appraisalData.grand_api_score_final;

        // Calculate percentage of allotted marks for each part
        const p2_percent = (p2_hr / 350) * 100;
        const p3_percent = (p3_hr / 170) * 100;
        const p4_percent = (p4_hr / 180) * 100;

        if (p2_percent >= 60 && p3_percent >= 60 && p4_percent >= 60 && grand_score >= 70) return 'A';
        if (p2_percent >= 50 && p3_percent >= 50 && p4_percent >= 50 && grand_score >= 60) return 'B';
        if (p2_percent >= 50 && p3_percent <= 50 && p4_percent >= 50 && grand_score >= 55) return 'C';
        if (p2_percent >= 50 && p3_percent >= 50 && p4_percent <= 50 && grand_score >= 50) return 'D';
        if (p2_percent >= 50 && p3_percent <= 50 && p4_percent <= 50 && grand_score >= 40) return 'E';
        if (p2_percent < 50 && p3_percent < 50 && p4_percent < 50) return 'F';
        
        return 'Not Categorized';
    }, [appraisalData]);

    const handleSaveRemarks = async () => {
        const { error } = await supabase
            .from('appraisals')
            .update({ principal_remarks: principalRemarks })
            .eq('id', appraisalId);

        if (error) {
            toast.error("Error saving remarks: " + error.message);
        } else {
            toast.success("Principal's remarks saved successfully!");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    if (error) return <div><p style={{color: 'red'}}>{error}</p><Link to="/principal-dashboard">Back to Dashboard</Link></div>;
    // Helper function to determine the color of the category chip
    const getCategoryChipColor = (category) => {
        switch (category) {
            case 'A':
            case 'B':
                return 'success';
            case 'C':
            case 'D':
                return 'warning';
            case 'E':
            case 'F':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8}>
                    <Typography variant="h4" component="h1">Appraisal Review</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {appraisalData?.profile?.full_name} ({appraisalData?.profile?.department?.name})
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: {sm: 'right'} }}>
                    <Link to="/principal-dashboard" style={{ textDecoration: 'none' }}>
                        <Button variant="outlined">Back to Dashboard</Button>
                    </Link>
                </Grid>
            </Grid>
            
            <Grid container spacing={4}>
                {/* Left Column: Score Breakdowns and HOD Remarks */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Score Summary</Typography>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Part II */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body1">Part II: Teaching & Learning</Typography>
                            <Box sx={{ textAlign: 'right' }}>
                                <Chip label={`SR: ${appraisalData?.part2_sr_score?.toFixed(2)}`} variant="outlined" size="small" />
                                <Chip label={`HR: ${appraisalData?.part2_hr_score?.toFixed(2)}`} color="primary" sx={{ ml: 1 }} />
                            </Box>
                        </Box>
                        <Divider light />

                        {/* Part III */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                            <Typography variant="body1">Part III: R&D Contributions</Typography>
                             <Box sx={{ textAlign: 'right' }}>
                                <Chip label={`SR: ${appraisalData?.part3_sr_score?.toFixed(2)}`} variant="outlined" size="small" />
                                <Chip label={`HR: ${appraisalData?.part3_hr_score?.toFixed(2)}`} color="primary" sx={{ ml: 1 }} />
                            </Box>
                        </Box>
                        <Divider light />

                        {/* Part IV */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Typography variant="body1">Part IV: Administration & Contribution</Typography>
                             <Box sx={{ textAlign: 'right' }}>
                                <Chip label={`SR: ${appraisalData?.part4_sr_score?.toFixed(2)}`} variant="outlined" size="small" />
                                <Chip label={`HR: ${appraisalData?.part4_hr_score?.toFixed(2)}`} color="primary" sx={{ ml: 1 }} />
                            </Box>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>HOD's Remarks</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Strengths:</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>{appraisalData?.hod_remarks?.strengths || 'N/A'}</Typography>
                        <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Concerns:</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>{appraisalData?.hod_remarks?.concerns || 'N/A'}</Typography>
                        <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Suggestions:</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>{appraisalData?.hod_remarks?.suggestions || 'N/A'}</Typography>
                    </Paper>
                </Grid>

                {/* Right Column: Final Scores and Principal Actions */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 88 }}>
                        <Typography variant="h6" gutterBottom>Final Evaluation</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ textAlign: 'center', my: 3 }}>
                            <Typography variant="overline">Final Grand API Score (HR)</Typography>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
                                {appraisalData?.grand_api_score_final?.toFixed(2) || 'N/A'}
                            </Typography>
                        </Box>
                         <Box sx={{ textAlign: 'center', my: 3 }}>
                            <Typography variant="overline">Faculty Category</Typography>
                            <Chip 
                                label={facultyCategory} 
                                color={getCategoryChipColor(facultyCategory)} 
                                sx={{ fontSize: '1.5rem', p: 2, mt: 1, fontWeight: 'bold' }} 
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Principal's Remarks</Typography>
                        <TextField
                            label="Add your final remarks here"
                            multiline
                            rows={4}
                            fullWidth
                            value={principalRemarks}
                            onChange={(e) => setPrincipalRemarks(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={handleSaveRemarks}
                        >
                            Save Remarks
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PrincipalView;