// frontend/src/pages/Giacenze/GiacenzePage.tsx
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
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { GiacenzaCalcolata, TipologiaMateriale } from '../../types';
import { GiacenzeService } from '../../services/GiacenzeService';
import { TipologieMaterialiService } from '../../services/TipologieMaterialiService';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Funzioni helper per gestire le date
const parseDate = (dateString: string | null | undefined): Dayjs | null => {
  if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
    return null;
  }
  
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) {
      return null;
    }
    return date;
  } catch (error) {
    console.warn('Errore parsing data:', dateString, error);
    return null;
  }
};

const formatDateForInput = (date: Dayjs | null | undefined): string => {
  if (!date || !dayjs.isDayjs(date) || !date.isValid()) {
    return '';
  }
  
  try {
    return date.format('YYYY-MM-DD');
  } catch (error) {
    console.warn('Errore formattazione data:', date, error);
    return '';
  }
};

const GiacenzePage: React.FC = () => {
  // State per dati
  const [giacenze, setGiacenze] = useState<GiacenzaCalcolata[]>([]);
  const [tipologie, setTipologie] = useState<TipologiaMateriale[]>([]);
  const [storicoGiacenze, setStoricoGiacenze] = useState<any[]>([]);
  
  // State per UI
  const [loading, setLoading] = useState(true);
  const [loadingStorico, setLoadingStorico] = useState(false);
  const [dataRiferimento, setDataRiferimento] = useState(new Date().toISOString().split('T')[0]);
  const [showStorico, setShowStorico] = useState(false);

  const { aggiungiNotifica } = useNotifiche();

  const caricaDatiIniziali = useCallback(async () => {
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

  const caricaGiacenze = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GiacenzeService.getGiacenze(dataRiferimento);
      setGiacenze(response.giacenze);
    } catch (error) {
      console.error('Errore caricamento giacenze:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento delle giacenze',
      });
    } finally {
      setLoading(false);
    }
  }, [dataRiferimento, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiIniziali();
  }, [caricaDatiIniziali]);

  useEffect(() => {
    if (dataRiferimento) {
      caricaGiacenze();
    }
  }, [dataRiferimento, caricaGiacenze]);

  const aggiornaGiacenze = async () => {
    setLoading(true);
    try {
      const response = await GiacenzeService.aggiornaGiacenze(dataRiferimento);
      setGiacenze(response.giacenze);
      aggiungiNotifica({
        tipo: 'success',
        titolo: 'Successo',
        messaggio: 'Giacenze aggiornate con successo',
      });
    } catch (error) {
      console.error('Errore aggiornamento giacenze:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nell\'aggiornamento delle giacenze',
      });
    } finally {
      setLoading(false);
    }
  };

  const caricaStoricoGiacenze = async () => {
    setLoadingStorico(true);
    try {
      const dataInizio = new Date();
      dataInizio.setMonth(dataInizio.getMonth() - 6);
      
      const response = await GiacenzeService.getStoricoGiacenze(
        undefined,
        dataInizio.toISOString().split('T')[0],
        dataRiferimento
      );
      
      // Trasforma i dati per il grafico
      const datiGrafico = response.data.reduce((acc: any[], item: any) => {
        const data = formatDate(item.data_riferimento);
        const existing = acc.find(x => x.data === data);
        if (existing) {
          existing[item.tipologia_nome] = item.quantita_kg;
        } else {
          acc.push({
            data,
            [item.tipologia_nome]: item.quantita_kg
          });
        }
        return acc;
      }, []);
      
      setStoricoGiacenze(datiGrafico);
      setShowStorico(true);
    } catch (error) {
      console.error('Errore caricamento storico:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dello storico',
      });
    } finally {
      setLoadingStorico(false);
    }
  };

  const getTotaleValore = () => {
    return giacenze.reduce((sum, g) => sum + (g.valore_totale || 0), 0);
  };

  const getTotaleQuantita = () => {
    return giacenze.reduce((sum, g) => sum + (g.quantita_kg || 0), 0);
  };

  const getGiacenzeBasse = () => {
    return giacenze.filter(g => g.quantita_kg < 1000); // Soglia di esempio
  };

  const getPieChartData = () => {
    return giacenze.map(g => ({
      name: g.tipologia_nome,
      value: g.quantita_kg,
      valore: g.valore_totale
    }));
  };

  const getStatoGiacenza = (quantita: number) => {
    if (quantita < 500) {
      return <Chip label="Bassa" color="error" size="small" />;
    } else if (quantita < 1000) {
      return <Chip label="Media" color="warning" size="small" />;
    } else {
      return <Chip label="Normale" color="success" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon />
          Gestione Giacenze
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <DatePicker
            label="Data Riferimento"
            value={parseDate(dataRiferimento)} // FIX: Usa parseDate
            onChange={(date) => setDataRiferimento(formatDateForInput(date))} // FIX: Usa formatDateForInput
            slotProps={{ textField: { size: 'small' } }}
          />
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={caricaStoricoGiacenze}
            disabled={loadingStorico}
          >
            Storico
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={aggiornaGiacenze}
            disabled={loading}
          >
            Aggiorna
          </Button>
        </Box>
      </Box>

      {/* Cards riepilogative */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Valore Totale
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(getTotaleValore())}
            </Typography>
            <MoneyIcon sx={{ color: 'primary.main', mt: 1 }} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Quantità Totale
            </Typography>
            <Typography variant="h4" color="success.main">
              {formatWeight(getTotaleQuantita())}
            </Typography>
            <InventoryIcon sx={{ color: 'success.main', mt: 1 }} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Tipologie
            </Typography>
            <Typography variant="h4" color="info.main">
              {giacenze.length}
            </Typography>
            <TrendingUpIcon sx={{ color: 'info.main', mt: 1 }} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Giacenze Basse
            </Typography>
            <Typography variant="h4" color="warning.main">
              {getGiacenzeBasse().length}
            </Typography>
            <WarningIcon sx={{ color: 'warning.main', mt: 1 }} />
          </CardContent>
        </Card>
      </Box>

      {/* Alert giacenze basse */}
      {getGiacenzeBasse().length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">Attenzione: Giacenze Basse</Typography>
          <Typography>
            {getGiacenzeBasse().length} tipologie hanno giacenze inferiori alla soglia minima:
            {getGiacenzeBasse().map(g => ` ${g.tipologia_nome}`).join(',')}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Tabella Giacenze */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Giacenze al {formatDate(dataRiferimento)}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : giacenze.length === 0 ? (
              <Alert severity="info">Nessuna giacenza trovata</Alert>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipologia</TableCell>
                      <TableCell align="right">Quantità (kg)</TableCell>
                      <TableCell align="right">Valore Unit.</TableCell>
                      <TableCell align="right">Valore Tot.</TableCell>
                      <TableCell align="center">Stato</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {giacenze.map((giacenza) => (
                      <TableRow key={giacenza.tipologia_materiale_id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {giacenza.tipologia_nome}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatWeight(giacenza.quantita_kg)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(giacenza.valore_unitario)} €/kg
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(giacenza.valore_totale)}
                        </TableCell>
                        <TableCell align="center">
                          {getStatoGiacenza(giacenza.quantita_kg)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          TOTALE
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatWeight(getTotaleQuantita())}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(getTotaleValore())}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Grafico a Torta */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Distribuzione Giacenze
            </Typography>
            {giacenze.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name?: string, props?: any) => {
                      const displayName = name || 'Sconosciuto';
                      const valorFormattato = formatCurrency(props?.payload?.valore || 0);
                      return [`${formatWeight(value)} (${valorFormattato})`, displayName];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">Nessun dato da visualizzare</Alert>
            )}
          </CardContent>
        </Card>
      </Box>

     {/* Grafico Storico */}
      {showStorico && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Andamento Giacenze (Ultimi 6 mesi)
              </Typography>
              <Button
                size="small"
                onClick={() => setShowStorico(false)}
              >
                Nascondi
              </Button>
            </Box>
            {loadingStorico ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : storicoGiacenze.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={storicoGiacenze}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {tipologie.map((tipologia, index) => (
                    <Line
                      key={tipologia.id}
                      type="monotone"
                      dataKey={tipologia.nome}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">Nessun dato storico disponibile</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default GiacenzePage;