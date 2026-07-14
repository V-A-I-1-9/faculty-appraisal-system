import React, { useMemo } from 'react';
import { Box, Typography, Chip, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Part2_Section8d = ({ data, setData, isHodView = false, hodData, setHodData, isReadOnly = false }) => {
    const apiScore = useMemo(() => {
        return data?.is_completed === 'yes' ? 10 : 0;
    }, [data]);
    
    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, is_completed: e.target.value });
    };

    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>8.d. No. of UG/PG projects Co-guided</Typography>
                    <Chip label={`Score: ${apiScore} / 10`} color="primary" size="small" />
                </Box>
                <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>Is project completed?</InputLabel>
                    <Select name="is_completed" value={data?.is_completed || ''} label="Is project completed?" onChange={handleChange}>
                        <MenuItem value=""><em>Select Status</em></MenuItem>
                        <MenuItem value="yes">Yes, Completed</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                    </Select>
                </FormControl>
            </Paper>
        );
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>8.d. No. of UG/PG projects Co-guided</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Is project completed?</label>
                <input value={data?.is_completed || 'N/A'} disabled style={{width: '100px', textAlign: 'center'}} />
                <select name="is_completed" value={hodData?.is_completed || ''} onChange={handleChange} style={{width: '100px'}} disabled={isReadOnly}>
                    <option value="">Select Status</option>
                    <option value="yes">Yes, Completed</option>
                    <option value="no">No</option>
                </select>
            </div>
        </div>
    );
};

export default Part2_Section8d;