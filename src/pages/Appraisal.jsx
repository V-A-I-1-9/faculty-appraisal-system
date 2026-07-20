import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// --- UI IMPORTS ---
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Chip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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

const Appraisal = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appraisalId, setAppraisalId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [part2Data, setPart2Data] = useState({});
    const [part3Data, setPart3Data] = useState({});
    const [part4Data, setPart4Data] = useState({});
    const [hodRemarks, setHodRemarks] = useState(null);
    const [principalRemarks, setPrincipalRemarks] = useState('');
    const [hrScores, setHrScores] = useState(null);
    const [finalApiScore, setFinalApiScore] = useState(null);

    const loadOrCreateAppraisal = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profileData } = await supabase.from('profiles').select(`*, department:departments(*)`).eq('id', user.id).single();
        if (profileData) setProfile(profileData);
        const currentYear = new Date().getFullYear();
        const { data, error } = await supabase.from('appraisals').select('*').eq('user_id', user.id).eq('assessment_year_start', currentYear).single();
        if (data) {
            setAppraisalId(data.id);
            if (data.status === 'submitted_by_staff' || data.status === 'reviewed_by_hod') {
                setIsSubmitted(true);
            }
            setPart2Data(data.part2_data || {});
            setPart3Data(data.part3_data || {});
            setPart4Data(data.part4_data || {});
        } else if (error && error.code === 'PGRST116') {
            const { data: newData } = await supabase.from('appraisals').insert({ user_id: user.id, assessment_year_start: currentYear, assessment_year_end: currentYear + 1, status: 'draft' }).select().single();
            if (newData) setAppraisalId(newData.id);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadOrCreateAppraisal(); }, [loadOrCreateAppraisal]);

    // Fetch remarks & HR scores when appraisal is submitted
    useEffect(() => {
        const fetchRemarks = async () => {
            if (!appraisalId || !isSubmitted) return;
            const { data } = await supabase
                .from('appraisals')
                .select('hod_remarks, principal_remarks, part2_hr_score, part3_hr_score, part4_hr_score, grand_api_score_final, status')
                .eq('id', appraisalId)
                .single();
            if (data) {
                setHodRemarks(data.hod_remarks || null);
                setPrincipalRemarks(data.principal_remarks || '');
                setHrScores({
                    part2: data.part2_hr_score,
                    part3: data.part3_hr_score,
                    part4: data.part4_hr_score,
                });
                setFinalApiScore(data.grand_api_score_final);
            }
        };
        fetchRemarks();
    }, [appraisalId, isSubmitted]);

    const totalPart2Score = useMemo(() => {
        const p2 = part2Data || {};
        let rawScore = 0;

        // Common sections
        const passPercentages = (p2.section7a || []).map(s => s.passPercent);
        const scores7a = (p2.section7a || []).map(sub => (parseFloat(sub.passPercent) || 0) * 0.01 * 30);
        rawScore += scores7a.length > 0 ? scores7a.reduce((a, b) => a + b, 0) / scores7a.length : 0;
        
        rawScore += parseFloat(p2.section7c?.score || 0);

        const scores7d = (p2.section7d || []).map((sub, index) => {
            const pass = parseFloat(passPercentages[index] || 0);
            const high = parseFloat(sub.high_scorers_percent || 0);
            return pass > 0 ? (high / pass) * 40 : 0;
        });
        rawScore += scores7d.length > 0 ? scores7d.reduce((a, b) => a + b, 0) / scores7d.length : 0;

        // --- CORRECTED LOGIC FOR 9a ---
        const count9a = (p2.section9a?.programs || []).filter(p => p.name).length;
        if (count9a >= 3) rawScore += 45; else if (count9a === 2) rawScore += 40; else if (count9a === 1) rawScore += 35;
        
        rawScore += parseFloat(p2.section9b?.score || 0);

        // --- CORRECTED LOGIC FOR 9c ---
        const count9c = (p2.section9c?.programs || []).filter(p => p.name).length;
        if (count9c >= 2) rawScore += 30; else if (count9c === 1) rawScore += 25;

        // Conditional sections
        if (profile?.department?.is_basic_science) {
            const bshData = p2.sectionBSH || {};
            const toppers = parseInt(bshData.topper_rank || 0, 10);
            if (toppers === 1) rawScore += 30; else if (toppers === 2) rawScore += 25; else if (toppers === 3) rawScore += 20; else if (toppers === 4) rawScore += 15; else if (toppers === 5) rawScore += 10;
            
            const verticalProg = parseInt(bshData.vertical_progression_percent || 0, 10);
            if (verticalProg >= 91) rawScore += 40; else if (verticalProg >= 81) rawScore += 35; else if (verticalProg >= 75) rawScore += 30; else if (verticalProg >= 61) rawScore += 25; else if (verticalProg >= 51) rawScore += 20; else if (verticalProg >= 41) rawScore += 15; else if (verticalProg >= 1) rawScore += 10;
            
            // --- CORRECTED LOGIC FOR 8c (BSH) ---
            const fcdCount = parseInt(bshData.fcd_count || 0, 10);
            const totalMentees = parseInt(bshData.total_mentees || 0, 10);
            if (totalMentees > 0) {
                const fcdPercent = (fcdCount / totalMentees) * 100;
                if (fcdPercent >= 60) rawScore += 40; else if (fcdPercent >= 50) rawScore += 30; else if (fcdPercent >= 40) rawScore += 20; else if (fcdPercent >= 30) rawScore += 10;
            }

            if (p2.section8d?.is_completed === 'yes') rawScore += 10;
        } else { // Normal Faculty
            if (parseInt(p2.section8a?.count || 0, 10) >= 1) rawScore += 40;
            
            const s8b = p2.section8b || {};
            let s8bScore = 0;
            if (s8b.best_project_place === '1') s8bScore += 60;
            else if (s8b.best_project_place === '2') s8bScore += 55;
            else if (s8b.best_project_place === '3') s8bScore += 50;
            
            if (s8b.exhibited_status === 'won') s8bScore += 60;
            else if (s8b.exhibited_status === 'exhibited') s8bScore += 40;
            
            const funds = parseFloat(s8b.funding_amount || 0);
            if (funds >= 5000) s8bScore += 60;
            else if (funds > 0 && funds < 5000) s8bScore += 50;
            
            const pubs = parseInt(s8b.publication_count || 0, 10);
            if (pubs >= 1) s8bScore += 60;
            
            rawScore += Math.min(s8bScore, 60);

            const gradPercent = parseInt(p2.section8c_reg?.graduated_percent || 0, 10);
            if (gradPercent >= 90) rawScore += 30; else if (gradPercent >= 81) rawScore += 25; else if (gradPercent >= 71) rawScore += 20; else if (gradPercent >= 61) rawScore += 15;
        }
        
        return Math.min(rawScore, 350);
    }, [part2Data, profile]);

    const totalPart3Score = useMemo(() => {
        const d = part3Data || {};
        let rawScore = 0;

        // 10a. Journals
        const journalCount = (d.journals || []).filter(j => j.name).length;
        if (journalCount >= 2) rawScore += 20;
        else if (journalCount === 1) rawScore += 15;

        // 10b. Conferences
        const conferences = parseInt(d.conferences_presented || 0, 10);
        if (conferences >= 3) rawScore += 20;
        else if (conferences === 2) rawScore += 15;
        else if (conferences === 1) rawScore += 10;

        // 10c. Indexed Papers / Book Chapters / Books Authored
        const s10c = d.section10c || {};
        let s10cScore = 0;
        const totalJournals = (d.journals || []).filter(j => j.name).length;

        const indexedPapersCount = (s10c.papers || []).filter(p => p.name).length;
        if (totalJournals > 0 && indexedPapersCount > 0) {
            s10cScore += (indexedPapersCount / totalJournals) * 40;
        }

        const chapters = parseInt(s10c.chapters_count || 0, 10); 
        if (chapters >= 5) s10cScore += 40; 
        else if (chapters === 4) s10cScore += 35; 
        else if (chapters === 3) s10cScore += 30; 
        else if (chapters === 2) s10cScore += 25; 
        else if (chapters === 1) s10cScore += 20;

        const prescribed = s10c.prescribed_status || ''; 
        if (prescribed === 'two_plus') s10cScore += 40; 
        else if (prescribed === 'one') s10cScore += 35; 
        else if (prescribed === 'authored') s10cScore += 30;

        rawScore += Math.min(s10cScore, 40);

        // 11. Projects
        if (d.proposal_status === 'submitted') rawScore += 20;
        if (d.project_amount === 'above_4L') rawScore += 30;
        else if (d.project_amount === '1L_to_4L') rawScore += 25;
        else if (d.project_amount === 'below_1L') rawScore += 20;

        // 12a. Consultancy
        if (d.consultancy_amount === 'above_1L') rawScore += 20;
        else if (d.consultancy_amount === 'below_1L') rawScore += 15;

        // 12b. Patents
        if (d.patent_status === 'awarded') rawScore += 20;
        else if (d.patent_status === 'applied') rawScore += 15;

        return Math.min(rawScore, 170);
    }, [part3Data]);

    const totalPart4Score = useMemo(() => {
        const d=part4Data||{};let rawScore=0;rawScore+=parseFloat(d.punctuality_13a||0);rawScore+=parseFloat(d.behavior_13b||0);rawScore+=parseFloat(d.performance_13c||0);rawScore+=parseFloat(d.culture_13d||0);rawScore+=parseFloat(d.mentoring_13e||0);rawScore+=parseFloat(d.teamwork_13f||0);rawScore+=parseFloat(d.preparedness_14a||0);rawScore+=parseFloat(d.assessment_14b||0);if(d.activities_14c==='co_collab')rawScore+=20;else if(d.activities_14c==='co_ind')rawScore+=15;else if(d.activities_14c==='extra_collab')rawScore+=10;if(d.responsibilities_15a==='yes')rawScore+=20;return Math.min(rawScore,180);
    }, [part4Data]);

    const grandApiScore = useMemo(() => {
        const experience=(profile?.service_years_mitm||0)+(profile?.previous_experience||0);const p2=totalPart2Score/350;const p3=totalPart3Score/170;const p4=totalPart4Score/180;if(isNaN(p2)||isNaN(p3)||isNaN(p4))return 0;if(experience<5){return(p2*.7+p3*.2+p4*.1)*100}else if(experience>=5&&experience<10){return(p2*.6+p3*.25+p4*.15)*100}else{return(p2*.5+p3*.3+p4*.2)*100}
    }, [profile, totalPart2Score, totalPart3Score, totalPart4Score]);

    const handleSaveDraft = async (showAlert = true) => {
        if (!appraisalId) return;
        const dataToSave={part2_data:part2Data,part3_data:part3Data,part4_data:part4Data,part2_sr_score:totalPart2Score,part3_sr_score:totalPart3Score,part4_sr_score:totalPart4Score,grand_api_score:grandApiScore};
        const { error } = await supabase.from('appraisals').update(dataToSave).eq('id', appraisalId);
        if (error) { if (showAlert) alert('Error saving draft: ' + error.message); }
        else { if (showAlert) alert('Draft saved successfully!'); }
    };

    const handleSaveAsPDF = () => {
        window.print();
    };

    const handleFinalSubmit = async () => {
        const confirmation=window.confirm("Are you sure you want to submit your appraisal?\nThe form cannot be edited once submitted.");
        if (confirmation) {
            await handleSaveDraft(false);

            let updateData = { status: 'submitted_by_staff' };

            // If the user is an HOD, auto-finalize: copy SR → HR and compute final score
            if (profile?.role === 'hod') {
                const experience = (profile.service_years_mitm || 0) + (profile.previous_experience || 0);
                const p2 = totalPart2Score / 350;
                const p3 = totalPart3Score / 170;
                const p4 = totalPart4Score / 180;
                let finalScore = 0;
                if (experience < 5) { finalScore = ((p2 * 0.70) + (p3 * 0.20) + (p4 * 0.10)) * 100; }
                else if (experience >= 5 && experience < 10) { finalScore = ((p2 * 0.60) + (p3 * 0.25) + (p4 * 0.15)) * 100; }
                else { finalScore = ((p2 * 0.50) + (p3 * 0.30) + (p4 * 0.20)) * 100; }

                updateData = {
                    status: 'reviewed_by_hod',
                    part2_hr_data: part2Data,
                    part3_hr_data: part3Data,
                    part4_hr_data: part4Data,
                    part2_hr_score: totalPart2Score,
                    part3_hr_score: totalPart3Score,
                    part4_hr_score: totalPart4Score,
                    grand_api_score_final: finalScore,
                };
            }

            const { error } = await supabase.from('appraisals').update(updateData).eq('id', appraisalId);
            if (error) { alert("Submission failed: " + error.message); }
            else { alert("Appraisal submitted successfully!"); navigate('/dashboard'); }
        }
    };
    // --- UI SECTION (Redesigned) ---
    
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    // Determine the display status for submitted appraisals
    const getSubmittedStatusInfo = () => {
        if (!isSubmitted) return null;
        // We stored the raw status in loadOrCreateAppraisal
        // Check if we have HR scores to determine if HOD has reviewed
        if (finalApiScore != null && hodRemarks) {
            return { label: 'Reviewed by HOD', color: 'secondary' };
        }
        return { label: 'Submitted — Awaiting HOD Review', color: 'success' };
    };

    if (isSubmitted) {
        const statusInfo = getSubmittedStatusInfo();
        return (
            <Box>
                {/* --- Read-Only Header --- */}
                <Paper 
                    elevation={2}
                    sx={{ 
                        position: 'sticky', 
                        top: { xs: 56, sm: 64 },
                        zIndex: 10, 
                        py: { xs: 1.5, md: 2 }, 
                        px: { xs: 2, md: 3 }, 
                        mb: 4,
                        '@media print': { display: 'none' }
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>Faculty Self-Appraisal</Typography>
                                <Chip icon={<CheckCircleIcon />} label="Submitted" color="success" size="small" />
                            </Box>
                            <Typography variant="body2" color="text.secondary">{profile?.full_name} ({profile?.department?.name})</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 4 }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 700, lineHeight: 1 }}>{grandApiScore.toFixed(2)}</Typography>
                                <Typography variant="caption" sx={{ letterSpacing: 1, fontWeight: 500 }}>YOUR SCORE</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button onClick={handleSaveAsPDF} startIcon={<PictureAsPdfIcon />} color="error" variant="outlined" size="small">PDF</Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* --- HOD & Principal Remarks Section --- */}
                <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                        Review Remarks
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2.5, height: '100%', bgcolor: hodRemarks && (hodRemarks.strengths || hodRemarks.concerns || hodRemarks.suggestions) ? 'action.hover' : 'transparent' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: hodRemarks && (hodRemarks.strengths || hodRemarks.concerns || hodRemarks.suggestions) ? 'secondary.main' : 'text.secondary' }}>
                                    HOD's Remarks
                                </Typography>
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
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                            Awaiting HOD review. Remarks will appear here once the HOD completes their review.
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2.5, height: '100%', bgcolor: principalRemarks ? 'action.hover' : 'transparent' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: principalRemarks ? 'primary.main' : 'text.secondary' }}>
                                    Principal's Remarks
                                </Typography>
                                {principalRemarks ? (
                                    <Typography variant="body2" color="text.secondary">{principalRemarks}</Typography>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                            Awaiting Principal's remarks. Remarks will appear here once the Principal reviews your appraisal.
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>



                {/* --- Read-Only Form Content (disabled overlay) --- */}
                <Box sx={{ pointerEvents: 'none', opacity: 0.75 }}>
                    {/* Part II Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" component="h2">Part II: Teaching, Learning and Evaluation</Typography>
                            <Chip label={`Score: ${totalPart2Score.toFixed(2)} / 350`} color="primary" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Part2_Section7a data={part2Data.section7a} setData={() => {}} />
                            <Part2_Section7c data={part2Data.section7c} setData={() => {}} />
                            <Part2_Section7d data={part2Data.section7d} setData={() => {}} passPercentages={(part2Data.section7a || []).map(s => s.passPercent)} />
                            {profile?.department?.is_basic_science ? 
                                (<>
                                    <Part2_BSH_Sections data={part2Data.sectionBSH} setData={() => {}} />
                                    <Part2_Section8d data={part2Data.section8d} setData={() => {}} />
                                </>)
                                : (<> 
                                    <Part2_Section8a data={part2Data.section8a} setData={() => {}} /> 
                                    <Part2_Section8b data={part2Data.section8b} setData={() => {}} /> 
                                    <Part2_Section8c_Regular data={part2Data.section8c_reg} setData={() => {}} />
                                </>)
                            }
                            <Part2_Section9a data={part2Data.section9a} setData={() => {}} />
                            <Part2_Section9b data={part2Data.section9b} setData={() => {}} />
                            <Part2_Section9c data={part2Data.section9c} setData={() => {}} />
                        </Box>
                    </Paper>

                    {/* Part III Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" component="h2">Part III: R&D Contributions</Typography>
                            <Chip label={`Score: ${totalPart3Score.toFixed(2)} / 170`} color="primary" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Part3_Sections data={part3Data} setData={() => {}} />
                            <Part3_Section10c data={part3Data.section10c} setData={() => {}} journalsPublished={(part3Data.journals || []).filter(j => j.name).length} />
                        </Box>
                    </Paper>

                    {/* Part IV Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" component="h2">Part IV: Administration & Contribution</Typography>
                            <Chip label={`Score: ${totalPart4Score.toFixed(2)} / 180`} color="primary" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Part4_Sections data={part4Data} setData={() => {}} />
                    </Paper>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            {/* --- Redesigned Sticky Header --- */}
            <Paper 
                elevation={2}
                sx={{ 
                    position: 'sticky', 
                    top: { xs: 56, sm: 64 },
                    zIndex: 10, 
                    py: { xs: 1.5, md: 2 }, 
                    px: { xs: 2, md: 3 }, 
                    mb: 4,
                    '@media print': { display: 'none' }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>Faculty Self-Appraisal</Typography>
                        <Typography variant="body2" color="text.secondary">{profile?.full_name} ({profile?.department?.name})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 4 }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 700, lineHeight: 1 }}>{grandApiScore.toFixed(2)}</Typography>
                            <Typography variant="caption" sx={{ letterSpacing: 1, fontWeight: 500 }}>GRAND SCORE</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button onClick={() => handleSaveDraft()} startIcon={<SaveIcon />} color="secondary" variant="outlined" size="small">Save</Button>
                            <Button onClick={handleSaveAsPDF} startIcon={<PictureAsPdfIcon />} color="error" variant="outlined" size="small">PDF</Button>
                            <Button onClick={handleFinalSubmit} startIcon={<UploadFileIcon />} variant="contained" size="small">Submit</Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* --- Printable Header (Visible only on print) --- */}
            <Box sx={{ display: 'none', '@media print': { display: 'block' }, mb: 4, pb: 2, borderBottom: '2px solid #ccc' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>Faculty Appraisal Report</Typography>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 3 }}>Assessment Year: {new Date().getFullYear()} - {new Date().getFullYear() + 1}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}><Typography><strong>Name:</strong> {profile?.full_name}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Staff ID:</strong> {profile?.staff_id || 'N/A'}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Designation:</strong> {profile?.present_designation || 'N/A'}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Department:</strong> {profile?.department?.name || 'N/A'}</Typography></Grid>
                </Grid>
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Typography variant="h6" color="primary"><strong>Grand API Score: {grandApiScore.toFixed(2)}</strong></Typography>
                </Box>
            </Box>

            {/* --- Main Form Content --- */}
                <Box>
                    {/* Part II Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" component="h2">Part II: Teaching, Learning and Evaluation</Typography>
                            <Chip label={`Score: ${totalPart2Score.toFixed(2)} / 350`} color="primary" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Part2_Section7a data={part2Data.section7a} setData={(d) => setPart2Data(prev => ({...prev, section7a: d, section7d: d.map(s => ({code: s.code, ...(prev.section7d?.find(x => x.code === s.code) || {})}))}))} />
                            <Part2_Section7c data={part2Data.section7c} setData={(d) => setPart2Data(prev => ({...prev, section7c: d}))} />
                            <Part2_Section7d data={part2Data.section7d} setData={(d) => setPart2Data(prev => ({...prev, section7d: d}))} passPercentages={(part2Data.section7a || []).map(s => s.passPercent)} />
                            {profile?.department?.is_basic_science ? 
                                (<>
                                    <Part2_BSH_Sections data={part2Data.sectionBSH} setData={(d) => setPart2Data(prev => ({...prev, sectionBSH: d}))} />
                                    <Part2_Section8d data={part2Data.section8d} setData={(d) => setPart2Data(prev => ({...prev, section8d: d}))} />
                                </>)
                                : (<> 
                                    <Part2_Section8a data={part2Data.section8a} setData={(d) => setPart2Data(prev => ({...prev, section8a: d}))} /> 
                                    <Part2_Section8b data={part2Data.section8b} setData={(d) => setPart2Data(prev => ({...prev, section8b: d}))} /> 
                                    <Part2_Section8c_Regular data={part2Data.section8c_reg} setData={(d) => setPart2Data(prev => ({...prev, section8c_reg: d}))} />
                                </>)
                            }
                            <Part2_Section9a data={part2Data.section9a} setData={(d) => setPart2Data(prev => ({...prev, section9a: d}))} />
                            <Part2_Section9b data={part2Data.section9b} setData={(d) => setPart2Data(prev => ({...prev, section9b: d}))} />
                            <Part2_Section9c data={part2Data.section9c} setData={(d) => setPart2Data(prev => ({...prev, section9c: d}))} />
                        </Box>
                    </Paper>

                    {/* Part III Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" component="h2">Part III: R&D Contributions</Typography>
                            <Chip label={`Score: ${totalPart3Score.toFixed(2)} / 170`} color="primary" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Part3_Sections data={part3Data} setData={setPart3Data} />
                            <Part3_Section10c data={part3Data.section10c} setData={(d) => setPart3Data(prev => ({ ...prev, section10c: d }))} journalsPublished={(part3Data.journals || []).filter(j => j.name).length} />
                        </Box>
                    </Paper>

                    {/* Part IV Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" component="h2">Part IV: Administration & Contribution</Typography>
                            <Chip label={`Score: ${totalPart4Score.toFixed(2)} / 180`} color="primary" />
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Part4_Sections data={part4Data} setData={setPart4Data} />
                    </Paper>
                </Box>
        </Box>
    );
};

export default Appraisal;