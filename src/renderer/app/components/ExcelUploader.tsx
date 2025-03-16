'use client';

import { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function ExcelUploader({ onFileUpload }: { onFileUpload: (file: File) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        onFileUpload(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <UploadBox
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      sx={{ backgroundColor: dragActive ? 'action.hover' : 'background.paper' }}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="excel-upload"
      />
      <label htmlFor="excel-upload">
        <Button component="span" variant="contained" color="primary">
          Seleziona File Excel
        </Button>
      </label>
      <Typography variant="body1" sx={{ mt: 2 }}>
        o trascina qui il tuo file
      </Typography>
    </UploadBox>
  );
} 