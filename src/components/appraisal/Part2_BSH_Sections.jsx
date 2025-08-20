import React, { useMemo } from 'react';
import { Box, Typography, Select, MenuItem, InputLabel, FormControl, TextField, Grid } from '@mui/material';


const Part2_BSH_Sections = ({ data, setData, isHodView = false, hodData, setHodData }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        const currentData = isHodView ? hodData : data;
        const newData = { ...(currentData || {}), [name]: value };
        stateSetter(newData);
    };

    const scores = useMemo(() => {
        const d = data || {}; 
        const toppers = parseInt(d.topper_rank || 0, 10); 
        const verticalProg = parseInt(d.vertical_progression_percent || 0, 10); 
        
        // --- CORRECTED LOGIC FOR 8c ---
        const fcdCount = parseInt(d.fcd_count || 0, 10);
        const totalMentees = parseInt(d.total_mentees || 0, 10);
        
        let score8a = 0; if (toppers === 1) score8a = 30; else if (toppers === 2) score8a = 25; else if (toppers === 3) score8a = 20; else if (toppers === 4) score8a = 15; else if (toppers === 5) score8a = 10; 
        
        let score8b = 0; if (verticalProg >= 91) score8b = 40; else if (verticalProg >= 81) score8b = 35; else if (verticalProg >= 75) score8b = 30; else if (verticalProg >= 61) score8b = 25; else if (verticalProg >= 51) score8b = 20; else if (verticalProg >= 41) score8b = 15; else if (verticalProg >= 1) score8b = 10; 
        
        let score8c = 0;
        if (totalMentees > 0) {
            const fcdPercent = (fcdCount / totalMentees) * 100;
            if (fcdPercent >= 60) score8c = 40;
            else if (fcdPercent >= 50) score8c = 30;
            else if (fcdPercent >= 40) score8c = 20;
            else if (fcdPercent >= 30) score8c = 10;
        }

        return { score8a, score8b, score8c, total: score8a + score8b + score8c };
    }, [data]);
    
    // --- STAFF VIEW ---
    if (!isHodView) {
        return (
            <div style={{ border: '2px solid #28a745', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ color: '#28a745', marginTop: 0 }}>Section 8 (For Basic Sciences & Humanities)</h4>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>8.a. No. of Toppers in 1st year under your mentorship</Typography>
                        <FormControl fullWidth size="small" sx={{mt: 1}}>
                            <InputLabel>Topper Rank</InputLabel>
                            <Select name="topper_rank" value={data?.topper_rank || ''} label="Topper Rank" onChange={handleChange}>
                                <MenuItem value=""><em>Select Rank</em></MenuItem>
                                <MenuItem value="1">1st Branch Topper</MenuItem>
                                <MenuItem value="2">2nd Branch Topper</MenuItem>
                                <MenuItem value="3">3rd Branch Topper</MenuItem>
                                <MenuItem value="4">4th Branch Topper</MenuItem>
                                <MenuItem value="5">5th Branch Topper</MenuItem>
                            </Select>
                        </FormControl>
                        <Typography sx={{ mt: 1 }}><strong>API Score: {scores.score8a} / 30</strong></Typography>
                    </div>

                    <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>8.b. % of students achieved vertical progression to 2nd Year</Typography>
                        <TextField type="number" name="vertical_progression_percent" value={data?.vertical_progression_percent || ''} onChange={handleChange} fullWidth size="small" sx={{mt: 1}}/>
                        <Typography sx={{ mt: 1 }}><strong>API Score: {scores.score8b} / 40</strong></Typography>
                    </div>
                    
                    {/* --- UPDATED 8c SECTION --- */}
                    <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>8.c. No. of FCD in 1st year under your mentorship</Typography>
                        <Grid container spacing={2} sx={{mt: 0.5}}>
                            <Grid item xs={6}>
                                <TextField type="number" name="fcd_count" label="No. of FCD" value={data?.fcd_count || ''} onChange={handleChange} fullWidth size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField type="number" name="total_mentees" label="Total Mentees" value={data?.total_mentees || ''} onChange={handleChange} fullWidth size="small" />
                            </Grid>
                        </Grid>
                        <Typography sx={{ mt: 1 }}><strong>API Score: {scores.score8c} / 40</strong></Typography>
                    </div>
                </Box>

                <hr style={{margin: '1rem 0'}} />
                <p><strong>Total API Score for this section: {scores.total.toFixed(2)} / 110</strong></p>
            </div>
        );
    }
    
    // --- HOD VIEW ---
    return (
        <div style={{ border: '2px solid #28a745', padding: '1rem', borderRadius: '12px' }}>
            <h4 style={{ color: '#28a745', marginTop: 0 }}>Section 8 (For Basic Sciences & Humanities)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span><span style={{textAlign: 'center'}}>SR</span><span style={{textAlign: 'center'}}>HR</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label><strong>8.a.</strong> No. of Toppers</label>
                <input value={data?.topper_rank ? `${data.topper_rank}` : 'N/A'} disabled style={{width: '100px', textAlign: 'center'}} />
                <select name="topper_rank" value={hodData?.topper_rank || ''} onChange={handleChange} style={{ marginLeft: '10px', width: '100px' }}>
                    <option value="">Select</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option><option value="5">5th</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label><strong>8.b.</strong> % Vertical Progression</label>
                <input type="number" value={data?.vertical_progression_percent || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" name="vertical_progression_percent" value={hodData?.vertical_progression_percent || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label><strong>8.c.</strong> % FCD</label>
                <input type="number" value={data?.fcd_percent || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" name="fcd_percent" value={hodData?.fcd_percent || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_BSH_Sections;