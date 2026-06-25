import React, { useMemo } from 'react';
import { Box, Typography, TextField, Chip, Paper, Divider } from '@mui/material';

const Part2_Section7c = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const apiScore = useMemo(() => {
        const score = parseFloat(data?.score || 0);
        return !isNaN(score) && score <= 40 ? score : 0;
    }, [data]);

    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, score: e.target.value > 40 ? 40 : e.target.value });
    };

    // Staff View
    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>7.c. Student Feedback</Typography>
                    <Chip label={`Score: ${apiScore.toFixed(2)} / 40`} color="primary" size="small" />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Student Feedback Average (Max 40)</Typography>
                <TextField
                    type="number"
                    value={data?.score || ''}
                    onChange={handleChange}
                    inputProps={{ max: 40, min: 0 }}
                    size="small"
                    fullWidth
                    sx={{ maxWidth: 350 }}
                />
            </Paper>
        );
    }

    // HOD View
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>7.c. Student Feedback</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Student Feedback Average (Max 40)</label>
                <input type="number" value={data?.score || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" max="40" name="score" value={hodData?.score || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_Section7c;