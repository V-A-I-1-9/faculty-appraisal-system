import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import { Container, Box, Paper, Typography, Avatar, Grid, TextField, Button, CircularProgress, Alert } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            // Sign the user out so they can log in fresh with their new password
            await supabase.auth.signOut();
            setTimeout(() => {
                navigate('/');
            }, 2500);
        }
    };

    return (
        <Grid
          container
          component="main"
          sx={{ 
            height: '100vh',
            backgroundColor: '#f4f6f8'
          }}
          justifyContent="center"
          alignItems="center"
        >
            <Grid
                item
                xs={12}
                sm={8}
                md={5}
                lg={4}
                component={Paper}
                elevation={6}
                sx={{
                    padding: { xs: 2, sm: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockResetIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Reset Your Password
                </Typography>
                <Typography component="p" variant="body2" sx={{ mt: 1, mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                    Enter your new password below.
                </Typography>

                {success ? (
                    <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                        Password updated successfully! Redirecting to login...
                    </Alert>
                ) : (
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '400px' }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                            autoFocus
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2, py: 1.5 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Update Password'}
                        </Button>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};

export default ResetPassword;
