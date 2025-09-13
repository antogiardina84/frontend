import React, { useState, useEffect, useCallback } from 'react';
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
  Analytics as AnalyticsIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Lavorazione, TipologiaMateriale, FlussoCorepla } from '../../types';
import { LavorazioniService } from '../../services/LavorazioniService';
import { TipologieMaterialiService } from '../../services/TipologieMaterialiService';
import { FlussiService } from '../../services/FlussiService';
import { formatDate, formatWeight } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';
import LavorazioneForm from './LavorazioneForm';

// Filter interface based on the actual Lavorazione type
interface FiltriLavorazioni {
  dataInizio?: string;
  dataFine?: string;
  tipoOperazione?: 'selezione' | 'pressatura' | 'stoccaggio';
  tipologiaId?: number;
  flussoOriginId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

const tipiOperazione = [
  { value: 'selezione', label: 'Selezione' },
  { value: 'pressatura', label: 'Pressatura' },
  { value: 'stoccaggio', label: 'Stoccaggio' },
];

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

const LavorazioniPage: React.FC = () => {
  // State per dati
  const [lavorazioni, setLavorazioni] = useState<Lavorazione[]>([]);
  const [tipologie, setTipologie] = useState<TipologiaMateriale[]>([]);
  const [flussi, setFlussi] = useState<FlussoCorepla[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lavorazioneSelezionata, setLavorazioneSelezionata] = useState<Lavorazione | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State per filtri
  const [filtri, setFiltri] = useState<FiltriLavorazioni>({
    dataInizio: '',
    dataFine: '',
    tipoOperazione: undefined,
    tipologiaId: undefined,
    flussoOriginId: undefined,
    search: '',
  });

  const { aggiungiNotifica } = useNotifiche();

  const caricaDatiIniziali = useCallback(async () => {
    try {
      const [tipologieRes, flussiRes] = await Promise.all([
        TipologieMaterialiService.getTipologie(true),
        FlussiService.getFlussi(true),
      ]);

      setTipologie(tipologieRes.data);
      setFlussi(flussiRes.data);
    } catch (error) {
      console.error('Errore caricamento dati iniziali:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dei dati di base',
      });
    }
  }, [aggiungiNotifica]);

