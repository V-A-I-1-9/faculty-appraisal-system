import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import FileUpload from './FileUpload';

// Import MUI components
import { Box, Typography, Button, TextField, IconButton, Divider, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const Part3_Sections = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const journals = data?.journals || [{ name: '', file_url: '' }];

    const handleJournalChange = (index, event) => {
        const newJournals = [...journals];
        newJournals[index][event.target.name] = event.target.value;
        setData({ ...data, journals: newJournals });
    };

    const handleUpload = (index, url) => {
        const newJournals = [...journals];
        newJournals[index].file_url = url;
        setData({ ...data, journals: newJournals });
    };

    const handleRemove = (index) => {
        const newJournals = [...journals];
        newJournals[index].file_url = '';
        setData({ ...data, journals: newJournals });
    };

    const addJournal = () => {
        setData({ ...data, journals: [...journals, { name: '', file_url: '' }] });
    };

    const removeJournal = (index) => {
        const newJournals = [...journals];
        newJournals.splice(index, 1);
        setData({ ...data, journals: newJournals });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter(prev => ({ ...prev, [name]: value }));
    };

    const scores = useMemo(() => {
        const d = data || {};
        const journalCount = (d.journals || []).filter(j => j.name).length;
        const conferences = parseInt(d.conferences_presented || 0, 10);
        const proposalStatus = d.proposal_status || '';
        const projectAmount = d.project_amount || '';
        const consultancyAmount = d.consultancy_amount || '';
        const patentStatus = d.patent_status || '';
        let score10a = 0; if (journalCount >= 2) score10a = 20; else if (journalCount === 1) score10a = 15;
        let score10b = 0; if (conferences >= 3) score10b = 20; else if (conferences === 2) score10b = 15; else if (conferences === 1) score10b = 10;
        let score11a = 0; if (proposalStatus === 'submitted') score11a = 20;
        let score11b = 0; if (projectAmount === 'above_4L') score11b = 30; else if (projectAmount === '1L_to_4L') score11b = 25; else if (projectAmount === 'below_1L') score11b = 20;
        let score12a = 0; if (consultancyAmount === 'above_1L') score12a = 20; else if (consultancyAmount === 'below_1L') score12a = 15;
        let score12b = 0; if (patentStatus === 'awarded') score12b = 20; else if (patentStatus === 'applied') score12b = 15;
        return { score10a, score10b, score11a, score11b, score12a, score12b };
    }, [data]);


    // Staff View
    if (!isHodView) {
        return (
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>10.a. No. of papers published in journals</Typography>
                {journals.map((journal, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <TextField name="name" label={`Journal Publication ${index + 1}`} value={journal.name} onChange={(e) => handleJournalChange(index, e)} fullWidth size="small" />
                        <FileUpload fileUrl={journal.file_url} onUpload={(url) => handleUpload(index, url)} onRemove={() => handleRemove(index)} userId={userId} sectionName="section10a" rowIndex={index} />
                        <IconButton onClick={() => removeJournal(index)} color="secondary" disabled={journals.length < 2}><RemoveCircleOutlineIcon /></IconButton>
                    </Box>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addJournal} size="small">Add Publication</Button>
                <Typography sx={{ mt: 1 }}><strong>API Score: {scores.score10a} / 20</strong></Typography>
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>10.b. No. of papers presented in conferences</Typography>
                        <TextField type="number" name="conferences_presented" value={data?.conferences_presented || ''} onChange={handleChange} fullWidth size="small" sx={{ mt: 1 }} />
                        <Typography sx={{mt: 1}}><strong>API Score: {scores.score10b} / 20</strong></Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>11.a. Research Project proposals submitted</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}><InputLabel>Status</InputLabel><Select name="proposal_status" value={data?.proposal_status || ''} label="Status" onChange={handleChange}><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="submitted">Submitted</MenuItem><MenuItem value="not_submitted">Not Submitted</MenuItem></Select></FormControl>
                        <Typography sx={{mt: 1}}><strong>API Score: {scores.score11a} / 20</strong></Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>11.b. Research projects Received</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}><InputLabel>Amount</InputLabel><Select name="project_amount" value={data?.project_amount || ''} label="Amount" onChange={handleChange}><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="above_4L">≥ 4 lacs</MenuItem><MenuItem value="1L_to_4L">≥ 1 &lt; 4 lacs</MenuItem><MenuItem value="below_1L">&lt; 1 lac</MenuItem></Select></FormControl>
                        <Typography sx={{mt: 1}}><strong>API Score: {scores.score11b} / 30</strong></Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>12.a. Consultancy projects received</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}><InputLabel>Amount</InputLabel><Select name="consultancy_amount" value={data?.consultancy_amount || ''} label="Amount" onChange={handleChange}><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="above_1L">&gt; 1 lac</MenuItem><MenuItem value="below_1L">≤ 1 lac</MenuItem></Select></FormControl>
                        <Typography sx={{mt: 1}}><strong>API Score: {scores.score12a} / 20</strong></Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>12.b. Patents applied/awarded</Typography>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}><InputLabel>Status</InputLabel><Select name="patent_status" value={data?.patent_status || ''} label="Status" onChange={handleChange}><MenuItem value=""><em>Select</em></MenuItem><MenuItem value="applied">Applied</MenuItem><MenuItem value="awarded">Awarded</MenuItem></Select></FormControl>
                        <Typography sx={{mt: 1}}><strong>API Score: {scores.score12b} / 20</strong></Typography>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // --- HOD VIEW ---
    const renderSelectRow = (label, name, options) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
            <label><strong>{label}</strong></label>
            <input value={data?.[name] || 'N/A'} disabled style={{ width: '100px', textAlign: 'center', textTransform: 'capitalize' }} />
            <select name={name} value={hodData?.[name] || ''} onChange={handleChange} style={{ width: '100px' }}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
    const renderInputRow = (label, name) => (
         <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
            <label><strong>{label}</strong></label>
            <input type="number" value={data?.[name] || 0} disabled style={{ width: '60px', textAlign: 'center' }} />
            <input type="number" name={name} value={hodData?.[name] || ''} onChange={handleChange} style={{ width: '60px' }}/>
        </div>
    );
    return (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>10.a. Papers published in journals</Typography>
            {(data?.journals || []).map((journal, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, borderBottom: '1px solid #eee' }}>
                    <Typography>{journal.name || `Publication ${index + 1}`}</Typography>
                    {journal.file_url ? (<Button variant="outlined" size="small" component="a" href={journal.file_url} target="_blank">View Evidence</Button>) : (<Typography variant="body2" color="text.secondary">No Evidence</Typography>)}
                </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            
            {/* --- THIS IS THE CORRECTED PART WITH THE MISSING FIELDS FOR HOD VIEW --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold', marginBottom: '1rem' }}>
                <span>Parameter</span><span style={{textAlign: 'center'}}>SR</span><span style={{textAlign: 'center'}}>HR</span>
            </div>
            {renderInputRow("10.b. No. of papers presented in conferences", "conferences_presented")}
            {renderSelectRow("11.a. Research Project proposals submitted", "proposal_status", [{ value: "", label: "Select" }, { value: "submitted", label: "Submitted" }, { value: "not_submitted", label: "Not Submitted" }])}
            {renderSelectRow("11.b. Research projects Received", "project_amount", [{ value: "", label: "Select" }, { value: "above_4L", label: "≥ 4 lacs" }, { value: "1L_to_4L", label: "≥ 1 & < 4 lacs" }, { value: "below_1L", label: "< 1 lac" }])}
            {renderSelectRow("12.a. Consultancy projects received", "consultancy_amount", [{ value: "", label: "Select" }, { value: "above_1L", label: "> 1 lac" }, { value: "below_1L", label: "≤ 1 lac" }])}
            {renderSelectRow("12.b. Patents applied/awarded", "patent_status", [{ value: "", label: "Select" }, { value: "applied", label: "Applied" }, { value: "awarded", label: "Awarded" }])}
        </Box>
    );
};

export default Part3_Sections;