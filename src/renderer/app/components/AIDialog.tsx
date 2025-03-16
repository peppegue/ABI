'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface AIDialogProps {
  open: boolean;
  onClose: () => void;
  onAsk: (question: string) => Promise<string>;
}

export default function AIDialog({ open, onClose, onAsk }: AIDialogProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const answer = await onAsk(question);
      setResponse(answer);
    } catch (error) {
      console.error('Errore nella richiesta:', error);
      setResponse('Mi dispiace, si è verificato un errore nella richiesta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chiedi all'AI</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="La tua domanda"
            fullWidth
            multiline
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
        </Box>
        {response && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body1">{response}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Chiudi
        </Button>
        <Button onClick={handleAsk} color="primary" disabled={!question.trim() || loading}>
          {loading ? 'Elaborazione...' : 'Chiedi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 