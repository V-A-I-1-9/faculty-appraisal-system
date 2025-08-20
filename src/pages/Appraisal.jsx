import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// --- UI IMPORTS ---
import { Box, Typography, Paper, Button, CircularProgress, Grid, Divider, Chip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
            const { selectedOption, details } = p2.section8b || {};
            switch (selectedOption) { case 'best_project': if (details?.place === '1') rawScore += 60; else if (details?.place === '2') rawScore += 55; else if (details?.place === '3') rawScore += 50; break; case 'exhibited': if (details?.status === 'won') rawScore += 60; else if (details?.status === 'exhibited') rawScore += 40; break; case 'funded': const funds = parseFloat(details?.amount || 0); if (funds >= 5000) rawScore += 60; else if (funds > 0) rawScore += 50; break; case 'publication': if (parseInt(details?.count || 0, 10) >= 1) rawScore += 60; break; default: break; }
            const gradPercent = parseInt(p2.section8c_reg?.graduated_percent || 0, 10);
            if (gradPercent >= 90) rawScore += 30; else if (gradPercent >= 81) rawScore += 25; else if (gradPercent >= 71) rawScore += 20; else if (gradPercent >= 61) rawScore += 15;
        }
        
        return Math.min(rawScore, 350);
    }, [part2Data, profile]);

    const totalPart3Score = useMemo(() => {
        const d=part3Data||{};let rawScore=0;const journalCount=(d.journals||[]).filter(j=>j.name).length;if(journalCount>=2)rawScore+=20;else if(journalCount===1)rawScore+=15;const conferences=parseInt(d.conferences_presented||0,10);if(conferences>=3)rawScore+=20;else if(conferences===2)rawScore+=15;else if(conferences===1)rawScore+=10;const{selectedOption,details}=d.section10c||{};const totalJournals=(d.journals||[]).filter(j=>j.name).length;switch(selectedOption){case'scopus':const indexedPapers=(details?.papers||[]).filter(p=>p.name).length;if(totalJournals>0&&indexedPapers>0){rawScore+=Math.min(indexedPapers/totalJournals*40,40)}break;case'chapters':const chapters=parseInt(details?.chapters_count||0,10);if(chapters>=5)rawScore+=40;else if(chapters===4)rawScore+=35;else if(chapters===3)rawScore+=30;else if(chapters===2)rawScore+=25;else if(chapters===1)rawScore+=20;break;case'books':const prescribed=details?.prescribed_status||'';if(prescribed==='two_plus')rawScore+=40;else if(prescribed==='one')rawScore+=35;else if(prescribed==='authored')rawScore+=30;break;default:break}if(d.proposal_status==='submitted')rawScore+=20;if(d.project_amount==='above_4L')rawScore+=30;else if(d.project_amount==='1L_to_4L')rawScore+=25;else if(d.project_amount==='below_1L')rawScore+=20;if(d.consultancy_amount==='above_1L')rawScore+=20;else if(d.consultancy_amount==='below_1L')rawScore+=15;if(d.patent_status==='awarded')rawScore+=20;else if(d.patent_status==='applied')rawScore+=15;return Math.min(rawScore,170);
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

    const handleFinalSubmit = async () => {
        const confirmation=window.confirm("Are you sure you want to submit your appraisal?\nYou will not be able to make any changes after this.");
        if (confirmation) {
            await handleSaveDraft(false);
            const { error } = await supabase.from('appraisals').update({ status: 'submitted_by_staff' }).eq('id', appraisalId);
            if (error) { alert("Submission failed: " + error.message); }
            else { alert("Appraisal submitted successfully!"); navigate('/dashboard'); }
        }
    };
    // --- UI SECTION (Redesigned) ---
    
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (isSubmitted) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 4, maxWidth: 600, mx: 'auto' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>This appraisal has been submitted.</Typography>
                <Typography color="text.secondary">No further edits can be made. You will be notified once the review process is complete.</Typography>
            </Paper>
        );
    }

    return (
        <Box>
            {/* --- Redesigned Sticky Header --- */}
            <Paper 
                elevation={2}
                sx={{ 
                    position: 'sticky', 
                    top: 64, // Positioned below the main AppBar from Layout.jsx
                    zIndex: 10, 
                    py: 1, 
                    px: 3, 
                    mb: 4,
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} md={5}>
                        <Typography variant="h5">Faculty Self-Appraisal</Typography>
                        <Typography variant="caption" color="text.secondary">{profile?.full_name} ({profile?.department?.name})</Typography>
                    </Grid>
                    <Grid item xs={6} md={3} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>{grandApiScore.toFixed(2)}</Typography>
                        <Typography variant="overline">Grand API Score</Typography>
                    </Grid>
                    <Grid item xs={6} md={4} sx={{ textAlign: 'right' }}>
                        <Button onClick={() => handleSaveDraft()} startIcon={<SaveIcon />} sx={{ mr: 2 }} color="secondary" variant="outlined">Save Draft</Button>
                        <Button onClick={handleFinalSubmit} startIcon={<UploadFileIcon />} variant="contained">Final Submit</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- Main Form Content --- */}
                <Box>
                    {/* Part II Card */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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