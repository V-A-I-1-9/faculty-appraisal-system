import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import MUI components for the new design
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, TextField, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

// --- FORM COMPONENT IMPORTS (same as HodReview) ---
import Part2_Section7a from '../components/appraisal/Part2_Section7a';
import Part2_Section7c from '../components/appraisal/Part2_Section7c';
import Part2_Section7d from '../components/appraisal/Part2_Section7d';
import Part2_Section8a from '../components/appraisal/Part2_Section8a';
import Part2_Section8b from '../components/appraisal/Part2_Section8b';
import Part2_Section8c_Regular from '../components/appraisal/Part2_Section8c_Regular';
import Part2_Section8d from '../components/appraisal/Part2_Section8d';
import Part2_Section9a from '../components/appraisal/Part2_Section9a';
import Part2_Section9b from '../components/appraisal/Part2_Section9b';
import Part2_Section9c from '../components/appraisal/Part2_Section9c';
import Part2_BSH_Sections from '../components/appraisal/Part2_BSH_Sections';
import Part3_Sections from '../components/appraisal/Part3_Sections';
import Part3_Section10c from '../components/appraisal/Part3_Section10c';
import Part4_Sections from '../components/appraisal/Part4_Sections';

const PrincipalView = () => {
    const { appraisalId } = useParams();
    const [loading, setLoading] = useState(true);
    const [appraisalData, setAppraisalData] = useState(null);
    const [error, setError] = useState(null);

    // State for Principal's own remarks
    const [principalRemarks, setPrincipalRemarks] = useState('');
    // Track if remarks already existed when the page loaded (i.e. review was completed before)
    const [hasExistingRemarks, setHasExistingRemarks] = useState(false);
    // Whether the text field is in edit mode (unlocked)
    const [isEditing, setIsEditing] = useState(false);
    // Confirmation dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        const fetchAppraisal = async () => {
            if (!appraisalId) return;
            const { data, error } = await supabase.from('appraisals').select(`*, profile:profiles (*, department:departments(*))`).eq('id', appraisalId).single();

            if (error) {
                setError("Failed to load appraisal data.");
            } else {
                setAppraisalData(data);
                setPrincipalRemarks(data.principal_remarks || '');
                // If remarks already exist, start in read-only (locked) mode
                if (data.principal_remarks && data.principal_remarks.trim() !== '') {
                    setHasExistingRemarks(true);
                    setIsEditing(false);
                } else {
                    // No remarks yet — start in edit mode
                    setHasExistingRemarks(false);
                    setIsEditing(true);
                }
            }
            setLoading(false);
        };
        fetchAppraisal();
    }, [appraisalId]);

    // --- Faculty Category Calculation ---
    const facultyCategory = useMemo(() => {
        if (!appraisalData || !appraisalData.grand_api_score_final) return 'N/A';
        
        const p2_hr = appraisalData.part2_hr_score;
        const p3_hr = appraisalData.part3_hr_score;
        const p4_hr = appraisalData.part4_hr_score;
        const grand_score = appraisalData.grand_api_score_final;

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
            setHasExistingRemarks(true);
            setIsEditing(false);
        }
    };

    const handleEditClick = () => {
        setEditDialogOpen(true);
    };

    const handleConfirmEdit = () => {
        setEditDialogOpen(false);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditDialogOpen(false);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    if (error) return <div><p style={{color: 'red'}}>{error}</p><Link to="/principal-dashboard">Back to Dashboard</Link></div>;

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

    // A no-op function to satisfy the setHodData prop requirement on components
    // since the principal view is read-only, no state changes will occur
    const noop = () => {};

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
            
            {/* --- Final Evaluation Card (sticky on top) --- */}
            <Paper sx={{ p: 3, mb: 4, position: 'sticky', top: 64, zIndex: 10 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="overline">Final Grand API Score (HR)</Typography>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
                                {appraisalData?.grand_api_score_final?.toFixed(2) || 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="overline">Faculty Category</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Chip 
                                    label={facultyCategory} 
                                    color={getCategoryChipColor(facultyCategory)} 
                                    sx={{ fontSize: '1.2rem', p: 1.5, fontWeight: 'bold' }} 
                                />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="overline">Score Breakdown</Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 1 }}>
                                <Chip label={`P2: ${appraisalData?.part2_hr_score?.toFixed(1)}/350`} size="small" color="primary" variant="outlined" />
                                <Chip label={`P3: ${appraisalData?.part3_hr_score?.toFixed(1)}/170`} size="small" color="primary" variant="outlined" />
                                <Chip label={`P4: ${appraisalData?.part4_hr_score?.toFixed(1)}/180`} size="small" color="primary" variant="outlined" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- Full Appraisal Form (Read-Only) --- */}

            {/* Part II Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Part II: Teaching, Learning and Evaluation</Typography>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip label={`SR Score: ${appraisalData?.part2_sr_score?.toFixed(2) || '0.00'}`} variant="outlined" size="small" />
                        <Chip label={`HR Score: ${appraisalData?.part2_hr_score?.toFixed(2) || '0.00'} / 350`} color="primary" sx={{ml: 1}} />
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Part2_Section7a isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section7a} hodData={appraisalData?.part2_hr_data?.section7a} setHodData={noop} />
                    <Part2_Section7c isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section7c} hodData={appraisalData?.part2_hr_data?.section7c} setHodData={noop} />
                    {!appraisalData?.profile?.department?.is_basic_science && <Part2_Section7d isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section7d} hodData={appraisalData?.part2_hr_data?.section7d} setHodData={noop} passPercentages={(appraisalData?.part2_data?.section7a || []).map(s => s.passPercent)} />}
                    {appraisalData?.profile?.department?.is_basic_science ? (<>
                           <Part2_BSH_Sections isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.sectionBSH} hodData={appraisalData?.part2_hr_data?.sectionBSH} setHodData={noop} />
                           <Part2_Section8d isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section8d} hodData={appraisalData?.part2_hr_data?.section8d} setHodData={noop} />
                        </>) : (<> 
                            <Part2_Section8a isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section8a} hodData={appraisalData?.part2_hr_data?.section8a} setHodData={noop} /> 
                            <Part2_Section8b isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section8b} hodData={appraisalData?.part2_hr_data?.section8b} setHodData={noop} /> 
                            <Part2_Section8c_Regular isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section8c_reg} hodData={appraisalData?.part2_hr_data?.section8c_reg} setHodData={noop} />
                        </>)
                    }
                    <Part2_Section9a isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section9a} hodData={appraisalData?.part2_hr_data?.section9a} setHodData={noop} />
                    <Part2_Section9b isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section9b} hodData={appraisalData?.part2_hr_data?.section9b} setHodData={noop} />
                    <Part2_Section9c isHodView={true} isReadOnly={true} data={appraisalData?.part2_data?.section9c} hodData={appraisalData?.part2_hr_data?.section9c} setHodData={noop} />
                </Box>
            </Paper>

            {/* Part III Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Part III: R&D Contributions</Typography>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip label={`SR Score: ${appraisalData?.part3_sr_score?.toFixed(2) || '0.00'}`} variant="outlined" size="small" />
                        <Chip label={`HR Score: ${appraisalData?.part3_hr_score?.toFixed(2) || '0.00'} / 170`} color="primary" sx={{ml: 1}} />
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Part3_Sections isHodView={true} isReadOnly={true} data={appraisalData?.part3_data} hodData={appraisalData?.part3_hr_data} setHodData={noop} />
                    <Part3_Section10c isHodView={true} isReadOnly={true} data={appraisalData?.part3_data?.section10c} hodData={appraisalData?.part3_hr_data?.section10c} setHodData={noop} journalsPublished={appraisalData?.part3_data?.journals_published} />
                </Box>
            </Paper>

            {/* Part IV Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Part IV: Administration & Contribution</Typography>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip label={`SR Score: ${appraisalData?.part4_sr_score?.toFixed(2) || '0.00'}`} variant="outlined" size="small" />
                        <Chip label={`HR Score: ${appraisalData?.part4_hr_score?.toFixed(2) || '0.00'} / 180`} color="primary" sx={{ml: 1}} />
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Part4_Sections isHodView={true} isReadOnly={true} data={appraisalData?.part4_data} hodData={appraisalData?.part4_hr_data} setHodData={noop} />
            </Paper>

            {/* HOD Remarks Card (Read-Only) */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Typography variant="h6" gutterBottom>HOD's Remarks</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Strengths:</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>{appraisalData?.hod_remarks?.strengths || 'N/A'}</Typography>
                <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Concerns:</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>{appraisalData?.hod_remarks?.concerns || 'N/A'}</Typography>
                <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Suggestions:</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>{appraisalData?.hod_remarks?.suggestions || 'N/A'}</Typography>
            </Paper>

            {/* Principal's Remarks Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">Principal's Remarks</Typography>
                    {hasExistingRemarks && !isEditing && (
                        <Chip icon={<CheckCircleIcon />} label="Review Complete" color="success" size="small" />
                    )}
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Read-only view (when remarks exist and not editing) */}
                {hasExistingRemarks && !isEditing ? (
                    <Box>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderColor: 'success.light' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {principalRemarks}
                            </Typography>
                        </Paper>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<EditIcon />}
                            onClick={handleEditClick}
                            color="warning"
                        >
                            Edit Remarks
                        </Button>
                    </Box>
                ) : (
                    /* Edit mode (new remarks or unlocked for editing) */
                    <Box>
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
                            disabled={!principalRemarks.trim()}
                        >
                            Save Remarks
                        </Button>
                        {hasExistingRemarks && (
                            <Button
                                variant="text"
                                fullWidth
                                sx={{ mt: 1 }}
                                onClick={() => {
                                    setPrincipalRemarks(appraisalData?.principal_remarks || '');
                                    setIsEditing(false);
                                }}
                                color="inherit"
                            >
                                Cancel
                            </Button>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Edit Confirmation Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCancelEdit}>
                <DialogTitle>Edit Remarks?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You have already completed the review for <strong>{appraisalData?.profile?.full_name}</strong>. 
                        Do you want to edit your remarks?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmEdit} variant="contained" color="warning" startIcon={<EditIcon />}>
                        Yes, Edit Remarks
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PrincipalView;