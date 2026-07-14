import React, { useMemo } from 'react';
import { Box, Typography, TextField, Chip, Paper, Grid } from '@mui/material';

const Part2_Section7d = ({ data, setData, isHodView = false, hodData, setHodData, passPercentages, hodPassPercentages, isReadOnly = false }) => {
    
    const handleHodSubjectChange = (index, event) => {
        const values = [...(hodData || [])];
         while (values.length < (data || []).length) {
            values.push({ code: '', high_scorers_percent: '' });
        }
        values[index] = { ...values[index], [event.target.name]: event.target.value };
        setHodData(values);
    };
    
    const handleSubjectChange = (index, event) => {
        const values = [...(data || [])];
        values[index] = { ...values[index], [event.target.name]: event.target.value };
        setData(values);
    };

    const staffApiScores = useMemo(() => {
        const scores = (data || []).map((sub, index) => {
            const passPercent = parseFloat(passPercentages[index] || 0);
            const highScorersPercent = parseFloat(sub.high_scorers_percent || 0);
            if (passPercent > 0 && highScorersPercent > 0) {
                return Math.min((highScorersPercent / passPercent) * 40, 40); // Capped at 40
            }
            return 0;
        });
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return { scores, averageScore };
    }, [data, passPercentages]);

    // Staff View
    if(!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>7.d. % of Students scoring ≥ 60%</Typography>
                    <Chip label={`Avg Score: ${staffApiScores.averageScore.toFixed(2)} / 40`} color="primary" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Note: This section corresponds to the subjects added in section 7.a.</Typography>
                {(data || []).map((subject, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5, backgroundColor: '#fafafa' }}>
                        <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField name="code" label="Subject Code" value={subject.code} disabled fullWidth size="small" />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField type="number" name="high_scorers_percent" label="% scoring ≥ 60" value={subject.high_scorers_percent || ''} onChange={e => handleSubjectChange(index, e)} fullWidth size="small" />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <Chip label={`Score: ${staffApiScores.scores[index]?.toFixed(2) || '0.00'}`} variant="outlined" size="small" sx={{ width: '100%' }} />
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
            </Paper>
        );
    }

    // HOD View
    return (
         <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>7.d. % of Students scoring ≥ 60%</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', fontWeight: 'bold' }}>
                <span>Subject Code</span>
                <span style={{textAlign: 'center'}}>SR (% ≥ 60)</span>
                <span style={{textAlign: 'center'}}>HR (% ≥ 60)</span>
            </div>
            {(data || []).map((subject, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="text" value={subject.code} disabled />
                    <input type="number" value={subject.high_scorers_percent} disabled style={{textAlign: 'center'}} />
                    <input 
                        type="number" 
                        name="high_scorers_percent" 
                        placeholder="% scoring >= 60" 
                        value={(hodData || [])[index]?.high_scorers_percent || ''}
                        onChange={e => handleHodSubjectChange(index, e)}
                        style={{textAlign: 'center'}}
                        disabled={isReadOnly}
                    />
                </div>
            ))}
        </div>
    );
};

export default Part2_Section7d;