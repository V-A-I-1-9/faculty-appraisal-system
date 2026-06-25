import React, { useMemo } from 'react';
import { Box, Typography, TextField, Chip, Paper } from '@mui/material';

const Part2_Section8a = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const apiScore = useMemo(() => {
        const num = parseInt(data?.count || 0, 10);
        return num >= 1 ? 40 : 0;
    }, [data]);

    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, count: e.target.value });
    };

    // Staff View
    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>8.a. No. of projects guided (UG/PG)</Typography>
                    <Chip label={`Score: ${apiScore} / 40`} color="primary" size="small" />
                </Box>
                <TextField
                    type="number"
                    label="Number of Projects"
                    value={data?.count || ''}
                    onChange={handleChange}
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
            <h4>8.a. No. of projects guided (UG/PG)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Number of Projects</label>
                <input type="number" value={data?.count || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" name="count" value={hodData?.count || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_Section8a;