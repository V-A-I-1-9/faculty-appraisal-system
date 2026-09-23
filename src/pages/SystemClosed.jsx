import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SystemClosed = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxWidth: 500, borderRadius: 3 }}>
                <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
                    Appraisal Process Closed
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                    The faculty appraisal process for this academic year has officially concluded. 
                    Access to the appraisal system is currently restricted to the Principal only.
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    onClick={handleLogout}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                    Sign Out
                </Button>
            </Paper>
        </Box>
    );
};

export default SystemClosed;
