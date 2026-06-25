import React from 'react';
import { Box, Typography, TextField, Chip, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// This version contains the complete code for BOTH the Staff's view and the HOD's review view.
const Part4_Sections = ({ data, setData, isHodView = false, hodData, setHodData }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        const max = parseInt(e.target.max, 10);
        if (value > max) return;

        const stateSetter = isHodView ? setHodData : setData;
        stateSetter(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter(prev => ({ ...prev, [name]: value }));
    };

    // --- STAFF VIEW ---
    if (!isHodView) {
        const ScoreInput = ({ label, name, max, value }) => (
            <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{label} (Max {max})</Typography>
                    <TextField
                        type="number"
                        name={name}
                        value={value || ''}
                        onChange={handleChange}
                        inputProps={{ max, min: 0 }}
                        size="small"
                        fullWidth
                    />
                </Box>
            </Grid>
        );

        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={2.5}>
                    <ScoreInput label="13.a. Punctuality" name="punctuality_13a" max={10} value={data?.punctuality_13a} />
                    <ScoreInput label="13.b. Behavior and Conduct" name="behavior_13b" max={15} value={data?.behavior_13b} />
                    <ScoreInput label="13.c. Performance on assigned jobs" name="performance_13c" max={15} value={data?.performance_13c} />
                    <ScoreInput label="13.d. Upholding Institute's Culture" name="culture_13d" max={15} value={data?.culture_13d} />
                    <ScoreInput label="13.e. Mentoring Efficacy" name="mentoring_13e" max={20} value={data?.mentoring_13e} />
                    <ScoreInput label="13.f. Team-man-ship" name="teamwork_13f" max={15} value={data?.teamwork_13f} />
                    <ScoreInput label="14.a. Academic Preparedness: Course File" name="preparedness_14a" max={30} value={data?.preparedness_14a} />
                    <ScoreInput label="14.b. Academic Assessment Efficacy" name="assessment_14b" max={20} value={data?.assessment_14b} />
                    
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>14.c. Student Activities organized (Max 20)</Typography>
                            <FormControl fullWidth size="small">
                                <Select name="activities_14c" value={data?.activities_14c || ''} onChange={handleSelectChange} displayEmpty>
                                    <MenuItem value=""><em>Select Type</em></MenuItem>
                                    <MenuItem value="co_collab">Co-curricular & Collaborative</MenuItem>
                                    <MenuItem value="co_ind">Co-curricular & Individual</MenuItem>
                                    <MenuItem value="extra_collab">Extra-curricular & Collaborative</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>15.a. Add-on Responsibilities (Max 20)</Typography>
                            <FormControl fullWidth size="small">
                                <Select name="responsibilities_15a" value={data?.responsibilities_15a || ''} onChange={handleSelectChange} displayEmpty>
                                    <MenuItem value=""><em>Select Option</em></MenuItem>
                                    <MenuItem value="yes">Yes</MenuItem>
                                    <MenuItem value="no">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        );
    }

    // --- HOD VIEW ---
    const renderInput = (label, name, max) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center' }}>
            <label><strong>{label}</strong> (Max {max})</label>
            <input type="number" max={max} name={name} value={data?.[name] || ''} disabled style={{width: '60px', textAlign: 'center'}} />
            <input type="number" max={max} name={name} value={hodData?.[name] || ''} onChange={handleChange} style={{width: '60px'}} />
        </div>
    );

    const renderSelect = (label, name, options) => (
         <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center' }}>
            <label><strong>{label}</strong></label>
            <input value={data?.[name] || ''} disabled style={{width: '100px', textAlign: 'center', textTransform: 'capitalize'}} />
            <select name={name} value={hodData?.[name] || ''} onChange={handleSelectChange}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                    <span>Parameter</span>
                    <span style={{textAlign: 'center'}}>SR</span>
                    <span style={{textAlign: 'center'}}>HR</span>
                </div>
                {renderInput("13.a. Punctuality", "punctuality_13a", 10)}
                {renderInput("13.b. Behavior and Conduct", "behavior_13b", 15)}
                {renderInput("13.c. Performance on assigned jobs", "performance_13c", 15)}
                {renderInput("13.d. Upholding Institute's Culture", "culture_13d", 15)}
                {renderInput("13.e. Mentoring Efficacy", "mentoring_13e", 20)}
                {renderInput("13.f. Team-man-ship", "teamwork_13f", 15)}
                {renderInput("14.a. Academic Preparedness: Course File", "preparedness_14a", 30)}
                {renderInput("14.b. Academic Assessment Efficacy", "assessment_14b", 20)}

                {renderSelect("14.c. Student Activities organized", "activities_14c", [
                    { value: "", label: "Select Type" },
                    { value: "co_collab", label: "Co-curricular & Collaborative" },
                    { value: "co_ind", label: "Co-curricular & Individual" },
                    { value: "extra_collab", label: "Extra-curricular & Collaborative" }
                ])}

                {renderSelect("15.a. Add-on Responsibilities", "responsibilities_15a", [
                    { value: "", label: "Select Option" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ])}
            </div>
        </div>
    );
};

export default Part4_Sections;