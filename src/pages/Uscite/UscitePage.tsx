// frontend/src/pages/Uscite/UscitePage.tsx
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
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Uscita, TipologiaMateriale, FlussoCorepla, FiltriUscite } from '../../types';
import { UsciteService } from '../../services/UsciteService';
import { TipologieMaterialiService } from '../../services/TipologieMaterialiService';
import { FlussiService } from '../../services/FlussiService';
import { formatDate, formatWeight, formatCurrency } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';
import UscitaForm from './UscitaForm';

// Funzioni helper per gestire le date nei DatePicker
const parseDate = (dateValue: string | null | undefined): Date | null => {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  try {
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const UscitePage: React.FC = () => {
  // State per dati
  const [uscite, setUscite] = useState<Uscita[]>([]);
  const [tipologie, setTipologie] = useState<TipologiaMateriale[]>([]);
  const [flussi, setFlussi] = useState<FlussoCorepla[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uscitaSelezionata, setUscitaSelezionata] = useState<Uscita | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State per filtri
  const [filtri, setFiltri] = useState<FiltriUscite>({
    dataInizio: '',
    dataFine: '',
    tipologiaId: undefined,
    destinatario: '',
    search: '',
  });

  const { aggiungiNotifica } = useNotifiche();

  const caricaDatiIniziali = React.useCallback(async () => {
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

  const caricaUscite = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await UsciteService.getUscite({
        ...filtri,
        page: page + 1,
        limit: rowsPerPage,
      });

      setUscite(response.data);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Errore caricamento uscite:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento delle uscite',
      });
    } finally {
      setLoading(false);
    }
  }, [filtri, page, rowsPerPage, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiIniziali();
  }, [caricaDatiIniziali]);

  useEffect(() => {
    caricaUscite();
  }, [caricaUscite]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (uscita: Uscita | null = null) => {
    setUscitaSelezionata(uscita);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUscitaSelezionata(null);
  };

  const handleSalvaUscita = () => {
    handleCloseDialog();
    caricaUscite();
    aggiungiNotifica({
      tipo: 'success',
      titolo: 'Successo',
      messaggio: uscitaSelezionata ? 'Uscita aggiornata' : 'Uscita creata',
    });
  };

  const handleEliminaUscita = async (id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questa uscita?')) {
      try {
        await UsciteService.deleteUscita(id);
        caricaUscite();
        aggiungiNotifica({
          tipo: 'success',
          titolo: 'Successo',
          messaggio: 'Uscita eliminata con successo',
        });
      } catch (error) {
        aggiungiNotifica({
          tipo: 'error',
          titolo: 'Errore',
          messaggio: 'Errore nell\'eliminazione dell\'uscita',
        });
      }
    }
  };

  const handleFilterChange = (field: keyof FiltriUscite, value: any) => {
    setFiltri(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const resetFiltri = () => {
    setFiltri({
      dataInizio: '',
      dataFine: '',
      tipologiaId: undefined,
      destinatario: '',
      search: '',
    });
    setPage(0);
  };

  const getStatoChip = (uscita: Uscita) => {
    const dataUscita = new Date(uscita.data_uscita);
    const oggi = new Date();
    const diffGiorni = Math.ceil((dataUscita.getTime() - oggi.getTime()) / (1000 * 3600 * 24));

    if (diffGiorni < 0) {
      return <Chip label="Completata" color="success" size="small" />;
    } else if (diffGiorni === 0) {
      return <Chip label="Oggi" color="warning" size="small" />;
    } else {
      return <Chip label="Programmata" color="primary" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShippingIcon />
          Gestione Uscite
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuova Uscita
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Prima riga filtri */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' }, minWidth: 200 }}>
                  <DatePicker
                    label="Data Inizio"
                    value={parseDate(filtri.dataInizio)}
                    onChange={(date) => handleFilterChange('dataInizio', formatDateForInput(date))}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' }, minWidth: 200 }}>
                  <DatePicker
                    label="Data Fine"
                    value={parseDate(filtri.dataFine)}
                    onChange={(date) => handleFilterChange('dataFine', formatDateForInput(date))}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' }, minWidth: 200 }}>
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
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 25%' }, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Destinatario"
                    value={filtri.destinatario}
                    onChange={(e) => handleFilterChange('destinatario', e.target.value)}
                  />
                </Box>
              </Box>
              
              {/* Seconda riga filtri */}
              <Box>
                <TextField
                  fullWidth
                  size="small"
                  label="Ricerca generale"
                  placeholder="Cerca per numero documento, destinatario, note..."
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
          ) : uscite.length === 0 ? (
            <Alert severity="info">Nessuna uscita trovata</Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data Uscita</TableCell>
                      <TableCell>Numero Documento</TableCell>
                      <TableCell>Destinatario</TableCell>
                      <TableCell>Tipologia</TableCell>
                      <TableCell align="right">Quantità (kg)</TableCell>
                      <TableCell align="right">Prezzo Unitario</TableCell>
                      <TableCell align="right">Valore Totale</TableCell>
                      <TableCell>Stato</TableCell>
                      <TableCell align="center">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uscite.map((uscita) => (
                      <TableRow key={uscita.id} hover>
                        <TableCell>{formatDate(uscita.data_uscita)}</TableCell>
                        <TableCell>{uscita.numero_documento}</TableCell>
                        <TableCell>{uscita.destinatario}</TableCell>
                        <TableCell>{uscita.TipologiaMateriale?.nome}</TableCell>
                        <TableCell align="right">{formatWeight(uscita.quantita_kg)}</TableCell>
                        <TableCell align="right">
                          {uscita.prezzo_unitario ? formatCurrency(uscita.prezzo_unitario) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {uscita.valore_totale ? formatCurrency(uscita.valore_totale) : '-'}
                        </TableCell>
                        <TableCell>{getStatoChip(uscita)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(uscita)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEliminaUscita(uscita.id)}
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
          <UscitaForm
            uscita={uscitaSelezionata}
            tipologie={tipologie}
            flussi={flussi}
            onSalva={handleSalvaUscita}
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

export default UscitePage;