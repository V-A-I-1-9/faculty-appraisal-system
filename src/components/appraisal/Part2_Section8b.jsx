import React, { useMemo } from 'react';
import { Box, Typography, Chip, Paper, TextField, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material';

const Part2_Section8b = ({ data, setData, isHodView = false, hodData, setHodData }) => {

    const handleOptionChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ selectedOption: e.target.value, details: {} });
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        const currentData = isHodView ? hodData : data;
        stateSetter({ ...currentData, details: { ...currentData.details, [name]: value } });
    };

    const apiScore = useMemo(() => {
        const { selectedOption, details } = data || {};
        switch (selectedOption) {
            case 'best_project': if (details?.place === '1') return 60; if (details?.place === '2') return 55; if (details?.place === '3') return 50; return 0;
            case 'exhibited': if (details?.status === 'won') return 60; if (details?.status === 'exhibited') return 40; return 0;
            case 'funded': const funds = parseFloat(details?.amount || 0); if (funds >= 5000) return 60; if (funds > 0 && funds < 5000) return 50; return 0;
            case 'publication': const pubs = parseInt(details?.count || 0, 10); if (pubs >= 1) return 60; return 0;
            default: return 0;
        }
    }, [data]);

    const renderDetailFields = (isForHod) => {
        const currentData = isForHod ? hodData : data;
        const changeHandler = handleDetailChange;
        const isDisabled = isHodView && !isForHod;

        switch (currentData?.selectedOption) {
            case 'best_project': 
                if (!isHodView) return (
                    <FormControl size="small" sx={{ minWidth: 200, mt: 1 }}>
                        <InputLabel>Place Won</InputLabel>
                        <Select name="place" value={currentData.details?.place || ''} label="Place Won" onChange={changeHandler} disabled={isDisabled}>
                            <MenuItem value=""><em>Select Place</em></MenuItem>
                            <MenuItem value="1">1st Place</MenuItem>
                            <MenuItem value="2">2nd Place</MenuItem>
                            <MenuItem value="3">3rd Place</MenuItem>
                        </Select>
                    </FormControl>
                );
                return (<select name="place" value={currentData.details?.place || ''} onChange={changeHandler} disabled={isDisabled}><option value="">Select Place</option><option value="1">1st Place</option><option value="2">2nd Place</option><option value="3">3rd Place</option></select>);
            case 'exhibited': 
                if (!isHodView) return (
                    <FormControl size="small" sx={{ minWidth: 200, mt: 1 }}>
                        <InputLabel>Status</InputLabel>
                        <Select name="status" value={currentData.details?.status || ''} label="Status" onChange={changeHandler} disabled={isDisabled}>
                            <MenuItem value=""><em>Select Status</em></MenuItem>
                            <MenuItem value="won">Won in Competition</MenuItem>
                            <MenuItem value="exhibited">Only Exhibited</MenuItem>
                        </Select>
                    </FormControl>
                );
                return (<select name="status" value={currentData.details?.status || ''} onChange={changeHandler} disabled={isDisabled}><option value="">Select Status</option><option value="won">Won in Competition</option><option value="exhibited">Only Exhibited</option></select>);
            case 'funded': 
                if (!isHodView) return (<TextField type="number" name="amount" label="Funding Amount (INR)" value={currentData.details?.amount || ''} onChange={changeHandler} disabled={isDisabled} size="small" sx={{ mt: 1, maxWidth: 300 }} />);
                return <input type="number" name="amount" placeholder="Funding Amount (INR)" value={currentData.details?.amount || ''} onChange={changeHandler} disabled={isDisabled} />;
            case 'publication': 
                if (!isHodView) return (<TextField type="number" name="count" label="No. of Publications" value={currentData.details?.count || ''} onChange={changeHandler} disabled={isDisabled} size="small" sx={{ mt: 1, maxWidth: 300 }} />);
                return <input type="number" name="count" placeholder="No. of Publications" value={currentData.details?.count || ''} onChange={changeHandler} disabled={isDisabled} />;
            default: return <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Select an option above to add details.</Typography>;
        }
    };

    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>8.b. Best Project Awards / Publications / Funding</Typography>
                    <Chip label={`Score: ${apiScore} / 60`} color="primary" size="small" />
                </Box>
                <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontSize: '0.875rem', mb: 0.5 }}>Select one category:</FormLabel>
                    <RadioGroup value={data?.selectedOption || ''} onChange={handleOptionChange}>
                        <FormControlLabel value="best_project" control={<Radio size="small" />} label="Best Projects Awarded" />
                        <FormControlLabel value="exhibited" control={<Radio size="small" />} label="Student Project Exhibited" />
                        <FormControlLabel value="funded" control={<Radio size="small" />} label="Funded by External Agency" />
                        <FormControlLabel value="publication" control={<Radio size="small" />} label="Student Project Paper Publication(s)" />
                    </RadioGroup>
                </FormControl>
                <Box>{renderDetailFields(false)}</Box>
            </Paper>
        );
    }
    
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>8.b. Best Project Awards / Publications / Funding</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                    <p><strong>Self-Rating (SR)</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><input type="radio" value="best_project" checked={data?.selectedOption === 'best_project'} disabled /><label> Best Projects Awarded</label></div>
                        <div><input type="radio" value="exhibited" checked={data?.selectedOption === 'exhibited'} disabled /><label> Student Project Exhibited</label></div>
                        <div><input type="radio" value="funded" checked={data?.selectedOption === 'funded'} disabled /><label> Funded by External Agency</label></div>
                        <div><input type="radio" value="publication" checked={data?.selectedOption === 'publication'} disabled /><label> Student Project Paper Publication(s)</label></div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>{renderDetailFields(false)}</div>
                </div>
                <div>
                    <p><strong>HOD Rating (HR)</strong></p>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><input type="radio" id="hr_opt_best_project" name="hr_section8b_option" value="best_project" checked={hodData?.selectedOption === 'best_project'} onChange={handleOptionChange} /><label htmlFor="hr_opt_best_project"> Best Projects Awarded</label></div>
                        <div><input type="radio" id="hr_opt_exhibited" name="hr_section8b_option" value="exhibited" checked={hodData?.selectedOption === 'exhibited'} onChange={handleOptionChange} /><label htmlFor="hr_opt_exhibited"> Student Project Exhibited</label></div>
                        <div><input type="radio" id="hr_opt_funded" name="hr_section8b_option" value="funded" checked={hodData?.selectedOption === 'funded'} onChange={handleOptionChange} /><label htmlFor="hr_opt_funded"> Funded by External Agency</label></div>
                        <div><input type="radio" id="hr_opt_publication" name="hr_section8b_option" value="publication" checked={hodData?.selectedOption === 'publication'} onChange={handleOptionChange} /><label htmlFor="hr_opt_publication"> Student Project Paper Publication(s)</label></div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>{renderDetailFields(true)}</div>
                </div>
            </div>
        </div>
    );
};

export default Part2_Section8b;