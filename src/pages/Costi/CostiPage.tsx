// frontend/src/pages/Costi/CostiPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Dialog,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Costo, TipologiaMateriale, CATEGORIE_COSTO } from '../../types';
import { CostiService } from '../../services/CostiService';
import { TipologieMaterialiService } from '../../services/TipologieMaterialiService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';
import CostoForm from './CostoForm';

interface FiltriCosti {
  dataInizio: string;
  dataFine: string;
  categoria: string;
  tipologiaId?: number;
  search: string;
}

// Funzioni helper per gestire le date
const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
    return null;
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.warn('Errore parsing data:', dateString, error);
    return null;
  }
};

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Errore formattazione data:', date, error);
    return '';
  }
};

const CostiPage: React.FC = () => {
  // State per dati
  const [costi, setCosti] = useState<Costo[]>([]);
  const [tipologie, setTipologie] = useState<TipologiaMateriale[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [costoSelezionato, setCostoSelezionato] = useState<Costo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State per filtri
  const [filtri, setFiltri] = useState<FiltriCosti>({
    dataInizio: '',
    dataFine: '',
    categoria: '',
    tipologiaId: undefined,
    search: '',
  });

  const { aggiungiNotifica } = useNotifiche();

  const caricaDatiIniziali = React.useCallback(async () => {
    try {
      const tipologieRes = await TipologieMaterialiService.getTipologie(true);
      setTipologie(tipologieRes.data);
    } catch (error) {
      console.error('Errore caricamento dati iniziali:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dei dati di base',
      });
    }
  }, [aggiungiNotifica]);

  const caricaCosti = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await CostiService.getCosti({
        ...filtri,
        page: page + 1,
        limit: rowsPerPage,
      });

      setCosti(response.data);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Errore caricamento costi:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dei costi',
      });
    } finally {
      setLoading(false);
    }
  }, [filtri, page, rowsPerPage, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiIniziali();
  }, [caricaDatiIniziali]);

  useEffect(() => {
    caricaCosti();
  }, [caricaCosti]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (costo: Costo | null = null) => {
    setCostoSelezionato(costo);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCostoSelezionato(null);
  };

  const handleSalvaCosto = () => {
    handleCloseDialog();
    caricaCosti();
    aggiungiNotifica({
      tipo: 'success',
      titolo: 'Successo',
      messaggio: costoSelezionato ? 'Costo aggiornato' : 'Costo creato',
    });
  };

  const handleEliminaCosto = async (id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo costo?')) {
      try {
        await CostiService.deleteCosto(id);
        caricaCosti();
        aggiungiNotifica({
          tipo: 'success',
          titolo: 'Successo',
          messaggio: 'Costo eliminato con successo',
        });
      } catch (error) {
        aggiungiNotifica({
          tipo: 'error',
          titolo: 'Errore',
          messaggio: 'Errore nell\'eliminazione del costo',
        });
      }
    }
  };

  const handleFilterChange = (field: keyof FiltriCosti, value: any) => {
    setFiltri(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const resetFiltri = () => {
    setFiltri({
      dataInizio: '',
      dataFine: '',
      categoria: '',
      tipologiaId: undefined,
      search: '',
    });
    setPage(0);
  };

  const getCategoriaChip = (categoria: string) => {
    const colori = {
      personale: 'primary',
      utilities: 'secondary',
      manutenzione: 'warning',
      trasporti: 'info',
      smaltimento: 'error',
    } as const;

    return (
      <Chip 
        label={categoria.charAt(0).toUpperCase() + categoria.slice(1)} 
        color={colori[categoria as keyof typeof colori] || 'default'} 
        size="small" 
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon />
          Gestione Costi
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={() => {/* TODO: Aprire dialog analisi costi */}}
          >
            Analisi Costi
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuovo Costo
          </Button>
        </Box>
      </Box>

      {/* Filtri */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Filtri</Typography>
            <Box>
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterIcon />
              </IconButton>
              <Button onClick={resetFiltri} size="small">
                Reset
              </Button>
            </Box>
          </Box>

          {showFilters && (
            <Grid container spacing={2}>
              {/* Data Inizio */}
              <Grid component="div" item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Data Inizio"
                  value={parseDate(filtri.dataInizio)} // FIX: Usa parseDate
                  onChange={(date) => handleFilterChange('dataInizio', formatDateForInput(date))} // FIX: Usa formatDateForInput
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              
              {/* Data Fine */}
              <Grid component="div" item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Data Fine"
                  value={parseDate(filtri.dataFine)} // FIX: Usa parseDate
                  onChange={(date) => handleFilterChange('dataFine', formatDateForInput(date))} // FIX: Usa formatDateForInput
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              
              {/* Categoria */}
              <Grid component="div" item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filtri.categoria}
                    onChange={(e) => handleFilterChange('categoria', e.target.value)}
                    label="Categoria"
                  >
                    <MenuItem value="">Tutte</MenuItem>
                    {CATEGORIE_COSTO.map((categoria) => (
                      <MenuItem key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Tipologia */}
              <Grid component="div" item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipologia</InputLabel>
                  <Select
                    value={filtri.tipologiaId || ''}
                    onChange={(e) => handleFilterChange('tipologiaId', e.target.value || undefined)}
                    label="Tipologia"
                  >
                    <MenuItem value="">Tutte</MenuItem>
                    {tipologie.map((tipologia) => (
                      <MenuItem key={tipologia.id} value={tipologia.id}>
                        {tipologia.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Ricerca */}
              <Grid component="div" item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ricerca"
                  placeholder="Descrizione, fornitore..."
                  value={filtri.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Tabella */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : costi.length === 0 ? (
            <Alert severity="info">Nessun costo trovato</Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Descrizione</TableCell>
                      <TableCell>Fornitore</TableCell>
                      <TableCell>Tipologia</TableCell>
                      <TableCell align="right">Importo</TableCell>
                      <TableCell>Numero Documento</TableCell>
                      <TableCell align="center">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costi.map((costo) => (
                      <TableRow key={costo.id} hover>
                        <TableCell>{formatDate(costo.data_costo)}</TableCell>
                        <TableCell>{getCategoriaChip(costo.categoria)}</TableCell>
                        <TableCell>{costo.descrizione}</TableCell>
                        <TableCell>{costo.fornitore || '-'}</TableCell>
                        <TableCell>{costo.TipologiaMateriale?.nome || '-'}</TableCell>
                        <TableCell align="right">{formatCurrency(costo.importo)}</TableCell>
                        <TableCell>{costo.numero_documento || '-'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(costo)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEliminaCosto(costo.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Righe per pagina:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} di ${count !== -1 ? count : `più di ${to}`}`
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {dialogOpen && (
          <CostoForm
            costo={costoSelezionato}
            tipologie={tipologie}
            onSalva={handleSalvaCosto}
            onAnnulla={handleCloseDialog}
          />
        )}
      </Dialog>

      {/* FAB per azioni rapide */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CostiPage;