import React, { useMemo } from 'react';
import { Box, Typography, Chip, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';

const Part2_Section8b = ({ data, setData, isHodView = false, hodData, setHodData }) => {

    const currentData = isHodView ? hodData : data;
    const safeData = currentData || {};

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...safeData, [name]: value });
    };

    const apiScore = useMemo(() => {
        let score = 0;
        
        // 1. Best Project
        if (safeData.best_project_place === '1') score += 60;
        else if (safeData.best_project_place === '2') score += 55;
        else if (safeData.best_project_place === '3') score += 50;

        // 2. Exhibited
        if (safeData.exhibited_status === 'won') score += 60;
        else if (safeData.exhibited_status === 'exhibited') score += 40;

        // 3. Funded
        const funds = parseFloat(safeData.funding_amount || 0);
        if (funds >= 5000) score += 60;
        else if (funds > 0 && funds < 5000) score += 50;

        // 4. Publication
        const pubs = parseInt(safeData.publication_count || 0, 10);
        if (pubs >= 1) score += 60;

        return Math.min(score, 60);
    }, [safeData]);

    if (!isHodView) {
        return (
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>8.b. Best Project Awards / Publications / Funding</Typography>
                    <Chip label={`Score: ${apiScore} / 60`} color="primary" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Best Projects Awarded</Typography>
                        <FormControl size="small" sx={{ width: 250 }}>
                            <InputLabel>Place Won</InputLabel>
                            <Select name="best_project_place" value={safeData.best_project_place || ''} label="Place Won" onChange={handleDetailChange}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="1">1st Place</MenuItem>
                                <MenuItem value="2">2nd Place</MenuItem>
                                <MenuItem value="3">3rd Place</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Student Project Exhibited</Typography>
                        <FormControl size="small" sx={{ width: 250 }}>
                            <InputLabel>Status</InputLabel>
                            <Select name="exhibited_status" value={safeData.exhibited_status || ''} label="Status" onChange={handleDetailChange}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="won">Won in Competition</MenuItem>
                                <MenuItem value="exhibited">Only Exhibited</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Funded by External Agency</Typography>
                        <TextField type="number" name="funding_amount" label="Funding Amount (INR)" value={safeData.funding_amount || ''} onChange={handleDetailChange} size="small" sx={{ width: 250 }} />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Student Project Paper Publication(s)</Typography>
                        <TextField type="number" name="publication_count" label="No. of Publications" value={safeData.publication_count || ''} onChange={handleDetailChange} size="small" sx={{ width: 250 }} />
                    </Box>
                </Box>
            </Paper>
        );
    }
    
    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>8.b. Best Project Awards / Publications / Funding</Typography>
            </Box>

            {/* Self Rating Display */}
            <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mb: 3 }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }} variant="body2">Self-Rating (SR)</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Best Projects Awarded:</Typography>
                    <Typography variant="body2">{data?.best_project_place ? `${data.best_project_place} Place` : 'None'}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Project Exhibited:</Typography>
                    <Typography variant="body2">{data?.exhibited_status || 'None'}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Funding (INR):</Typography>
                    <Typography variant="body2">{data?.funding_amount || 'None'}</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Publications:</Typography>
                    <Typography variant="body2">{data?.publication_count || 'None'}</Typography>
                </Box>
            </Box>

            {/* HOD Rating Input */}
            <Typography sx={{ fontWeight: 'bold', mb: 1 }} variant="body2">HOD Rating (HR)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Best Projects Awarded</Typography>
                    <FormControl size="small" sx={{ width: 250 }}>
                        <InputLabel>Place Won</InputLabel>
                        <Select name="best_project_place" value={safeData.best_project_place || ''} label="Place Won" onChange={handleDetailChange}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="1">1st Place</MenuItem>
                            <MenuItem value="2">2nd Place</MenuItem>
                            <MenuItem value="3">3rd Place</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Student Project Exhibited</Typography>
                    <FormControl size="small" sx={{ width: 250 }}>
                        <InputLabel>Status</InputLabel>
                        <Select name="exhibited_status" value={safeData.exhibited_status || ''} label="Status" onChange={handleDetailChange}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="won">Won in Competition</MenuItem>
                            <MenuItem value="exhibited">Only Exhibited</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Funded by External Agency</Typography>
                    <TextField type="number" name="funding_amount" label="Funding Amount (INR)" value={safeData.funding_amount || ''} onChange={handleDetailChange} size="small" sx={{ width: 250 }} />
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Student Project Paper Publication(s)</Typography>
                    <TextField type="number" name="publication_count" label="No. of Publications" value={safeData.publication_count || ''} onChange={handleDetailChange} size="small" sx={{ width: 250 }} />
                </Box>
            </Box>
        </Paper>
    );
};

export default Part2_Section8b;