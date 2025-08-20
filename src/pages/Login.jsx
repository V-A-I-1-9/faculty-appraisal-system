import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Import MUI components, including Grid
import { Container, Box, Paper, Typography, Avatar, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                navigate('/dashboard');
            }
        });
        return () => subscription.unsubscribe();
    }, [navigate]);

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
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Faculty Appraisal System
                </Typography>
                <Typography component="p" variant="body2" sx={{ mt: 1, mb: 3 }}>
                    Maharaja Institute of Technology Mysore
                </Typography>
                
                <Box sx={{ width: '100%', maxWidth: '400px' }}>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#1976d2',
                                        brandAccent: '#115293',
                                    },
                                    radii: {
                                        borderRadius: '8px',
                                        buttonBorderRadius: '8px',
                                    }
                                },
                            },
                        }}
                        providers={[]}
                        theme="light"
                    />
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;