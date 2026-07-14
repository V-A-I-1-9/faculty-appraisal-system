import React from 'react';
import { Box, Typography, TextField, Chip, Paper } from '@mui/material';

const Part2_Section9b = ({ data, setData, isHodView = false, hodData, setHodData, isReadOnly = false }) => {
    
    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        const value = e.target.value;
        stateSetter({ ...data, score: value > 35 ? 35 : value });
    };

    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>9.b. Use of ICT in TLP (Teaching Learning Process)</Typography>
                    <Chip label={`Score: ${data?.score || 0} / 35`} color="primary" size="small" />
                </Box>
                <TextField
                    type="number"
                    label="Self-Rating (Max 35)"
                    value={data?.score || ''}
                    onChange={handleChange}
                    inputProps={{ max: 35, min: 0 }}
                    size="small"
                    fullWidth
                    sx={{ maxWidth: 350 }}
                />
            </Paper>
        );
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>9.b. Use of ICT in TLP</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Rating (Max 35)</label>
                <input type="number" value={data?.score || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" max="35" name="score" value={hodData?.score || ''} onChange={handleChange} style={{width: '60px'}} disabled={isReadOnly} />
            </div>
        </div>
    );
};

export default Part2_Section9b;