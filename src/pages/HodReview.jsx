import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// --- UI IMPORTS ---
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, TextField, Chip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// --- FORM COMPONENT IMPORTS ---
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

const HodReview = () => {
    const { appraisalId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appraisalData, setAppraisalData] = useState(null);
    const [error, setError] = useState(null);

    // State for HOD's own ratings and remarks for ALL parts
    const [hodPart2Data, setHodPart2Data] = useState({});
    const [hodPart3Data, setHodPart3Data] = useState({});
    const [hodPart4Data, setHodPart4Data] = useState({});
    const [hodRemarks, setHodRemarks] = useState({ strengths: '', concerns: '', suggestions: '' });

    useEffect(() => {
        const fetchAppraisal = async () => {
            if (!appraisalId) return;
            const { data, error } = await supabase.from('appraisals').select(`*, profile:profiles (*, department:departments(*))`).eq('id', appraisalId).single();
            if (error) { setError("Failed to load appraisal data."); }
            else {
                setAppraisalData(data);
                // Pre-fill HR data with existing HR data, or fall back to SR data
                setHodPart2Data(data.part2_hr_data || data.part2_data || {});
                setHodPart3Data(data.part3_hr_data || data.part3_data || {});
                setHodPart4Data(data.part4_hr_data || data.part4_data || {});
                setHodRemarks(data.hod_remarks || { strengths: '', concerns: '', suggestions: '' });
            }
            setLoading(false);
        };
        fetchAppraisal();
    }, [appraisalId]);
    // --- HOD SCORE CALCULATIONS ---

    const totalPart2_HR_Score = useMemo(() => {
        const p2 = hodPart2Data || {};
        let rawScore = 0;
        const passPercentages = (p2.section7a || []).map(s => s.passPercent);
        const scores7a = (p2.section7a || []).map(sub => (parseFloat(sub.passPercent) || 0) * 0.01 * 30);
        rawScore += scores7a.length > 0 ? scores7a.reduce((a, b) => a + b, 0) / scores7a.length : 0;
        rawScore += parseFloat(p2.section7c?.score || 0);
        const scores7d = (p2.section7d || []).map((sub, index) => { const pass = parseFloat(passPercentages[index] || 0); const high = parseFloat(sub.high_scorers_percent || 0); return pass > 0 ? (high / pass) * 40 : 0; });
        rawScore += scores7d.length > 0 ? scores7d.reduce((a, b) => a + b, 0) / scores7d.length : 0;
        const count9a = parseInt(p2.section9a?.programs?.length || 0, 10); if (count9a >= 3) rawScore += 45; else if (count9a === 2) rawScore += 40; else if (count9a === 1) rawScore += 35;
        rawScore += parseFloat(p2.section9b?.score || 0);
        const count9c = parseInt(p2.section9c?.programs?.length || 0, 10); if (count9c >= 2) rawScore += 30; else if (count9c === 1) rawScore += 25;
        if (appraisalData?.profile?.department?.is_basic_science) {
            const bshData = p2.sectionBSH || {}; const toppers = parseInt(bshData.topper_rank || 0, 10); if (toppers === 1) rawScore += 30; else if (toppers === 2) rawScore += 25; else if (toppers === 3) rawScore += 20; else if (toppers === 4) rawScore += 15; else if (toppers === 5) rawScore += 10;
            const verticalProg = parseInt(bshData.vertical_progression_percent || 0, 10); if (verticalProg >= 91) rawScore += 40; else if (verticalProg >= 81) rawScore += 35; else if (verticalProg >= 75) rawScore += 30; else if (verticalProg >= 61) rawScore += 25; else if (verticalProg >= 51) rawScore += 20; else if (verticalProg >= 41) rawScore += 15; else if (verticalProg >= 1) rawScore += 10;
            const fcdCount = parseInt(bshData.fcd_count || 0, 10); const totalMentees = parseInt(bshData.total_mentees || 0, 10);
            if (totalMentees > 0) { const fcdPercent = (fcdCount / totalMentees) * 100; if (fcdPercent >= 60) rawScore += 40; else if (fcdPercent >= 50) rawScore += 30; else if (fcdPercent >= 40) rawScore += 20; else if (fcdPercent >= 30) rawScore += 10; }
            if (p2.section8d?.is_completed === 'yes') rawScore += 10;
        } else {
            if (parseInt(p2.section8a?.count || 0, 10) >= 1) rawScore += 40;
            const { selectedOption, details } = p2.section8b || {};
            switch (selectedOption) { case 'best_project': if (details?.place === '1') rawScore += 60; else if (details?.place === '2') rawScore += 55; else if (details?.place === '3') rawScore += 50; break; case 'exhibited': if (details?.status === 'won') rawScore += 60; else if (details?.status === 'exhibited') rawScore += 40; break; case 'funded': const funds = parseFloat(details?.amount || 0); if (funds >= 5000) rawScore += 60; else if (funds > 0) rawScore += 50; break; case 'publication': if (parseInt(details?.count || 0, 10) >= 1) rawScore += 60; break; default: break; }
            const gradPercent = parseInt(p2.section8c_reg?.graduated_percent || 0, 10); if (gradPercent >= 90) rawScore += 30; else if (gradPercent >= 81) rawScore += 25; else if (gradPercent >= 71) rawScore += 20; else if (gradPercent >= 61) rawScore += 15;
        }
        return Math.min(rawScore, 350);
    }, [hodPart2Data, appraisalData]);

    const totalPart3_HR_Score = useMemo(() => {
        const d = hodPart3Data || {};
        let rawScore = 0;
        const journalCount = (d.journals || []).filter(j => j.name).length; if (journalCount >= 2) rawScore += 20; else if (journalCount === 1) rawScore += 15;
        const conferences = parseInt(d.conferences_presented || 0, 10); if (conferences >= 3) rawScore += 20; else if (conferences === 2) rawScore += 15; else if (conferences === 1) rawScore += 10;
        const { selectedOption, details } = d.section10c || {};
        const totalJournals = (appraisalData?.part3_data?.journals || []).filter(j => j.name).length;
        switch (selectedOption) { case 'scopus': const indexedPapers = (details?.papers || []).filter(p=>p.name).length; if (totalJournals > 0 && indexedPapers > 0) { rawScore += Math.min((indexedPapers / totalJournals) * 40, 40); } break; case 'chapters': const chapters = parseInt(details?.chapters_count || 0, 10); if (chapters >= 5) rawScore += 40; else if (chapters === 4) rawScore += 35; else if (chapters === 3) rawScore += 30; else if (chapters === 2) rawScore += 25; else if (chapters === 1) rawScore += 20; break; case 'books': const prescribed = details?.prescribed_status || ''; if (prescribed === 'two_plus') rawScore += 40; else if (prescribed === 'one') rawScore += 35; else if (prescribed === 'authored') rawScore += 30; break; default: break; }
        if (d.proposal_status === 'submitted') rawScore += 20;
        if (d.project_amount === 'above_4L') rawScore += 30; else if (d.project_amount === '1L_to_4L') rawScore += 25; else if (d.project_amount === 'below_1L') rawScore += 20;
        if (d.consultancy_amount === 'above_1L') rawScore += 20; else if (d.consultancy_amount === 'below_1L') rawScore += 15;
        if (d.patent_status === 'awarded') rawScore += 20; else if (d.patent_status === 'applied') rawScore += 15;
        return Math.min(rawScore, 170);
    }, [hodPart3Data, appraisalData]);

    const totalPart4_HR_Score = useMemo(() => {
        const d = hodPart4Data || {};
        let rawScore = 0;
        rawScore += parseFloat(d.punctuality_13a || 0); rawScore += parseFloat(d.behavior_13b || 0); rawScore += parseFloat(d.performance_13c || 0); rawScore += parseFloat(d.culture_13d || 0); rawScore += parseFloat(d.mentoring_13e || 0); rawScore += parseFloat(d.teamwork_13f || 0); rawScore += parseFloat(d.preparedness_14a || 0); rawScore += parseFloat(d.assessment_14b || 0);
        if (d.activities_14c === 'co_collab') rawScore += 20; else if (d.activities_14c === 'co_ind') rawScore += 15; else if (d.activities_14c === 'extra_collab') rawScore += 10;
        if (d.responsibilities_15a === 'yes') rawScore += 20;
        return Math.min(rawScore, 180);
    }, [hodPart4Data]);
    const handleSaveHodReview = async (showAlert = true) => {
        const { error } = await supabase.from('appraisals').update({
            part2_hr_data: hodPart2Data, part3_hr_data: hodPart3Data, part4_hr_data: hodPart4Data,
            hod_remarks: hodRemarks,
            part2_hr_score: totalPart2_HR_Score, part3_hr_score: totalPart3_HR_Score, part4_hr_score: totalPart4_HR_Score,
        }).eq('id', appraisalId);
        if(error) { if (showAlert) alert("Error saving review: " + error.message); } 
        else { if (showAlert) alert("HOD Review draft saved successfully!"); }
    };

    const handleFinalizeReview = async () => {
        const confirmation = window.confirm("Are you sure you want to finalize this review? It will be sent to the Principal and can no longer be edited.");
        if(confirmation) {
            setLoading(true);
            
            const experience = (appraisalData?.profile?.service_years_mitm || 0) + (appraisalData?.profile?.previous_experience || 0);
            const p2 = totalPart2_HR_Score / 350;
            const p3 = totalPart3_HR_Score / 170;
            const p4 = totalPart4_HR_Score / 180;
            let finalScore = 0;
            if (experience < 5) { finalScore = ((p2 * 0.70) + (p3 * 0.20) + (p4 * 0.10)) * 100; } 
            else if (experience >= 5 && experience < 10) { finalScore = ((p2 * 0.60) + (p3 * 0.25) + (p4 * 0.15)) * 100; } 
            else { finalScore = ((p2 * 0.50) + (p3 * 0.30) + (p4 * 0.20)) * 100; }

            const finalUpdateData = {
                part2_hr_data: hodPart2Data, part3_hr_data: hodPart3Data, part4_hr_data: hodPart4Data,
                hod_remarks: hodRemarks,
                part2_hr_score: totalPart2_HR_Score, part3_hr_score: totalPart3_HR_Score, part4_hr_score: totalPart4_HR_Score,
                grand_api_score_final: finalScore,
                status: 'reviewed_by_hod'
            };

            const { error } = await supabase.from('appraisals').update(finalUpdateData).eq('id', appraisalId);
            
            setLoading(false);
            if(error) { alert("Finalization failed: " + error.message); } 
            else { alert("Review finalized and submitted to the Principal."); navigate('/hod-dashboard'); }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    if (error) return <div><p style={{color: 'red'}}>{error}</p><Link to="/hod-dashboard">Back to Dashboard</Link></div>;
    return (
        <Box>
            {/* --- Redesigned Sticky Header --- */}
            <Paper 
                elevation={2}
                sx={{ 
                    position: 'sticky', 
                    top: 64, // Positioned below the main AppBar
                    zIndex: 10, 
                    py: 1, 
                    px: 3, 
                    mb: 4,
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Reviewing Appraisal For:</Typography>
                        <Typography variant="body1" color="text.secondary">{appraisalData?.profile?.full_name} ({appraisalData?.profile?.staff_id})</Typography>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ textAlign: 'right', mt: { xs: 2, md: 0 } }}>
                        <Button onClick={() => handleSaveHodReview()} startIcon={<SaveIcon />} sx={{ mr: 2 }} color="secondary" variant="outlined">Save HOD Draft</Button>
                        <Button onClick={handleFinalizeReview} startIcon={<CheckCircleOutlineIcon />} variant="contained">Finalize Review</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Part II Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Part II: Teaching, Learning and Evaluation</Typography>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip label={`SR Score: ${appraisalData?.part2_sr_score?.toFixed(2) || '0.00'}`} variant="outlined" size="small" />
                        <Chip label={`HR Score: ${totalPart2_HR_Score.toFixed(2)} / 350`} color="primary" sx={{ml: 1}} />
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Part2_Section7a isHodView={true} data={appraisalData?.part2_data?.section7a} hodData={hodPart2Data?.section7a} setHodData={(d) => setHodPart2Data(prev => ({...prev, section7a: d}))} />
                    <Part2_Section7c isHodView={true} data={appraisalData?.part2_data?.section7c} hodData={hodPart2Data?.section7c} setHodData={(d) => setHodPart2Data(prev => ({...prev, section7c: d}))} />
                    {!appraisalData?.profile?.department?.is_basic_science && <Part2_Section7d isHodView={true} data={appraisalData?.part2_data?.section7d} hodData={hodPart2Data?.section7d} setHodData={(d) => setHodPart2Data(prev => ({...prev, section7d: d}))} passPercentages={(appraisalData?.part2_data?.section7a || []).map(s => s.passPercent)} />}
                    {appraisalData?.profile?.department?.is_basic_science ? (<>
                           <Part2_BSH_Sections isHodView={true} data={appraisalData?.part2_data?.sectionBSH} hodData={hodPart2Data?.sectionBSH} setHodData={(d) => setHodPart2Data(prev => ({...prev, sectionBSH: d}))} />
                           <Part2_Section8d isHodView={true} data={appraisalData?.part2_data?.section8d} hodData={hodPart2Data?.section8d} setHodData={(d) => setHodPart2Data(prev => ({...prev, section8d: d}))} />
                        </>) : (<> 
                            <Part2_Section8a isHodView={true} data={appraisalData?.part2_data?.section8a} hodData={hodPart2Data?.section8a} setHodData={(d) => setHodPart2Data(prev => ({...prev, section8a: d}))} /> 
                            <Part2_Section8b isHodView={true} data={appraisalData?.part2_data?.section8b} hodData={hodPart2Data?.section8b} setHodData={(d) => setHodPart2Data(prev => ({...prev, section8b: d}))} /> 
                            <Part2_Section8c_Regular isHodView={true} data={appraisalData?.part2_data?.section8c_reg} hodData={hodPart2Data?.section8c_reg} setHodData={(d) => setHodPart2Data(prev => ({...prev, section8c_reg: d}))} />
                        </>)
                    }
                    <Part2_Section9a isHodView={true} data={appraisalData?.part2_data?.section9a} hodData={hodPart2Data?.section9a} setHodData={(d) => setHodPart2Data(prev => ({...prev, section9a: d}))} />
                    <Part2_Section9b isHodView={true} data={appraisalData?.part2_data?.section9b} hodData={hodPart2Data?.section9b} setHodData={(d) => setHodPart2Data(prev => ({...prev, section9b: d}))} />
                    <Part2_Section9c isHodView={true} data={appraisalData?.part2_data?.section9c} hodData={hodPart2Data?.section9c} setHodData={(d) => setHodPart2Data(prev => ({...prev, section9c: d}))} />
                </Box>
            </Paper>

            {/* Part III Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Part III: R&D Contributions</Typography>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip label={`SR Score: ${appraisalData?.part3_sr_score?.toFixed(2) || '0.00'}`} variant="outlined" size="small" />
                        <Chip label={`HR Score: ${totalPart3_HR_Score.toFixed(2)} / 170`} color="primary" sx={{ml: 1}} />
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Part3_Sections isHodView={true} data={appraisalData?.part3_data} hodData={hodPart3Data} setHodData={setHodPart3Data} />
                    <Part3_Section10c isHodView={true} data={appraisalData?.part3_data?.section10c} hodData={hodPart3Data?.section10c} setHodData={(d) => setHodPart3Data(prev => ({ ...prev, section10c: d }))} journalsPublished={appraisalData?.part3_data?.journals_published} />
                </Box>
            </Paper>

            {/* Part IV Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2">Part IV: Administration & Contribution</Typography>
                    <Box sx={{textAlign: 'right'}}>
                        <Chip label={`SR Score: ${appraisalData?.part4_sr_score?.toFixed(2) || '0.00'}`} variant="outlined" size="small" />
                        <Chip label={`HR Score: ${totalPart4_HR_Score.toFixed(2)} / 180`} color="primary" sx={{ml: 1}} />
                    </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Part4_Sections isHodView={true} data={appraisalData?.part4_data} hodData={hodPart4Data} setHodData={setHodPart4Data} />
            </Paper>

            {/* HOD Remarks Card */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                <Typography variant="h6" component="h2" gutterBottom>HOD Remarks</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField label="Strengths" multiline rows={3} fullWidth value={hodRemarks.strengths} onChange={(e) => setHodRemarks({...hodRemarks, strengths: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Concerns" multiline rows={3} fullWidth value={hodRemarks.concerns} onChange={(e) => setHodRemarks({...hodRemarks, concerns: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Suggestions" multiline rows={3} fullWidth value={hodRemarks.suggestions} onChange={(e) => setHodRemarks({...hodRemarks, suggestions: e.target.value})} />
                    </Grid>
                </Grid>
            </Paper>

            <Link to="/hod-dashboard" style={{ textDecoration: 'none' }}>
                <Button>Back to Dashboard</Button>
            </Link>
        </Box>
    );
};

export default HodReview;