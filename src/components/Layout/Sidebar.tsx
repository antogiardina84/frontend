// frontend/src/components/Layout/Sidebar.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Input as InputIcon,
  Settings as SettingsIcon,
  Output as OutputIcon,
  Science as ScienceIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Assessment as ReportIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

interface SidebarProps {
  onMobileClose?: () => void;
}

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
  text: 'Configurazione',
  path: '/configurazione', 
  icon: <SettingsIcon />  // o l'icona che preferisci
  },
  {
    text: 'Ingressi',
    icon: <InputIcon />,
    path: '/ingressi',
  },
  {
    text: 'Lavorazioni',
    icon: <SettingsIcon />,
    path: '/lavorazioni',
  },
  {
    text: 'Uscite',
    icon: <OutputIcon />,
    path: '/uscite',
  },
  {
    text: 'Analisi Qualitative',
    icon: <ScienceIcon />,
    path: '/analisi',
  },
  {
    text: 'Fatturazione',
    icon: <ReceiptIcon />,
    path: '/fatturazione',
  },
  {
    text: 'Costi',
    icon: <MoneyIcon />,
    path: '/costi',
  },
  {
    text: 'Giacenze',
    icon: <InventoryIcon />,
    path: '/giacenze',
  },
  {
    text: 'Report',
    icon: <ReportIcon />,
    path: '/report',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title */}
      <Toolbar sx={{ px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              DOMUS RICYCLE
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Management System
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Footer info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Versione 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;