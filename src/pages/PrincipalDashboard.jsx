import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

// Import MUI components for the new design
import { Box, Typography, Paper, Button, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, FormControl, InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';

const PrincipalDashboard = () => {
    const navigate = useNavigate();
    const [appraisals, setAppraisals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bestFacultyByDept, setBestFacultyByDept] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'grand_api_score_final', direction: 'descending' });
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const adjudicateBestFaculty = useCallback((appraisalList) => {
        const departments = {};
        appraisalList.forEach(app => {
            const deptName = app.profile.department.name;
            if (!departments[deptName]) { departments[deptName] = []; }
            departments[deptName].push(app);
        });

        const winners = {};
        for (const deptName in departments) {
            const candidates = departments[deptName];
            const eligibleCandidates = candidates.filter(cand => {
                const part2HrScore = cand.part2_hr_score;
                const finalGrandScore = cand.grand_api_score_final;
                if (!part2HrScore || !finalGrandScore) return false;
                const part2Percent = (part2HrScore / 350) * 100;
                return part2Percent > 75 && finalGrandScore > 75;
            });

            if (eligibleCandidates.length > 0) {
                const winner = eligibleCandidates.reduce((best, current) => current.grand_api_score_final > best.grand_api_score_final ? current : best);
                winners[deptName] = winner.profile.id;
            }
        }
        setBestFacultyByDept(winners);
    }, []);

    const processedAppraisals = useMemo(() => {
        return appraisals.map(app => {
            const p2_hr = app.part2_hr_score;
            const p3_hr = app.part3_hr_score;
            const p4_hr = app.part4_hr_score;
            const grand_score = app.grand_api_score_final;
            let category = 'N/A';
            if (p2_hr != null && p3_hr != null && p4_hr != null && grand_score != null) {
                const p2_percent = (p2_hr / 350) * 100;
                const p3_percent = (p3_hr / 170) * 100;
                const p4_percent = (p4_hr / 180) * 100;
                if (p2_percent >= 60 && p3_percent >= 60 && p4_percent >= 60 && grand_score >= 70) category = 'A';
                else if (p2_percent >= 50 && p3_percent >= 50 && p4_percent >= 50 && grand_score >= 60) category = 'B';
                else if (p2_percent >= 50 && p3_percent < 50 && p4_percent >= 50 && grand_score >= 55) category = 'C';
                else if (p2_percent >= 50 && p3_percent >= 50 && p4_percent < 50 && grand_score >= 50) category = 'D';
                else if (p2_percent < 50 && p3_percent >= 50 && p4_percent < 50 && grand_score >= 40) category = 'E';
                else if (p2_percent < 50 && p3_percent < 50 && p4_percent < 50) category = 'F';
                else category = 'Not Categorized';
            }
            return { ...app, category };
        });
    }, [appraisals]);

    useEffect(() => {
        const fetchReviewedAppraisals = async () => {
            const { data, error } = await supabase
                .from('appraisals')
                .select(`*, profile:profiles ( *, department:departments ( id, name ) )`)
                .eq('status', 'reviewed_by_hod');
            if (error) {
                console.error("Error fetching appraisals:", error);
            } else {
                setAppraisals(data);
                adjudicateBestFaculty(data);
                const uniqueDepts = [...new Map(data.map(item => [item.profile.department.id, item.profile.department])).values()];
                setDepartments(uniqueDepts);
            }
            setLoading(false);
        };
        fetchReviewedAppraisals();
    }, [adjudicateBestFaculty]);

    const sortedAndFilteredAppraisals = useMemo(() => {
        let sortableItems = [...processedAppraisals];
        if (departmentFilter !== 'all') {
            sortableItems = sortableItems.filter(app => app.profile.department.id === departmentFilter);
        }
        sortableItems.sort((a, b) => {
            const valA = a.grand_api_score_final || 0;
            const valB = b.grand_api_score_final || 0;
            if (valA < valB) { return sortConfig.direction === 'ascending' ? -1 : 1; }
            if (valA > valB) { return sortConfig.direction === 'ascending' ? 1 : -1; }
            return 0;
        });
        return sortableItems;
    }, [processedAppraisals, sortConfig, departmentFilter]);
    
    const handleSortRequest = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        const formattedData = sortedAndFilteredAppraisals.map(app => ({
            "Staff Name": app.profile.full_name,
            "Staff ID": app.profile.staff_id,
            "Department": app.profile.department.name,
            "Final Score (HR)": app.grand_api_score_final?.toFixed(2),
            "Category": app.category,
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty Appraisals");
        XLSX.writeFile(workbook, "FacultyAppraisalReport.xlsx");
    };

    const handleOpenProfileModal = (profile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsModalOpen(false);
        setSelectedProfile(null);
    };

    // --- THIS IS THE MISSING FUNCTION ---
    const getCategoryRowColor = (category) => {
        switch (category) {
            case 'A': return '#e8f5e9'; // Light Green
            case 'B': return '#f1f8e9'; // Lighter Green
            case 'C': return '#fffde7'; // Light Yellow
            case 'D': return '#fff3e0'; // Light Orange
            case 'E': return '#ffccbc'; // Light Red
            case 'F': return '#ffcdd2'; // Red
            default: return 'inherit';
        }
    };
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">Principal Dashboard</Typography>
                <Box>
                    <Button component={Link} to="/principal/user-management" variant="contained" sx={{ mr: 2 }}>
                         Manage Users
                    </Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
                        Export to Excel
                    </Button>
                </Box>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                View and manage all HOD-reviewed faculty appraisals.
            </Typography>

            <Paper>
                <Box sx={{ p: 2 }}>
                    <FormControl size="small">
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={departmentFilter}
                            label="Department"
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                        >
                            <MenuItem value="all">All Departments</MenuItem>
                            {departments.map(dept => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Staff Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    <TableSortLabel
                                        active={sortConfig.key === 'grand_api_score_final'}
                                        direction={sortConfig.direction}
                                        onClick={() => handleSortRequest('grand_api_score_final')}
                                    >
                                        Final Score
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedAndFilteredAppraisals.map((appraisal) => {
                                const isBest = bestFacultyByDept[appraisal.profile.department.name] === appraisal.profile.id;
                                return (
                                <TableRow key={appraisal.id} hover sx={{ backgroundColor: getCategoryRowColor(appraisal.category) }}>
                                    <TableCell>
                                        {appraisal.profile.full_name}
                                        {isBest && <Chip icon={<StarIcon />} label="Best Faculty" color="success" size="small" sx={{ ml: 2 }} />}
                                    </TableCell>
                                    <TableCell>{appraisal.profile.department.name}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{appraisal.grand_api_score_final?.toFixed(2) || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip label={appraisal.category} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <IconButton color="default" onClick={() => handleOpenProfileModal(appraisal.profile)} title="View Profile">
                                                <PersonIcon />
                                            </IconButton>
                                            <Button size="small" component={Link} to={`/principal/view/${appraisal.id}`} startIcon={<VisibilityIcon />}>
                                                View
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={isModalOpen} onClose={handleCloseProfileModal} fullWidth maxWidth="sm">
                <DialogTitle>Staff Profile</DialogTitle>
                <DialogContent>
                    {selectedProfile && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}><Typography><strong>Name:</strong> {selectedProfile.full_name}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Staff ID:</strong> {selectedProfile.staff_id}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {selectedProfile.email}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Contact:</strong> {selectedProfile.contact_number || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Department:</strong> {selectedProfile.department.name}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Designation:</strong> {selectedProfile.present_designation || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Date Acquired:</strong> {selectedProfile.date_acquired || 'N/A'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Highest Qualification:</strong> {selectedProfile.highest_qualification}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Specialization:</strong> {selectedProfile.specialization}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Research Guide:</strong> {selectedProfile.is_research_guide ? 'Yes' : 'No'}</Typography></Grid>
                            {selectedProfile.is_research_guide && <Grid item xs={12} sm={6}><Typography><strong>Candidates Supervised:</strong> {selectedProfile.supervised_candidates_count}</Typography></Grid>}
                            <Grid item xs={12} sm={6}><Typography><strong>Years at MITM:</strong> {selectedProfile.service_years_mitm}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Previous Experience:</strong> {selectedProfile.previous_experience} years</Typography></Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProfileModal}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PrincipalDashboard;