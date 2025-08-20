import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Import MUI components for the new design
import { Box, Container, Paper, Typography, Grid, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { toast } from 'react-toastify';

const CreateProfile = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '',
        staff_id: '',
        department_id: '',
        contact_number: '',
        present_designation: '',
        date_acquired: '',
        highest_qualification: '',
        specialization: '',
        is_research_guide: 'false',
        supervised_candidates_count: 0,
        service_years_mitm: '',
        previous_experience: '',
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            const { data, error } = await supabase.from('departments').select('id, name');
            if (error) {
                console.error('Error fetching departments:', error);
                toast.error('Could not load departments.');
            } else {
                setDepartments(data);
            }
        };
        fetchDepartments();
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const profileData = {
                id: user.id,
                email: user.email,
                ...formData,
            };

            const { error } = await supabase.from('profiles').insert(profileData);

            if (error) {
                toast.error('Error creating profile: ' + error.message);
            } else {
                toast.success('Profile created successfully!');
                navigate('/dashboard'); // Redirect to dashboard after creation
            }
        }
        setLoading(false);
    };
    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f4f6f8',
                py: 4
            }}
        >
            <Container component="main" maxWidth="sm">
                <Paper 
                    elevation={3}
                    sx={{
                        padding: { xs: 3, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <AccountCircleIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Create Your Profile
                    </Typography>
                    <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Please fill out your details to continue.
                    </Typography>

                    {/* --- REDESIGNED FORM LAYOUT --- */}
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField name="full_name" required fullWidth label="Full Name" value={formData.full_name} onChange={handleChange} autoFocus />
                            <TextField name="staff_id" required fullWidth label="Staff ID" value={formData.staff_id} onChange={handleChange} />
                            <FormControl fullWidth required>
                                <InputLabel>Department</InputLabel>
                                <Select name="department_id" value={formData.department_id} label="Department" onChange={handleChange}>
                                    <MenuItem value=""><em>Select Department</em></MenuItem>
                                    {departments.map(dept => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField name="contact_number" fullWidth label="Contact Number" value={formData.contact_number} onChange={handleChange} />
                            <TextField name="present_designation" fullWidth label="Present Designation" value={formData.present_designation} onChange={handleChange} />
                            <TextField name="date_acquired" fullWidth label="Date Acquired" type="date" value={formData.date_acquired} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                            <TextField name="highest_qualification" required fullWidth label="Highest Qualification" value={formData.highest_qualification} onChange={handleChange} />
                            <TextField name="specialization" required fullWidth label="Specialization" value={formData.specialization} onChange={handleChange} />
                            <FormControl fullWidth>
                                <InputLabel>Research Guide?</InputLabel>
                                <Select name="is_research_guide" value={formData.is_research_guide} label="Research Guide?" onChange={handleChange}>
                                    <MenuItem value="false">No</MenuItem>
                                    <MenuItem value="true">Yes</MenuItem>
                                </Select>
                            </FormControl>
                            {formData.is_research_guide === 'true' && (
                                <TextField type="number" name="supervised_candidates_count" fullWidth label="No. of Candidates Supervised" value={formData.supervised_candidates_count} onChange={handleChange} />
                            )}
                            <TextField type="number" name="service_years_mitm" required fullWidth label="Years of Service at MITM" value={formData.service_years_mitm} onChange={handleChange} />
                            <TextField type="number" name="previous_experience" required fullWidth label="Previous Experience (Years)" value={formData.previous_experience} onChange={handleChange} />
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 4, mb: 2, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Save Profile'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CreateProfile;