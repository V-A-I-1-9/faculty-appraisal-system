import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import FileUpload from './FileUpload';

// --- UI IMPORTS (with fixes) ---
// New (corrected) line
import { Box, Typography, Button, TextField, IconButton, RadioGroup, FormControlLabel, Radio, Select, MenuItem, FormControl, InputLabel, Chip, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const Part3_Section10c = ({ data, setData, isHodView = false, hodData, setHodData, journalsPublished }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const apiScore = useMemo(() => {
        const { selectedOption, details } = data || {};
        // --- CORRECTED LOGIC ---
        // Use the 'journalsPublished' prop which comes from section 10a's array length
        const totalJournals = parseInt(journalsPublished || 0, 10); 
        
        switch (selectedOption) {
            case 'scopus':
                const indexedPapersCount = (details?.papers || []).filter(p => p.name).length;
                if (totalJournals > 0 && indexedPapersCount > 0) {
                    const rawScore = (indexedPapersCount / totalJournals) * 40;
                    return Math.min(rawScore, 40);
                }
                return 0;
            case 'chapters': 
                const chapters = parseInt(details?.chapters_count || 0, 10); 
                if (chapters >= 5) return 40; if (chapters === 4) return 35; if (chapters === 3) return 30; if (chapters === 2) return 25; if (chapters === 1) return 20; return 0;
            case 'books': 
                const prescribed = details?.prescribed_status || ''; 
                if (prescribed === 'two_plus') return 40; if (prescribed === 'one') return 35; if (prescribed === 'authored') return 30; return 0;
            default: 
                return 0;
        }
    }, [data, journalsPublished]);
    const handleOptionChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        const selected = e.target.value;
        let initialDetails = {};
        if (selected === 'scopus') {
            initialDetails = { papers: [{ name: '', file_url: '' }] };
        }
        stateSetter({ selectedOption: selected, details: initialDetails });
    };

    const handleDetailChange = (e, index) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        const currentData = isHodView ? hodData : data;

        if (currentData.selectedOption === 'scopus') {
            const newPapers = [...(currentData.details.papers || [])];
            newPapers[index] = { ...newPapers[index], [name]: value };
            stateSetter({ ...currentData, details: { ...currentData.details, papers: newPapers } });
        } else {
            stateSetter({ ...currentData, details: { ...currentData.details, [name]: value } });
        }
    };
    
    const handleUpload = (index, url) => {
        const newPapers = [...(data.details.papers || [])];
        newPapers[index].file_url = url;
        setData({ ...data, details: { ...data.details, papers: newPapers } });
    };

    const handleRemove = (index) => {
        const newPapers = [...(data.details.papers || [])];
        newPapers[index].file_url = '';
        setData({ ...data, details: { ...data.details, papers: newPapers } });
    };

    const addPaper = () => {
        const papers = data.details.papers || [];
        setData({ ...data, details: { ...data.details, papers: [...papers, { name: '', file_url: '' }] } });
    };

    const removePaper = (index) => {
        const newPapers = [...data.details.papers];
        newPapers.splice(index, 1);
        setData({ ...data, details: { ...data.details, papers: newPapers } });
    };
    const renderDetailFields = (isForHod) => {
        const currentData = isForHod ? hodData : data;
        const isDisabled = isHodView && !isForHod;

        switch (currentData?.selectedOption) {
            case 'scopus':
                return (
                    <Box>
                        {(currentData?.details?.papers || []).map((paper, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <TextField name="name" label={`Indexed Paper ${index + 1}`} value={paper.name} onChange={(e) => handleDetailChange(e, index)} fullWidth size="small" disabled={isDisabled} />
                                {!isHodView && <FileUpload fileUrl={paper.file_url} onUpload={(url) => handleUpload(index, url)} onRemove={() => handleRemove(index)} userId={userId} sectionName="section10c" rowIndex={index} />}
                                {!isHodView && <IconButton onClick={() => removePaper(index)} color="secondary" disabled={(currentData?.details?.papers || []).length < 2}><RemoveCircleOutlineIcon /></IconButton>}
                            </Box>
                        ))}
                        {!isHodView && <Button startIcon={<AddCircleOutlineIcon />} onClick={addPaper} size="small">Add Indexed Paper</Button>}
                    </Box>
                );
            case 'chapters': 
                return <TextField type="number" name="chapters_count" label="No. of Book Chapters" value={currentData?.details?.chapters_count || ''} onChange={(e) => handleDetailChange(e)} disabled={isDisabled} size="small" />;
            case 'books': 
                return (
                    <FormControl fullWidth size="small" disabled={isDisabled}>
                        <InputLabel>Status</InputLabel>
                        <Select name="prescribed_status" value={currentData?.details?.prescribed_status || ''} label="Status" onChange={(e) => handleDetailChange(e)}>
                            <MenuItem value="two_plus">Prescribed by 2+ Universities</MenuItem>
                            <MenuItem value="one">Prescribed by 1 University</MenuItem>
                            <MenuItem value="authored">Authored (Not Prescribed)</MenuItem>
                        </Select>
                    </FormControl>
                );
            default: 
                return <Typography variant="body2" color="text.secondary">Select an option to add details.</Typography>;
        }
    };

    if (!isHodView) {
        return (
            <Box sx={{ border: '1px solid #eee', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>10.c. Indexed Papers / Book Chapters / Books Authored</Typography>
                <RadioGroup name="section10c_option" value={data?.selectedOption || ''} onChange={handleOptionChange} sx={{ pl: 1, mt: 1 }}>
                    <FormControlLabel value="scopus" control={<Radio size="small" />} label="Papers indexed in Scopus/WoS/UGC" />
                    <FormControlLabel value="chapters" control={<Radio size="small" />} label="Book chapters authored" />
                    <FormControlLabel value="books" control={<Radio size="small" />} label="Books Authored" />
                </RadioGroup>
                <Box sx={{ mt: 2, pl: 2 }}>{renderDetailFields(false)}</Box>
                <Divider sx={{ my: 2 }}/>
                <Typography sx={{fontWeight: 'bold', pl: 2}}>API Score for this section: {apiScore.toFixed(2)} / 40</Typography>
            </Box>
        );
    }
    
    // HOD view
    return (
       <Box sx={{ border: '1px solid #eee', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>10.c. Indexed Papers / Book Chapters / Books Authored</Typography>
            <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mt: 1 }}>
                <Typography sx={{ fontWeight: 'bold' }} variant="body2">Self-Rating (SR)</Typography>
                <Typography><strong>Selected Option:</strong> <Chip label={data?.selectedOption || 'N/A'} size="small" sx={{ml: 1}} /></Typography>
                <Box sx={{ mt: 2 }}>
                    {/* --- THIS IS THE FIX --- */}
                    {data?.selectedOption === 'scopus' &&
                        (data.details?.papers || []).map((paper, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>{paper.name || `Paper ${index + 1}`}</Typography>
                                {paper.file_url ? (<Button variant="outlined" size="small" component="a" href={paper.file_url} target="_blank">View Evidence</Button>) : (<Typography variant="body2" color="text.secondary">No Evidence</Typography>)}
                            </Box>
                        ))
                    }
                    {data?.selectedOption === 'chapters' && <Typography><strong>Count:</strong> {data?.details?.chapters_count || 'N/A'}</Typography>}
                    {data?.selectedOption === 'books' && <Typography><strong>Status:</strong> {data?.details?.prescribed_status || 'N/A'}</Typography>}
                </Box>
            </Box>
        </Box>
    );
};

export default Part3_Section10c;