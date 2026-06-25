import React, { useMemo } from 'react';
import { Box, Typography, TextField, Chip, Paper, Button, IconButton, Grid } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const Part2_Section7a = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const subjects = data || [];
    const hodSubjects = hodData || [];

    // --- Staff Functions ---
    const handleSubjectChange = (index, event) => {
        const values = [...subjects];
        values[index][event.target.name] = event.target.value;
        setData(values);
    };

    const addSubject = () => {
        setData([...subjects, { code: '', students: '', passPercent: '' }]);
    };

    const removeSubject = (index) => {
        const values = [...subjects];
        values.splice(index, 1);
        setData(values);
    };
    
    // --- HOD Function ---
    const handleHodSubjectChange = (index, event) => {
        const values = [...hodSubjects];
        while (values.length < subjects.length) {
            values.push({ code: '', students: '', passPercent: '' });
        }
        values[index] = { ...values[index], [event.target.name]: event.target.value };
        setHodData(values);
    };

    const staffApiScores = useMemo(() => {
        const scores = subjects.map(sub => (parseFloat(sub.passPercent) || 0) * 0.01 * 30);
        return { scores, averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0 };
    }, [subjects]);
    
    // Staff View
    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>7.a. Subjects Taught & Pass Percentage</Typography>
                    <Chip label={`Avg Score: ${staffApiScores.averageScore.toFixed(2)} / 30`} color="primary" size="small" />
                </Box>
                {subjects.map((subject, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5, backgroundColor: '#fafafa' }}>
                        <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField name="code" label="Subject Code" value={subject.code} onChange={e => handleSubjectChange(index, e)} fullWidth size="small" />
                            </Grid>
                            <Grid item xs={6} sm={2.5}>
                                <TextField type="number" name="students" label="No. of Students" value={subject.students} onChange={e => handleSubjectChange(index, e)} fullWidth size="small" />
                            </Grid>
                            <Grid item xs={6} sm={2.5}>
                                <TextField type="number" name="passPercent" label="% of Pass" value={subject.passPercent} onChange={e => handleSubjectChange(index, e)} fullWidth size="small" />
                            </Grid>
                            <Grid item xs={8} sm={2}>
                                <Chip label={`Score: ${staffApiScores.scores[index]?.toFixed(2) || '0.00'}`} variant="outlined" size="small" sx={{ width: '100%' }} />
                            </Grid>
                            <Grid item xs={4} sm={1} sx={{ textAlign: 'center' }}>
                                <IconButton onClick={() => removeSubject(index)} color="error" size="small" disabled={subjects.length === 1}>
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addSubject} size="small" sx={{ mt: 1 }}>
                    Add Subject
                </Button>
            </Paper>
        );
    }
    
    // HOD View
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>7.a. Subjects Taught & Pass Percentage</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', fontWeight: 'bold' }}>
                <span>Subject Code</span>
                <span>No. of Students</span>
                <span style={{textAlign: 'center'}}>SR (% Pass)</span>
                <span style={{textAlign: 'center'}}>HR (% Pass)</span>
            </div>
            {subjects.map((subject, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="text" value={subject.code} disabled />
                    <input type="number" value={subject.students} disabled />
                    <input type="number" value={subject.passPercent} disabled style={{textAlign: 'center'}} />
                    <input 
                        type="number" 
                        name="passPercent" 
                        placeholder="% of Pass" 
                        value={hodSubjects[index]?.passPercent || ''}
                        onChange={e => handleHodSubjectChange(index, e)}
                        style={{textAlign: 'center'}}
                    />
                </div>
            ))}
        </div>
    );
};

export default Part2_Section7a;