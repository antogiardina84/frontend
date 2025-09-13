// frontend/src/pages/Fatturazione/FatturazionePage.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

import { Fatturazione, FiltriFatturazione, CONSORZI } from '../../types';
import { FatturazioneService } from '../../services/FatturazioneService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';

const FatturazionePage: React.FC = () => {
  // State per dati
  const [fatture, setFatture] = useState<Fatturazione[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [dialogGeneraOpen, setDialogGeneraOpen] = useState(false);
  const [dialogStatoOpen, setDialogStatoOpen] = useState(false);
  const [fatturaSelezionata, setFatturaSelezionata] = useState<Fatturazione | null>(null);

  // State per filtri
  const [filtri, setFiltri] = useState<FiltriFatturazione>({
    mese: undefined,
    anno: new Date().getFullYear(),
    consorzio: undefined,
    stato: undefined,
  });

  // State per form genera fattura
  const [formGenera, setFormGenera] = useState({
    mese: new Date().getMonth() + 1,
    anno: new Date().getFullYear(),
    consorzio: 'COREPLA' as typeof CONSORZI[number],
  });

  // State per cambio stato
  const [nuovoStato, setNuovoStato] = useState<'bozza' | 'inviata' | 'pagata'>('bozza');

  const { aggiungiNotifica } = useNotifiche();

  const caricaFatture = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await FatturazioneService.getFatture({
        ...filtri,
        page: page + 1,
        limit: rowsPerPage,
      });

      setFatture(response.data);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error('Errore caricamento fatture:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento delle fatture',
      });
    } finally {
      setLoading(false);
    }
  }, [filtri, page, rowsPerPage, aggiungiNotifica]);

  useEffect(() => {
    caricaFatture();
  }, [caricaFatture]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGeneraFattura = async () => {
    try {
      await FatturazioneService.generaFattura(
        formGenera.mese,
        formGenera.anno,
        formGenera.consorzio
      );
      setDialogGeneraOpen(false);
      caricaFatture();
      aggiungiNotifica({
        tipo: 'success',
        titolo: 'Successo',
        messaggio: 'Fattura generata con successo',
      });
    } catch (error: any) {
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: error.response?.data?.message || 'Errore nella generazione della fattura',
      });
    }
  };

  const handleCambiaStato = async () => {
    if (!fatturaSelezionata) return;

    try {
      const dataInvio = nuovoStato === 'inviata' ? new Date().toISOString().split('T')[0] : undefined;
      const dataPagamento = nuovoStato === 'pagata' ? new Date().toISOString().split('T')[0] : undefined;

      await FatturazioneService.aggiornaStato(
        fatturaSelezionata.id,
        nuovoStato,
        dataInvio,
        dataPagamento
      );
      
      setDialogStatoOpen(false);
      setFatturaSelezionata(null);
      caricaFatture();
      aggiungiNotifica({
        tipo: 'success',
        titolo: 'Successo',
        messaggio: 'Stato fattura aggiornato',
      });
    } catch (error: any) {
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: error.response?.data?.message || 'Errore nell\'aggiornamento dello stato',
      });
    }
  };

  const handleFilterChange = (field: keyof FiltriFatturazione, value: any) => {
    setFiltri(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const resetFiltri = () => {
    setFiltri({
      mese: undefined,
      anno: new Date().getFullYear(),
      consorzio: undefined,
      stato: undefined,
    });
    setPage(0);
  };

  const getStatoChip = (stato: string) => {
    const colori = {
      bozza: 'default',
      inviata: 'primary',
      pagata: 'success',
    } as const;

    return (
      <Chip 
        label={stato.charAt(0).toUpperCase() + stato.slice(1)} 
        color={colori[stato as keyof typeof colori] || 'default'} 
        size="small" 
      />
    );
  };

  const handleOpenCambiaStato = (fattura: Fatturazione) => {
    setFatturaSelezionata(fattura);
    setNuovoStato(fattura.stato as any);
    setDialogStatoOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          Fatturazione COREPLA
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogGeneraOpen(true)}
        >
          Genera Fattura
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
              <Box sx={{ minWidth: 120, flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mese</InputLabel>
                  <Select
                    value={filtri.mese || ''}
                    onChange={(e) => handleFilterChange('mese', e.target.value || undefined)}
                    label="Mese"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('it-IT', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 120, flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Anno</InputLabel>
                  <Select
                    value={filtri.anno || ''}
                    onChange={(e) => handleFilterChange('anno', e.target.value || undefined)}
                    label="Anno"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const anno = new Date().getFullYear() - 2 + i;
                      return (
                        <MenuItem key={anno} value={anno}>
                          {anno}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 120, flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Consorzio</InputLabel>
                  <Select
                    value={filtri.consorzio || ''}
                    onChange={(e) => handleFilterChange('consorzio', e.target.value || undefined)}
                    label="Consorzio"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    {CONSORZI.map((consorzio) => (
                      <MenuItem key={consorzio} value={consorzio}>
                        {consorzio}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 120, flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stato</InputLabel>
                  <Select
                    value={filtri.stato || ''}
                    onChange={(e) => handleFilterChange('stato', e.target.value || undefined)}
                    label="Stato"
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    <MenuItem value="bozza">Bozza</MenuItem>
                    <MenuItem value="inviata">Inviata</MenuItem>
                    <MenuItem value="pagata">Pagata</MenuItem>
                  </Select>
                </FormControl>
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
          ) : fatture.length === 0 ? (
            <Alert severity="info">Nessuna fattura trovata</Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Numero Fattura</TableCell>
                      <TableCell>Data Fattura</TableCell>
                      <TableCell>Periodo</TableCell>
                      <TableCell>Consorzio</TableCell>
                      <TableCell align="right">Quantità (kg)</TableCell>
                      <TableCell align="right">Corrispettivo</TableCell>
                      <TableCell align="right">Importo Netto</TableCell>
                      <TableCell align="center">Stato</TableCell>
                      <TableCell align="center">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fatture.map((fattura) => (
                      <TableRow key={fattura.id} hover>
                        <TableCell>{fattura.numero_fattura}</TableCell>
                        <TableCell>{formatDate(fattura.data_fattura)}</TableCell>
                        <TableCell>
                          {fattura.mese_riferimento?.toString().padStart(2, '0')}/{fattura.anno_riferimento}
                        </TableCell>
                        <TableCell>{fattura.consorzio}</TableCell>
                        <TableCell align="right">{formatCurrency(fattura.quantita_kg)} kg</TableCell>
                        <TableCell align="right">{formatCurrency(fattura.corrispettivo_unitario)} €/kg</TableCell>
                        <TableCell align="right">{formatCurrency(fattura.importo_netto)}</TableCell>
                        <TableCell align="center">{getStatoChip(fattura.stato)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenCambiaStato(fattura)}
                            color="primary"
                          >
                            <EditIcon />
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

      {/* Dialog Genera Fattura */}
      <Dialog open={dialogGeneraOpen} onClose={() => setDialogGeneraOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Genera Nuova Fattura</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Mese</InputLabel>
                <Select
                  value={formGenera.mese}
                  onChange={(e) => setFormGenera(prev => ({ ...prev, mese: Number(e.target.value) }))}
                  label="Mese"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('it-IT', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Anno</InputLabel>
                <Select
                  value={formGenera.anno}
                  onChange={(e) => setFormGenera(prev => ({ ...prev, anno: Number(e.target.value) }))}
                  label="Anno"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const anno = new Date().getFullYear() - 2 + i;
                    return (
                      <MenuItem key={anno} value={anno}>
                        {anno}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Consorzio</InputLabel>
              <Select
                value={formGenera.consorzio}
                onChange={(e) => setFormGenera(prev => ({ ...prev, consorzio: e.target.value as any }))}
                label="Consorzio"
              >
                {CONSORZI.map((consorzio) => (
                  <MenuItem key={consorzio} value={consorzio}>
                    {consorzio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogGeneraOpen(false)}>Annulla</Button>
          <Button onClick={handleGeneraFattura} variant="contained">
            Genera Fattura
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Cambia Stato */}
      <Dialog open={dialogStatoOpen} onClose={() => setDialogStatoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambia Stato Fattura</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Fattura: {fatturaSelezionata?.numero_fattura}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Nuovo Stato</InputLabel>
              <Select
                value={nuovoStato}
                onChange={(e) => setNuovoStato(e.target.value as any)}
                label="Nuovo Stato"
              >
                <MenuItem value="bozza">Bozza</MenuItem>
                <MenuItem value="inviata">Inviata</MenuItem>
                <MenuItem value="pagata">Pagata</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogStatoOpen(false)}>Annulla</Button>
          <Button onClick={handleCambiaStato} variant="contained">
            Aggiorna Stato
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FatturazionePage;