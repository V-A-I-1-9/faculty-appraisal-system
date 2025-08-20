import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

// Import MUI Components
import { Box, Typography, Paper, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for the edit dialog
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatedRole, setUpdatedRole] = useState('');
    const [updatedDept, setUpdatedDept] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select(`*, department:departments(id, name)`);
        
        const { data: deptData, error: deptError } = await supabase
            .from('departments')
            .select('*');

        if (userError || deptError) {
            toast.error("Failed to fetch data.");
        } else {
            setUsers(userData);
            setDepartments(deptData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setUpdatedRole(user.role);
        setUpdatedDept(user.department.id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleUpdateUser = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: updatedRole, department_id: updatedDept })
            .eq('id', selectedUser.id);

        if (error) {
            toast.error("Failed to update user: " + error.message);
        } else {
            toast.success("User updated successfully!");
            handleCloseModal();
            fetchData(); // Refresh the user list
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">User Management</Typography>
                <Button component={Link} to="/principal-dashboard" variant="outlined">Back to Dashboard</Button>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Manage roles and departments for all users in the system.
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.full_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.department?.name || 'N/A'}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                                <TableCell align="center">
                                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenModal(user)}>
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit User Dialog (Modal) */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="xs">
                <DialogTitle>Edit User: {selectedUser?.full_name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={updatedRole}
                                label="Role"
                                onChange={(e) => setUpdatedRole(e.target.value)}
                            >
                                <MenuItem value="staff">Staff</MenuItem>
                                <MenuItem value="hod">HOD</MenuItem>
                                <MenuItem value="principal">Principal</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={updatedDept}
                                label="Department"
                                onChange={(e) => setUpdatedDept(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleUpdateUser} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;