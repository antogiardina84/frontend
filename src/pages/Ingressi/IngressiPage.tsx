// frontend/src/pages/Ingressi/IngressiPage.tsx
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
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Ingresso, Comune, TipologiaMateriale, FlussoCorepla, FiltriIngressi } from '../../types';
import { IngressiService } from '../../services/IngressiService';
import { ComuniService } from '../../services/ComuniService';
import { TipologieMaterialiService } from '../../services/TipologieMaterialiService';
import { FlussiService } from '../../services/FlussiService';
import { formatDate, formatWeight } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';
import IngressoForm from './IngressoForm';

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

const IngressiPage: React.FC = () => {
  // State per dati
  const [ingressi, setIngressi] = useState<Ingresso[]>([]);
  const [comuni, setComuni] = useState<Comune[]>([]);
  const [tipologie, setTipologie] = useState<TipologiaMateriale[]>([]);
  const [flussi, setFlussi] = useState<FlussoCorepla[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ingressoSelezionato, setIngressoSelezionato] = useState<Ingresso | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State per filtri
  const [filtri, setFiltri] = useState<FiltriIngressi>({
    dataInizio: '',
    dataFine: '',
    comuneId: undefined,
    tipologiaId: undefined,
    flussoId: undefined,
    search: '',
  });

  const { aggiungiNotifica } = useNotifiche();

  const caricaDatiIniziali = useCallback(async () => {
    try {
      const [comuniRes, tipologieRes, flussiRes] = await Promise.all([
        ComuniService.getComuni(),
        TipologieMaterialiService.getTipologie(true),
        FlussiService.getFlussi(true),
      ]);

      setComuni(comuniRes.data);
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

  const caricaIngressi = useCallback(async () => {
    setLoading(true);
    try {
      const response = await IngressiService.getIngressi({
        ...filtri,
        page: page + 1,
        limit: rowsPerPage,
      });

      setIngressi(response.data);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Errore caricamento ingressi:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento degli ingressi',
      });
    } finally {
      setLoading(false);
    }
  }, [filtri, page, rowsPerPage, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiIniziali();
  }, [caricaDatiIniziali]);

  useEffect(() => {
    caricaIngressi();
  }, [caricaIngressi]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltroChange = (campo: keyof FiltriIngressi, valore: any) => {
    setFiltri(prev => ({ ...prev, [campo]: valore }));
    setPage(0);
  };

  const resetFiltri = () => {
    setFiltri({
      dataInizio: '',
      dataFine: '',
      comuneId: undefined,
      tipologiaId: undefined,
      flussoId: undefined,
      search: '',
    });
    setPage(0);
  };

  const handleNuovoIngresso = () => {
    setIngressoSelezionato(null);
    setDialogOpen(true);
  };

  const handleModificaIngresso = (ingresso: Ingresso) => {
    setIngressoSelezionato(ingresso);
    setDialogOpen(true);
  };

  const handleEliminaIngresso = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo ingresso?')) {
      return;
    }

    try {
      await IngressiService.deleteIngresso(id);
      aggiungiNotifica({
        tipo: 'success',
        titolo: 'Successo',
        messaggio: 'Ingresso eliminato con successo',
      });
      caricaIngressi();
    } catch (error) {
      console.error('Errore eliminazione ingresso:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nell\'eliminazione dell\'ingresso',
      });
    }
  };

  const handleSalvaIngresso = async () => {
    setDialogOpen(false);
    aggiungiNotifica({
      tipo: 'success',
      titolo: 'Successo',
      messaggio: ingressoSelezionato ? 'Ingresso aggiornato con successo' : 'Ingresso creato con successo',
    });
    caricaIngressi();
  };

  const getFlussoColor = (codice: string) => {
    switch (codice) {
      case 'A': return 'primary';
      case 'B': return 'secondary';
      case 'C': return 'success';
      case 'D': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Gestione Ingressi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNuovoIngresso}
        >
          Nuovo Ingresso
        </Button>
      </Box>

      {/* Filtri */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filtri di Ricerca</Typography>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Nascondi' : 'Mostra'} Filtri
            </Button>
          </Box>

          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                {/* Prima riga */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    '& > *': { minWidth: 200, flex: 1 }
                  }}
                >
                  <TextField
                    label="Cerca"
                    value={filtri.search}
                    onChange={(e) => handleFiltroChange('search', e.target.value)}
                    placeholder="Formulario, note..."
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />

                  <DatePicker
                    label="Data Inizio"
                    value={parseDate(filtri.dataInizio)} // FIX: Usa parseDate
                    onChange={(date) => handleFiltroChange('dataInizio', formatDateForInput(date))} // FIX: Usa formatDateForInput
                    slotProps={{
                      textField: { size: 'medium' }
                    }}
                  />

                  <DatePicker
                    label="Data Fine"
                    value={parseDate(filtri.dataFine)} // FIX: Usa parseDate
                    onChange={(date) => handleFiltroChange('dataFine', formatDateForInput(date))} // FIX: Usa formatDateForInput
                    slotProps={{
                      textField: { size: 'medium' }
                    }}
                  />
                </Box>

                {/* Seconda riga */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    '& > *': { minWidth: 200, flex: 1 }
                  }}
                >
                  <FormControl>
                    <InputLabel>Comune</InputLabel>
                    <Select
                      value={filtri.comuneId || ''}
                      onChange={(e) => handleFiltroChange('comuneId', e.target.value || undefined)}
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

                  <FormControl>
                    <InputLabel>Materiale</InputLabel>
                    <Select
                      value={filtri.tipologiaId || ''}
                      onChange={(e) => handleFiltroChange('tipologiaId', e.target.value || undefined)}
                      label="Materiale"
                    >
                      <MenuItem value="">Tutti</MenuItem>
                      {tipologie.map((tipologia) => (
                        <MenuItem key={tipologia.id} value={tipologia.id}>
                          {tipologia.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    onClick={resetFiltri}
                    sx={{ minWidth: 120, maxWidth: 150 }}
                  >
                    Reset
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabella */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : ingressi.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                Nessun ingresso trovato con i filtri selezionati
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data Conferimento</TableCell>
                      <TableCell>Comune</TableCell>
                      <TableCell>Materiale</TableCell>
                      <TableCell align="right">Quantità</TableCell>
                      <TableCell>Flusso</TableCell>
                      <TableCell>Formulario</TableCell>
                      <TableCell align="center">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ingressi.map((ingresso) => (
                      <TableRow key={ingresso.id} hover>
                        <TableCell>{formatDate(ingresso.data_conferimento)}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {ingresso.Comune?.nome || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ingresso.Comune?.codice_istat}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {ingresso.TipologiaMateriale?.nome || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ingresso.TipologiaMateriale?.codice}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {formatWeight(ingresso.quantita_kg)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {ingresso.FlussoCorepla && (
                            <Chip
                              label={`Flusso ${ingresso.FlussoCorepla.codice}`}
                              size="small"
                              color={getFlussoColor(ingresso.FlussoCorepla.codice) as any}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {ingresso.numero_formulario || '-'}
                          </Typography>
                          {ingresso.data_formulario && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(ingresso.data_formulario)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleModificaIngresso(ingresso)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEliminaIngresso(ingresso.id)}
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
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <IngressoForm
          ingresso={ingressoSelezionato}
          comuni={comuni}
          tipologie={tipologie}
          flussi={flussi}
          onSalva={handleSalvaIngresso}
          onAnnulla={() => setDialogOpen(false)}
        />
      </Dialog>

      {/* FAB per dispositivi mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleNuovoIngresso}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default IngressiPage;