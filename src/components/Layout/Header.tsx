// frontend/src/components/Layout/Header.tsx
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNotifiche } from '../../contexts/NotificheContext';

const Header: React.FC = () => {
  const { notifiche } = useNotifiche();
  const notificheNonLette = notifiche.filter(n => !n.letta).length;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Sistema di Gestione Domus Ricycle
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Aggiorna">
          <IconButton color="inherit" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Notifiche">
          <IconButton color="inherit">
            <Badge badgeContent={notificheNonLette} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Header;