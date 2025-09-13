// frontend/src/pages/Analisi/AnalisiPage.tsx
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
  CheckCircle as ValidateIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { AnalisiQualitativa, Comune, FlussoCorepla, FiltriAnalisi } from '../../types';
import { AnalisiService } from '../../services/AnalisiService';
import { ComuniService } from '../../services/ComuniService';
import { FlussiService } from '../../services/FlussiService';
import { formatDate, formatPercentage } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';
import AnalisiForm from './AnalisiForm';

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

const AnalisiPage: React.FC = () => {
  // State per dati
  const [analisi, setAnalisi] = useState<AnalisiQualitativa[]>([]);
  const [comuni, setComuni] = useState<Comune[]>([]);
  const [flussi, setFlussi] = useState<FlussoCorepla[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analisiSelezionata, setAnalisiSelezionata] = useState<AnalisiQualitativa | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State per filtri
  const [filtri, setFiltri] = useState<FiltriAnalisi>({
    dataInizio: '',
    dataFine: '',
    comuneId: undefined,
    flussoId: undefined,
    validata: undefined,
    search: '',
  });

  const { aggiungiNotifica } = useNotifiche();

  const caricaDatiIniziali = useCallback(async () => {
    try {
      const [comuniRes, flussiRes] = await Promise.all([
        ComuniService.getComuni(),
        FlussiService.getFlussi(true),
      ]);

      setComuni(comuniRes.data);
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

  const caricaAnalisi = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AnalisiService.getAnalisi({
        ...filtri,
        page: page + 1,
        limit: rowsPerPage,
      });

      setAnalisi(response.data);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Errore caricamento analisi:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento delle analisi',
      });
    } finally {
      setLoading(false);
    }
  }, [filtri, page, rowsPerPage, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiIniziali();
  }, [caricaDatiIniziali]);

  useEffect(() => {
    caricaAnalisi();
  }, [caricaAnalisi]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (analisi: AnalisiQualitativa | null = null) => {
    setAnalisiSelezionata(analisi);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAnalisiSelezionata(null);
  };

  const handleSalvaAnalisi = () => {
    handleCloseDialog();
    caricaAnalisi();
    aggiungiNotifica({
      tipo: 'success',
      titolo: 'Successo',
      messaggio: analisiSelezionata ? 'Analisi aggiornata' : 'Analisi creata',
    });
  };

  const handleValidaAnalisi = async (id: number) => {
    try {
      await AnalisiService.validaAnalisi(id);
      caricaAnalisi();
      aggiungiNotifica({
        tipo: 'success',
        titolo: 'Successo',
        messaggio: 'Analisi validata con successo',
      });
    } catch (error) {
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nella validazione dell\'analisi',
      });
    }
  };

  const handleFilterChange = (field: keyof FiltriAnalisi, value: any) => {
    setFiltri(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const resetFiltri = () => {
    setFiltri({
      dataInizio: '',
      dataFine: '',
      comuneId: undefined,
      flussoId: undefined,
      validata: undefined,
      search: '',
    });
    setPage(0);
  };

  const getStatoChip = (analisi: AnalisiQualitativa) => {
    if (analisi.validata) {
      return <Chip label="Validata" color="success" size="small" />;
    } else {
      return <Chip label="In attesa" color="warning" size="small" />;
    }
  };

  const getConformitaChip = (analisi: AnalisiQualitativa) => {
    const totale = (analisi.perc_cpl_pet || 0) + (analisi.perc_altri_cpl || 0);
    const conforme = totale >= 90; // Soglia di conformità
    
    return (
      <Chip 
        label={conforme ? 'Conforme' : 'Non conforme'} 
        color={conforme ? 'success' : 'error'} 
        size="small" 
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon />
          Analisi Qualitative
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuova Analisi
        </Button>
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
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <DatePicker
                  label="Data Inizio"
                  value={parseDate(filtri.dataInizio)} // FIX: Usa parseDate
                  onChange={(date) => handleFilterChange('dataInizio', formatDateForInput(date))} // FIX: Usa formatDateForInput
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <DatePicker
                  label="Data Fine"
                  value={parseDate(filtri.dataFine)} // FIX: Usa parseDate
                  onChange={(date) => handleFilterChange('dataFine', formatDateForInput(date))} // FIX: Usa formatDateForInput
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Comune</InputLabel>
                  <Select
                    value={filtri.comuneId || ''}
                    onChange={(e) => handleFilterChange('comuneId', e.target.value || undefined)}
                    label="Comune"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {comuni.map((comune) => (
                      <MenuItem key={comune.id} value={comune.id}>
                        {comune.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Flusso</InputLabel>
                  <Select
                    value={filtri.flussoId || ''}
                    onChange={(e) => handleFilterChange('flussoId', e.target.value || undefined)}
                    label="Flusso"
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
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stato</InputLabel>
                  <Select
                    value={filtri.validata !== undefined ? filtri.validata.toString() : ''}
                    onChange={(e) => handleFilterChange('validata', e.target.value === '' ? undefined : e.target.value === 'true')}
                    label="Stato"
                  >
                    <MenuItem value="">Tutte</MenuItem>
                    <MenuItem value="false">In attesa</MenuItem>
                    <MenuItem value="true">Validate</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ricerca"
                  placeholder="Note..."
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
          ) : analisi.length === 0 ? (
            <Alert severity="info">Nessuna analisi trovata</Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data Analisi</TableCell>
                      <TableCell>Comune</TableCell>
                      <TableCell>Flusso</TableCell>
                      <TableCell align="right">CPL PET (%)</TableCell>
                      <TableCell align="right">Altri CPL (%)</TableCell>
                      <TableCell align="right">Traccianti (%)</TableCell>
                      <TableCell align="right">Frazione Estranea (%)</TableCell>
                      <TableCell align="center">Conformità</TableCell>
                      <TableCell align="center">Stato</TableCell>
                      <TableCell align="center">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analisi.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{formatDate(item.data_analisi)}</TableCell>
                        <TableCell>{item.Comune?.nome}</TableCell>
                        <TableCell>{item.FlussoCorepla?.nome}</TableCell>
                        <TableCell align="right">{formatPercentage(item.perc_cpl_pet)}</TableCell>
                        <TableCell align="right">{formatPercentage(item.perc_altri_cpl)}</TableCell>
                        <TableCell align="right">{formatPercentage(item.perc_traccianti)}</TableCell>
                        <TableCell align="right">{formatPercentage(item.perc_frazione_estranea)}</TableCell>
                        <TableCell align="center">{getConformitaChip(item)}</TableCell>
                        <TableCell align="center">{getStatoChip(item)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          {!item.validata && (
                            <IconButton
                              size="small"
                              onClick={() => handleValidaAnalisi(item.id)}
                              color="success"
                            >
                              <ValidateIcon />
                            </IconButton>
                          )}
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
          <AnalisiForm
            analisi={analisiSelezionata}
            comuni={comuni}
            flussi={flussi}
            onSalva={handleSalvaAnalisi}
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

export default AnalisiPage;