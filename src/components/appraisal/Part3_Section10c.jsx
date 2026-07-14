import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import FileUpload from './FileUpload';

import { Box, Typography, Button, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, Chip, Divider, Paper } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const Part3_Section10c = ({ data, setData, isHodView = false, hodData, setHodData, journalsPublished, isReadOnly = false }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    // Ensure data shape is properly initialized
    const currentData = isHodView ? hodData : data;
    const safeData = currentData || {};
    const safePapers = safeData.papers || [{ name: '', file_url: '' }];

    const apiScore = useMemo(() => {
        const totalJournals = parseInt(journalsPublished || 0, 10); 
        let score = 0;
        
        // 1. Scopus Score
        const indexedPapersCount = (safeData.papers || []).filter(p => p.name).length;
        if (totalJournals > 0 && indexedPapersCount > 0) {
            score += (indexedPapersCount / totalJournals) * 40;
        }

        // 2. Chapters Score
        const chapters = parseInt(safeData.chapters_count || 0, 10); 
        if (chapters >= 5) score += 40; 
        else if (chapters === 4) score += 35; 
        else if (chapters === 3) score += 30; 
        else if (chapters === 2) score += 25; 
        else if (chapters === 1) score += 20;

        // 3. Books Score
        const prescribed = safeData.prescribed_status || ''; 
        if (prescribed === 'two_plus') score += 40; 
        else if (prescribed === 'one') score += 35; 
        else if (prescribed === 'authored') score += 30;

        return Math.min(score, 40);
    }, [safeData, journalsPublished]);

    const handleDetailChange = (e, index) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;

        if (name === 'name') {
            const newPapers = [...safePapers];
            newPapers[index] = { ...newPapers[index], [name]: value };
            stateSetter({ ...safeData, papers: newPapers });
        } else {
            stateSetter({ ...safeData, [name]: value });
        }
    };
    
    const handleUpload = (index, url) => {
        const newPapers = [...safePapers];
        newPapers[index].file_url = url;
        setData({ ...safeData, papers: newPapers });
    };

    const handleRemove = (index) => {
        const newPapers = [...safePapers];
        newPapers[index].file_url = '';
        setData({ ...safeData, papers: newPapers });
    };

    const addPaper = () => {
        setData({ ...safeData, papers: [...safePapers, { name: '', file_url: '' }] });
    };

    const removePaper = (index) => {
        const newPapers = [...safePapers];
        newPapers.splice(index, 1);
        setData({ ...safeData, papers: newPapers });
    };

    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>10.c. Indexed Papers / Book Chapters / Books Authored</Typography>
                    <Chip label={`Score: ${apiScore.toFixed(2)} / 40`} color="primary" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* SCOPUS PAPERS */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Papers indexed in Scopus/WoS/UGC</Typography>
                        {safePapers.map((paper, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                <TextField name="name" label={`Indexed Paper ${index + 1}`} value={paper.name || ''} onChange={(e) => handleDetailChange(e, index)} size="small" sx={{ flexGrow: 1, minWidth: 200 }} />
                                <FileUpload fileUrl={paper.file_url} onUpload={(url) => handleUpload(index, url)} onRemove={() => handleRemove(index)} userId={userId} sectionName="section10c" rowIndex={index} />
                                <IconButton onClick={() => removePaper(index)} color="secondary" disabled={safePapers.length < 2}><RemoveCircleOutlineIcon /></IconButton>
                            </Box>
                        ))}
                        <Button startIcon={<AddCircleOutlineIcon />} onClick={addPaper} size="small" variant="outlined">Add Indexed Paper</Button>
                    </Box>

                    <Divider />

                    {/* BOOK CHAPTERS */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Book Chapters Authored</Typography>
                        <TextField type="number" name="chapters_count" label="No. of Book Chapters" value={safeData.chapters_count || ''} onChange={handleDetailChange} size="small" sx={{ width: 200 }} />
                    </Box>

                    <Divider />

                    {/* BOOKS AUTHORED */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Books Authored</Typography>
                        <FormControl size="small" sx={{ width: 300 }}>
                            <InputLabel>Status</InputLabel>
                            <Select name="prescribed_status" value={safeData.prescribed_status || ''} label="Status" onChange={handleDetailChange}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="two_plus">Prescribed by 2+ Universities</MenuItem>
                                <MenuItem value="one">Prescribed by 1 University</MenuItem>
                                <MenuItem value="authored">Authored (Not Prescribed)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
        );
    }
    
    // HOD view
    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>10.c. Indexed Papers / Book Chapters / Books Authored</Typography>
            </Box>

            {/* Self Rating Display */}
            <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mb: 3 }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }} variant="body2">Self-Rating (SR)</Typography>
                
                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Papers indexed in Scopus/WoS/UGC:</Typography>
                {(data?.papers || []).length > 0 && (data?.papers || [])[0].name ? (
                    (data?.papers || []).map((paper, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pl: 2 }}>
                            <Typography variant="body2">- {paper.name || `Paper ${index + 1}`}</Typography>
                            {paper.file_url ? (<Button variant="outlined" size="small" component="a" href={paper.file_url} target="_blank">View Evidence</Button>) : (<Typography variant="caption" color="text.secondary">No Evidence</Typography>)}
                        </Box>
                    ))
                ) : <Typography variant="body2" sx={{ pl: 2 }}>None</Typography>}

                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Book Chapters Count:</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>{data?.chapters_count || 'None'}</Typography>

                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Books Authored Status:</Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>{data?.prescribed_status || 'None'}</Typography>
            </Box>

            {/* HOD Rating Input */}
            <Typography sx={{ fontWeight: 'bold', mb: 1 }} variant="body2">HOD Rating (HR)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Papers indexed in Scopus/WoS/UGC</Typography>
                    {safePapers.map((paper, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <TextField name="name" label={`Indexed Paper ${index + 1}`} value={paper.name || ''} onChange={(e) => handleDetailChange(e, index)} size="small" sx={{ flexGrow: 1 }} disabled={isReadOnly} />
                            {!isReadOnly && <IconButton onClick={() => removePaper(index)} color="secondary" disabled={safePapers.length < 2}><RemoveCircleOutlineIcon /></IconButton>}
                        </Box>
                    ))}
                    {!isReadOnly && <Button startIcon={<AddCircleOutlineIcon />} onClick={addPaper} size="small" variant="outlined">Add Indexed Paper</Button>}
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Book Chapters Authored</Typography>
                    <TextField type="number" name="chapters_count" label="No. of Book Chapters" value={safeData.chapters_count || ''} onChange={handleDetailChange} size="small" sx={{ width: 200 }} disabled={isReadOnly} />
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Books Authored</Typography>
                    <FormControl size="small" sx={{ width: 300 }}>
                        <InputLabel>Status</InputLabel>
                        <Select name="prescribed_status" value={safeData.prescribed_status || ''} label="Status" onChange={handleDetailChange} disabled={isReadOnly}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="two_plus">Prescribed by 2+ Universities</MenuItem>
                            <MenuItem value="one">Prescribed by 1 University</MenuItem>
                            <MenuItem value="authored">Authored (Not Prescribed)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
        </Paper>
    );
};

export default Part3_Section10c;