import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

// Import the logo image from your assets folder
import logo from '../../assets/logo.png'; 

// Import MUI Components
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const Layout = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        // This is the main flex container for the whole page
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="sticky"> {/* Changed to sticky for better layout flow */}
                <Toolbar>
                    <Box 
                        component="img"
                        sx={{ height: 40, mr: 2 }}
                        alt="Institute Logo"
                        src={logo}
                    />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Faculty Appraisal System
                    </Typography>
                    <Button color="inherit" onClick={handleSignOut}>
                        Sign Out
                    </Button>
                </Toolbar>
            </AppBar>
            
            {/* Main content area - this will now grow to push the footer down */}
            <Box
                component="main"
                sx={{
                    backgroundColor: '#f4f6f8',
                    flexGrow: 1, // This is the key property
                    py: 4, // Use vertical padding instead of margin
                }}
            >
                <Container maxWidth="lg">
                    <Outlet /> {/* Pages will be rendered here */}
                </Container>
            </Box>

            {/* Footer - Now a direct child of the main flex container */}
            <Box 
                component="footer" 
                sx={{ 
                    py: 2, 
                    px: 2, 
                    backgroundColor: '#ffffff',
                    textAlign: 'center',
                    borderTop: '1px solid #e0e0e0'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Designed & Developed by Vaibhav MS, Dept. of ISE, MIT Mysore.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Contact for support: msvaibhav007@gmail.com
                </Typography>
            </Box>
        </Box>
    );
};

export default Layout;