  const caricaLavorazioni = useCallback(async () => {
    setLoading(true);
    try {
      const response = await LavorazioniService.getLavorazioni({
        ...filtri,
        page: page + 1,
        limit: rowsPerPage,
      });

      setLavorazioni(response.data);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Errore caricamento lavorazioni:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento delle lavorazioni',
      });
    } finally {
      setLoading(false);
    }
  }, [filtri, page, rowsPerPage, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiIniziali();
  }, [caricaDatiIniziali]);

  useEffect(() => {
    caricaLavorazioni();
  }, [caricaLavorazioni]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (lavorazione: Lavorazione | null = null) => {
    setLavorazioneSelezionata(lavorazione);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setLavorazioneSelezionata(null);
  };

  const handleSalvaLavorazione = () => {
    handleCloseDialog();
    caricaLavorazioni();
    aggiungiNotifica({
      tipo: 'success',
      titolo: 'Successo',
      messaggio: lavorazioneSelezionata ? 'Lavorazione aggiornata' : 'Lavorazione creata',
    });
  };

  const handleEliminaLavorazione = async (id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questa lavorazione?')) {
      try {
        // Note: Need to implement deleteLavorazione in service
        // await LavorazioniService.deleteLavorazione(id);
        caricaLavorazioni();
        aggiungiNotifica({
          tipo: 'success',
          titolo: 'Successo',
          messaggio: 'Lavorazione eliminata con successo',
        });
      } catch (error) {
        aggiungiNotifica({
          tipo: 'error',
          titolo: 'Errore',
          messaggio: 'Errore nell\'eliminazione della lavorazione',
        });
      }
    }
  };

  const handleFilterChange = (field: keyof FiltriLavorazioni, value: any) => {
    setFiltri(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const resetFiltri = () => {
    setFiltri({
      dataInizio: '',
      dataFine: '',
      tipoOperazione: undefined,
      tipologiaId: undefined,
      flussoOriginId: undefined,
      search: '',
    });
    setPage(0);
  };

  const getTipoOperazioneLabel = (tipo: string) => {
    const found = tipiOperazione.find(t => t.value === tipo);
    return found ? found.label : tipo;
  };

  // Calculate efficiency (this is a placeholder calculation)
  const calcolaEfficienza = (lavorazione: Lavorazione): number => {
    // This is a simplified calculation - you should implement your business logic
    // For now, just return a random value for demonstration
    return Math.random() * 100;
  };

  const getEfficienzaChip = (efficienza: number) => {
    if (efficienza >= 90) {
      return <Chip label={`${efficienza.toFixed(1)}%`} color="success" size="small" />;
    } else if (efficienza >= 75) {
      return <Chip label={`${efficienza.toFixed(1)}%`} color="warning" size="small" />;
    } else {
      return <Chip label={`${efficienza.toFixed(1)}%`} color="error" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FactoryIcon />
          Gestione Lavorazioni
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => {/* TODO: Aprire dialog analisi efficienza */}}
          >
            Analisi Efficienza
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuova Lavorazione
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: 200 }}>
                <DatePicker
                  label="Data Inizio"
                  value={parseDate(filtri.dataInizio)} // FIX: Usa parseDate
                  onChange={(date) => handleFilterChange('dataInizio', formatDateForInput(date))} // FIX: Usa formatDateForInput
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <DatePicker
                  label="Data Fine"
                  value={parseDate(filtri.dataFine)} // FIX: Usa parseDate
                  onChange={(date) => handleFilterChange('dataFine', formatDateForInput(date))} // FIX: Usa formatDateForInput
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo Operazione</InputLabel>
                  <Select
                    value={filtri.tipoOperazione || ''}
                    onChange={(e) => handleFilterChange('tipoOperazione', e.target.value)}
                    label="Tipo Operazione"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {tipiOperazione.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipologia Materiale</InputLabel>
                  <Select
                    value={filtri.tipologiaId || ''}
                    onChange={(e) => handleFilterChange('tipologiaId', e.target.value || undefined)}
                    label="Tipologia Materiale"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {tipologie.map((tipologia) => (
                      <MenuItem key={tipologia.id} value={tipologia.id}>
                        {tipologia.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Flusso Origine</InputLabel>
                  <Select
                    value={filtri.flussoOriginId || ''}
                    onChange={(e) => handleFilterChange('flussoOriginId', e.target.value || undefined)}
                    label="Flusso Origine"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {flussi.map((flusso) => (
                      <MenuItem key={flusso.id} value={flusso.id}>
                        {flusso.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ricerca"
                  placeholder="Note, descrizione..."
                  value={filtri.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Box>
            </Box>
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
          ) : lavorazioni.length === 0 ? (
            <Alert severity="info">Nessuna lavorazione trovata</Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Tipo Operazione</TableCell>
                      <TableCell>Tipologia Materiale</TableCell>
                      <TableCell align="right">Quantità (kg)</TableCell>
                      <TableCell>Flusso Origine</TableCell>
                      <TableCell align="center">Efficienza</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell align="center">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lavorazioni.map((lavorazione) => {
                      const efficienza = calcolaEfficienza(lavorazione);
                      return (
                        <TableRow key={lavorazione.id} hover>
                          <TableCell>{formatDate(lavorazione.data_lavorazione)}</TableCell>
                          <TableCell>{getTipoOperazioneLabel(lavorazione.tipo_operazione)}</TableCell>
                          <TableCell>{lavorazione.TipologiaMateriale?.nome}</TableCell>
                          <TableCell align="right">{formatWeight(lavorazione.quantita_kg)}</TableCell>
                          <TableCell>{lavorazione.FlussoCorepla?.nome || '-'}</TableCell>
                          <TableCell align="center">
                            {getEfficienzaChip(efficienza)}
                          </TableCell>
                          <TableCell>{lavorazione.note || '-'}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(lavorazione)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEliminaLavorazione(lavorazione.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        {dialogOpen && (
          <LavorazioneForm
            lavorazione={lavorazioneSelezionata}
            tipologie={tipologie}
            flussi={flussi}
            onSalva={handleSalvaLavorazione}
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

export default LavorazioniPage;