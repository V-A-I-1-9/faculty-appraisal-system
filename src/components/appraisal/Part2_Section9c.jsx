import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import FileUpload from './FileUpload'; // Import our reusable component

// Import MUI components for a cleaner layout
import { Box, Typography, Button, TextField, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const Part2_Section9c = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const [userId, setUserId] = useState(null);

    // Get the current user's ID for the file path
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    const programs = data?.programs || [{ name: '', file_url: '' }];

    const handleChange = (index, event) => {
        const newPrograms = [...programs];
        newPrograms[index][event.target.name] = event.target.value;
        setData({ ...data, programs: newPrograms });
    };

    const handleUpload = (index, url) => {
        const newPrograms = [...programs];
        newPrograms[index].file_url = url;
        setData({ ...data, programs: newPrograms });
    };

    const handleRemove = (index) => {
        const newPrograms = [...programs];
        newPrograms[index].file_url = '';
        setData({ ...data, programs: newPrograms });
    };

    const addProgram = () => {
        setData({ ...data, programs: [...programs, { name: '', file_url: '' }] });
    };

    const removeProgram = (index) => {
        const newPrograms = [...programs];
        newPrograms.splice(index, 1);
        setData({ ...data, programs: newPrograms });
    };

    const apiScore = useMemo(() => {
        const num = programs.filter(p => p.name).length; // Only count programs with a name
        if (num >= 2) return 30;
        if (num === 1) return 25;
        return 0;
    }, [programs]);

    if (isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>9.c. FDPs/Workshops/etc. conducted / coordinated</h4>
                {programs.map((program, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                        <Typography>{program.name || `Program ${index + 1}`}</Typography>
                        {program.file_url ? (
                            <Button variant="outlined" size="small" component="a" href={program.file_url} target="_blank" rel="noopener noreferrer">
                                View Evidence
                            </Button>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No Evidence Uploaded</Typography>
                        )}
                    </Box>
                ))}
            </div>
        );
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>9.c. FDPs/Workshops/etc. conducted / coordinated</h4>
            {programs.map((program, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TextField
                        name="name"
                        label={`Program Name ${index + 1}`}
                        value={program.name}
                        onChange={(e) => handleChange(index, e)}
                        fullWidth
                        size="small"
                    />
                    <FileUpload
                        fileUrl={program.file_url}
                        onUpload={(url) => handleUpload(index, url)}
                        onRemove={() => handleRemove(index)}
                        userId={userId}
                        sectionName={`section9c`}
                        rowIndex={index}
                    />
                    <IconButton onClick={() => removeProgram(index)} color="secondary" disabled={programs.length === 1}>
                        <RemoveCircleOutlineIcon />
                    </IconButton>
                </Box>
            ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={addProgram} size="small">
                Add Program
            </Button>
            <hr style={{margin: '1rem 0'}} />
            <p><strong>API Score for this section: {apiScore} / 30</strong></p>
        </div>
    );
};

export default Part2_Section9c;