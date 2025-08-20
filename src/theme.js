import { createTheme } from '@mui/material/styles';

// This is where we define our application's design system.
const theme = createTheme({
    // 1. Color Palette (Neutral and Professional)
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // A standard, professional blue
        },
        secondary: {
            main: '#dc004e', // A contrasting color for accents
        },
        background: {
            default: '#f4f6f8', // A very light grey for the page background
            paper: '#ffffff',   // White for cards and surfaces
        },
    },

    // 2. Typography (Clean and Modern Fonts)
    typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },

    // 3. Shape (Rounded Corners for a Modern Look)
    shape: {
        borderRadius: 12, // This will make buttons, cards, etc. more rounded
    },

    // 4. Component Overrides (Set default styles for all components)
    components: {
        // --- Button ---
        MuiButton: {
            defaultProps: {
                disableElevation: true, // Creates a flatter, more minimal button
            },
            styleOverrides: {
                root: {
                    textTransform: 'none', // Buttons will use regular case, not ALL CAPS
                },
                contained: {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)', // A very subtle shadow
                }
            },
        },
        // --- Input Fields ---
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Rounded text fields
                },
            },
        },
        // --- Cards/Surfaces ---
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', // A very subtle shadow for all cards
                },
            },
        },
        // --- App Bar ---
        MuiAppBar: {
            defaultProps: {
                elevation: 0, // No shadow
            },
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#111',
                    borderBottom: '1px solid #e0e0e0', // A clean line separator
                },
            },
        },
    },
});

export default theme;