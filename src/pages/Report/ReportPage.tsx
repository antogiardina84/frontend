// frontend/src/pages/Report/ReportPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { ReportService } from '../../services/ReportService';
import { formatDate, formatWeight } from '../../utils/formatters';
import { useNotifiche } from '../../contexts/NotificheContext';
import { ReportRiepilogoMensile, MovimentoMagazzino, AndamentoRaccolta } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface StatisticheCard {
  title: string;
  value: string;
  subtitle: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}

const ReportPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [riepilogoMensile, setRiepilogoMensile] = useState<ReportRiepilogoMensile | null>(null);
  const [andamentoRaccolta, setAndamentoRaccolta] = useState<AndamentoRaccolta | null>(null);
  const [movimentiMagazzino, setMovimentiMagazzino] = useState<MovimentoMagazzino[]>([]);
  
  // Filtri
  const [meseSelezionato, setMeseSelezionato] = useState(new Date().getMonth() + 1);
  const [annoSelezionato, setAnnoSelezionato] = useState(new Date().getFullYear());
  const [tipologiaSelezionata, setTipologiaSelezionata] = useState<number | undefined>(undefined);
  const [periodoAndamento, setPeriodoAndamento] = useState({
    annoInizio: new Date().getFullYear() - 1,
    annoFine: new Date().getFullYear(),
  });

  const { aggiungiNotifica } = useNotifiche();

  const caricaRiepilogoMensile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ReportService.getRiepilogoMensile(meseSelezionato, annoSelezionato);
      setRiepilogoMensile(response);
    } catch (error) {
      console.error('Errore caricamento riepilogo mensile:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento del riepilogo mensile',
      });
    } finally {
      setLoading(false);
    }
  }, [meseSelezionato, annoSelezionato, aggiungiNotifica]);

  const caricaAndamentoRaccolta = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ReportService.getAndamentoRaccolta(
        periodoAndamento.annoInizio,
        periodoAndamento.annoFine
      );
      setAndamentoRaccolta(response);
    } catch (error) {
      console.error('Errore caricamento andamento raccolta:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dell\'andamento raccolta',
      });
    } finally {
      setLoading(false);
    }
  }, [periodoAndamento.annoInizio, periodoAndamento.annoFine, aggiungiNotifica]);

  const caricaMovimentiMagazzino = useCallback(async () => {
    setLoading(true);
    try {
      const dataInizio = `${annoSelezionato}-${meseSelezionato.toString().padStart(2, '0')}-01`;
      const dataFine = new Date(annoSelezionato, meseSelezionato, 0).toISOString().split('T')[0];
      
      const response = await ReportService.getMovimentiMagazzino(
        dataInizio, 
        dataFine,
        tipologiaSelezionata
      );
      setMovimentiMagazzino(response.movimenti);
    } catch (error) {
      console.error('Errore caricamento movimenti magazzino:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dei movimenti magazzino',
      });
    } finally {
      setLoading(false);
    }
  }, [annoSelezionato, meseSelezionato, tipologiaSelezionata, aggiungiNotifica]);

  useEffect(() => {
    caricaRiepilogoMensile();
  }, [caricaRiepilogoMensile]);

  useEffect(() => {
    caricaAndamentoRaccolta();
  }, [caricaAndamentoRaccolta]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 2) {
      caricaMovimentiMagazzino();
    }
  };

  const esportaReport = () => {
    aggiungiNotifica({
      tipo: 'info',
      titolo: 'Funzione in sviluppo',
      messaggio: 'L\'esportazione dei report sarà disponibile a breve',
    });
  };

  // Funzione getRiepilogoCards con gestione errori migliorata
  const getRiepilogoCards = (): StatisticheCard[] => {
    if (!riepilogoMensile) {
      console.warn('riepilogoMensile non disponibile');
      return [];
    }

    try {
      // Funzione helper per ottenere valori numerici in sicurezza
      const getNumericValue = (value: any): number => {
        if (typeof value === 'number' && !isNaN(value)) {
          return value;
        }
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      // Calcola i valori con controlli di sicurezza
      const ingressiTotaleKg = getNumericValue(riepilogoMensile.ingressi?.totale_kg);
      const ingressiNumeroConferimenti = getNumericValue(riepilogoMensile.ingressi?.numero_conferimenti);
      
      const usciteTotaleKg = getNumericValue(riepilogoMensile.uscite?.totale_kg);
      const usciteNumeroSpedizioni = getNumericValue(riepilogoMensile.uscite?.numero_spedizioni);
      
      // Calcola la differenza se non esiste nella struttura dati
      let differenzaKg = 0;
      if (riepilogoMensile.bilancio?.differenza_kg !== undefined) {
        differenzaKg = getNumericValue(riepilogoMensile.bilancio.differenza_kg);
      } else {
        // Calcola automaticamente la differenza
        differenzaKg = ingressiTotaleKg - usciteTotaleKg;
        console.info('Differenza calcolata automaticamente:', differenzaKg);
      }

      const efficienzaMedia = getNumericValue(riepilogoMensile.lavorazioni?.efficienza_media);
      const numeroLavorazioni = getNumericValue(riepilogoMensile.lavorazioni?.numero_lavorazioni);

      return [
        {
          title: 'Ingressi Totali',
          value: formatWeight(ingressiTotaleKg),
          subtitle: `${ingressiNumeroConferimenti} conferimenti`,
          color: 'primary',
          icon: <TrendingUpIcon />,
        },
        {
          title: 'Uscite Totali',
          value: formatWeight(usciteTotaleKg),
          subtitle: `${usciteNumeroSpedizioni} spedizioni`,
          color: 'secondary',
          icon: <TrendingUpIcon />,
        },
        {
          title: 'Bilancio',
          value: formatWeight(differenzaKg),
          subtitle: differenzaKg >= 0 ? 'Accumulo' : 'Deficit',
          color: (differenzaKg >= 0 ? 'success' : 'error'),
          icon: <BarChartIcon />,
        },
        {
          title: 'Efficienza Lavorazioni',
          value: `${efficienzaMedia.toFixed(1)}%`,
          subtitle: `${numeroLavorazioni} lavorazioni`,
          color: 'info',
          icon: <PieChartIcon />,
        },
      ];

    } catch (error) {
      console.error('Errore in getRiepilogoCards:', error);
      
      // Restituisce dati di fallback in caso di errore
      return [
        {
          title: 'Errore Caricamento',
          value: '---',
          subtitle: 'Dati non disponibili',
          color: 'error',
          icon: <ReportIcon />,
        }
      ];
    }
  };

  const getComuniPieData = () => {
    if (!riepilogoMensile?.riepilogo_comuni || !Array.isArray(riepilogoMensile.riepilogo_comuni)) {
      return [];
    }
    
    try {
      return riepilogoMensile.riepilogo_comuni
        .slice(0, 5)
        .map((item) => ({
          name: item.Comune?.nome || 'Sconosciuto',
          value: typeof item.totale_kg === 'number' ? item.totale_kg : 0,
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Errore in getComuniPieData:', error);
      return [];
    }
  };

  const getAndamentoChartData = () => {
    if (!andamentoRaccolta?.data || !Array.isArray(andamentoRaccolta.data)) {
      return [];
    }
    
    try {
      return andamentoRaccolta.data.map((item) => ({
        periodo: item.periodo || 'N/A',
        tonnellate: Math.round((item.ingressi_kg || 0) / 1000),
        ingressi_kg: item.ingressi_kg || 0,
        uscite_kg: item.uscite_kg || 0,
        bilancio_kg: item.bilancio_kg || 0,
      }));
    } catch (error) {
      console.error('Errore in getAndamentoChartData:', error);
      return [];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          Report e Analytics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={esportaReport}
        >
          Esporta Report
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Riepilogo Mensile" />
          <Tab label="Andamento Raccolta" />
          <Tab label="Movimenti Magazzino" />
        </Tabs>
      </Paper>

      {/* Tab Panel 1: Riepilogo Mensile */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Mese</InputLabel>
              <Select
                value={meseSelezionato}
                onChange={(e) => setMeseSelezionato(Number(e.target.value))}
                label="Mese"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('it-IT', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Anno</InputLabel>
              <Select
                value={annoSelezionato}
                onChange={(e) => setAnnoSelezionato(Number(e.target.value))}
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
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : riepilogoMensile ? (
          <>
            {/* Cards riepilogative */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: 3, 
              mb: 3 
            }}>
              {getRiepilogoCards().map((card, index) => (
                <Card key={index}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: `${card.color}.main`, mb: 1 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h6" color="textSecondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" color={`${card.color}.main`}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Grafico Top Comuni */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Top 5 Comuni per Conferimenti
                  </Typography>
                  {getComuniPieData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getComuniPieData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getComuniPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatWeight(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Alert severity="info">Nessun dato disponibile per i comuni</Alert>
                  )}
                </CardContent>
              </Card>
            </Box>
          </>
        ) : (
          <Alert severity="info">Seleziona un periodo per visualizzare il riepilogo</Alert>
        )}
      </TabPanel>

      {/* Tab Panel 2: Andamento Raccolta */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Anno Inizio</InputLabel>
              <Select
                value={periodoAndamento.annoInizio}
                onChange={(e) => setPeriodoAndamento(prev => ({ ...prev, annoInizio: Number(e.target.value) }))}
                label="Anno Inizio"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const anno = new Date().getFullYear() - 4 + i;
                  return (
                    <MenuItem key={anno} value={anno}>
                      {anno}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>Anno Fine</InputLabel>
              <Select
                value={periodoAndamento.annoFine}
                onChange={(e) => setPeriodoAndamento(prev => ({ ...prev, annoFine: Number(e.target.value) }))}
                label="Anno Fine"
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
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Andamento Raccolta nel Tempo
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : getAndamentoChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getAndamentoChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'tonnellate' ? `${value} t` : formatWeight(Number(value)), 
                    name === 'tonnellate' ? 'Tonnellate' : name
                  ]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ingressi_kg"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Ingressi"
                  />
                  <Line
                    type="monotone"
                    dataKey="uscite_kg"
                    stroke="#FF8042"
                    strokeWidth={2}
                    name="Uscite"
                  />
                  <Line
                    type="monotone"
                    dataKey="bilancio_kg"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Bilancio"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">Nessun dato disponibile per il periodo selezionato</Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab Panel 3: Movimenti Magazzino */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Tipologia</InputLabel>
              <Select
                value={tipologiaSelezionata || ''}
                onChange={(e) => setTipologiaSelezionata(e.target.value ? Number(e.target.value) : undefined)}
                label="Tipologia"
              >
                <MenuItem value="">Tutte</MenuItem>
                <MenuItem value={1}>Plastica</MenuItem>
                <MenuItem value={2}>Carta</MenuItem>
                <MenuItem value={3}>Vetro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Movimenti Magazzino - {new Date(0, meseSelezionato - 1).toLocaleString('it-IT', { month: 'long' })} {annoSelezionato}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : movimentiMagazzino.length > 0 ? (
              <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                {movimentiMagazzino.map((movimento, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderLeft: `4px solid ${movimento.segno === '+' ? '#4caf50' : '#f44336'}`,
                    }}
                  >
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '150px 50px 1fr 150px 150px 100px',
                      },
                      gap: 2,
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(movimento.data)}
                      </Typography>
                      <Typography
                        variant="h6"
                        color={movimento.segno === '+' ? 'success.main' : 'error.main'}
                      >
                        {movimento.segno}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {movimento.descrizione}
                      </Typography>
                      <Typography variant="body2">
                        {movimento.tipologia}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatWeight(movimento.quantita_kg)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: movimento.tipo === 'ingresso' ? 'success.light' : 
                                         movimento.tipo === 'uscita' ? 'error.light' : 'info.light',
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        {movimento.tipo.toUpperCase()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Alert severity="info">Nessun movimento registrato per il periodo selezionato</Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default ReportPage;