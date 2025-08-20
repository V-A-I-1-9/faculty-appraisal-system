import React from 'react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';

// Import MUI components for the UI
import { Box, Button, Typography, IconButton, CircularProgress, Link } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FileUpload = ({ fileUrl, onUpload, onRemove, userId, sectionName, rowIndex }) => {
    const [uploading, setUploading] = React.useState(false);

    const handleFileUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) {
                throw new Error('You must select an image to upload.');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${sectionName}-${rowIndex + 1}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // Upload the file to the 'appraisal-evidence' bucket
            let { error: uploadError } = await supabase.storage
                .from('appraisal-evidence')
                .upload(filePath, file, { upsert: true }); // upsert: true allows overwriting

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL of the uploaded file to store in the database
            const { data } = supabase.storage
                .from('appraisal-evidence')
                .getPublicUrl(filePath);

            onUpload(data.publicUrl);
            toast.success('File uploaded successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileRemove = async () => {
        try {
            const fileName = fileUrl.split('/').pop();
            const filePath = `${userId}/${fileName}`;

            // Remove the file from storage
            const { error } = await supabase.storage
                .from('appraisal-evidence')
                .remove([filePath]);

            if (error) {
                throw error;
            }

            onRemove();
            toast.success('File removed successfully!');
        } catch (error) {
            toast.error('Error removing file: ' + error.message);
        }
    };

    const getFileName = (url) => {
        try {
            return url.split('/').pop().split('?')[0];
        } catch (e) {
            return "Invalid URL";
        }
    };

    if (uploading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={20} /> <Typography variant="body2">Uploading...</Typography></Box>;
    }
    
    if (fileUrl) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2" component={Link} href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {getFileName(fileUrl)}
                </Typography>
                <IconButton size="small" onClick={handleFileRemove}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        );
    }

    return (
        <Button
            variant="outlined"
            size="small"
            component="label"
            startIcon={<UploadFileIcon />}
        >
            Upload Evidence
            <input
                type="file"
                hidden
                onChange={handleFileUpload}
            />
        </Button>
    );
};

export default FileUpload;