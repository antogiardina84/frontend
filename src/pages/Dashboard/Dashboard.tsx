// frontend/src/pages/Dashboard/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Input as InputIcon,
  Output as OutputIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
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

import { formatCurrency, formatWeight, formatDate } from '../../utils/formatters';
import { ReportService } from '../../services/ReportService';
import { IngressiService } from '../../services/IngressiService';
import { FatturazioneService } from '../../services/FatturazioneService';
import { GiacenzeService } from '../../services/GiacenzeService';
import { useNotifiche } from '../../contexts/NotificheContext';

// Interfacce locali semplici per il dashboard
interface StatisticheCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

interface DatiGrafico {
  mese: string;
  tonnellate: number;
}

interface DatiPieChart {
  name: string;
  value: number;
  kg: number;
}

interface AlertNotifica {
  tipo: 'warning' | 'info' | 'error' | 'success';
  messaggio: string;
  azione?: () => void;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statistiche, setStatistiche] = useState<StatisticheCard[]>([]);
  const [datiAndamento, setDatiAndamento] = useState<DatiGrafico[]>([]);
  const [datiTipologie, setDatiTipologie] = useState<DatiPieChart[]>([]);
  const [ultimiIngressi, setUltimiIngressi] = useState<any[]>([]);
  const [alertNotifiche, setAlertNotifiche] = useState<AlertNotifica[]>([]);
  const { aggiungiNotifica } = useNotifiche();

  const meseCorrente = new Date().getMonth() + 1;
  const annoCorrente = new Date().getFullYear();

  const caricaStatistiche = useCallback(async () => {
    try {
      // Riepilogo mese corrente - uso 'any' per evitare problemi di tipo
      const riepilogoCorrente: any = await ReportService.getRiepilogoMensile(meseCorrente, annoCorrente);
      
      // Riepilogo mese precedente per confronto
      const mesePrecedente = meseCorrente === 1 ? 12 : meseCorrente - 1;
      const annoPrecedente = meseCorrente === 1 ? annoCorrente - 1 : annoCorrente;
      const riepilogoPrecedente: any = await ReportService.getRiepilogoMensile(mesePrecedente, annoPrecedente);

      // Calcola totali se non esistono
      const calcolaTotali = (riepilogo: any) => {
        const ingressi_kg = riepilogo.ingressi?.reduce((sum: number, item: any) => sum + (item.totale_kg || 0), 0) || 0;
        const uscite_kg = riepilogo.uscite?.reduce((sum: number, item: any) => sum + (item.totale_kg || 0), 0) || 0;
        const uscite_valore = riepilogo.uscite?.reduce((sum: number, item: any) => sum + (item.totale_valore || 0), 0) || 0;
        const giacenze_kg = riepilogo.giacenze?.reduce((sum: number, item: any) => sum + (item.quantita_kg || 0), 0) || 0;
        const giacenze_valore = riepilogo.giacenze?.reduce((sum: number, item: any) => sum + (item.valore_totale || 0), 0) || 0;
        
        return { ingressi_kg, uscite_kg, uscite_valore, giacenze_kg, giacenze_valore };
      };

      const totaliCorrente = riepilogoCorrente.totali || calcolaTotali(riepilogoCorrente);
      const totaliPrecedente = riepilogoPrecedente.totali || calcolaTotali(riepilogoPrecedente);

      // Calcola variazioni percentuali
      const calcolaVariazione = (corrente: number, precedente: number): number => {
        if (precedente === 0) return 0;
        return ((corrente - precedente) / precedente) * 100;
      };

      const statisticheCalcolate: StatisticheCard[] = [
        {
          title: 'Ingressi Mese',
          value: formatWeight(totaliCorrente.ingressi_kg || 0),
          icon: <InputIcon />,
          color: 'primary',
          trend: {
            value: calcolaVariazione(totaliCorrente.ingressi_kg || 0, totaliPrecedente.ingressi_kg || 0),
            isPositive: (totaliCorrente.ingressi_kg || 0) >= (totaliPrecedente.ingressi_kg || 0),
          },
        },
        {
          title: 'Uscite Mese',
          value: formatWeight(totaliCorrente.uscite_kg || 0),
          icon: <OutputIcon />,
          color: 'secondary',
          trend: {
            value: calcolaVariazione(totaliCorrente.uscite_kg || 0, totaliPrecedente.uscite_kg || 0),
            isPositive: (totaliCorrente.uscite_kg || 0) >= (totaliPrecedente.uscite_kg || 0),
          },
        },
        {
          title: 'Fatturato Mese',
          value: formatCurrency(totaliCorrente.uscite_valore || 0),
          icon: <MoneyIcon />,
          color: 'success',
          trend: {
            value: calcolaVariazione(totaliCorrente.uscite_valore || 0, totaliPrecedente.uscite_valore || 0),
            isPositive: (totaliCorrente.uscite_valore || 0) >= (totaliPrecedente.uscite_valore || 0),
          },
        },
        {
          title: 'Valore Giacenze',
          value: formatCurrency(totaliCorrente.giacenze_valore || 0),
          icon: <InventoryIcon />,
          color: 'warning',
        },
      ];

      setStatistiche(statisticheCalcolate);
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    }
  }, [meseCorrente, annoCorrente]);

  const caricaAndamentoMensile = useCallback(async () => {
    try {
      const andamento: any = await ReportService.getAndamentoRaccolta(annoCorrente, annoCorrente);
      
      const datiGrafico: DatiGrafico[] = (andamento.dati_mensili || []).map((item: any) => ({
        mese: new Date(annoCorrente, item.mese - 1, 1).toLocaleDateString('it-IT', { month: 'short' }),
        tonnellate: Math.round((item.totale_kg || 0) / 1000),
      }));

      setDatiAndamento(datiGrafico);
    } catch (error) {
      console.error('Errore caricamento andamento:', error);
    }
  }, [annoCorrente]);

  const caricaRiepilogoTipologie = useCallback(async () => {
    try {
      const riepilogo: any = await ReportService.getRiepilogoMensile(meseCorrente, annoCorrente);
      
      const datiPie: DatiPieChart[] = (riepilogo.ingressi || [])
        .filter((item: any) => (item.totale_kg || 0) > 0)
        .map((item: any) => ({
          name: item.TipologiaMateriale?.nome || 'Sconosciuto',
          value: Math.round((item.totale_kg || 0) / 1000),
          kg: item.totale_kg || 0,
        }))
        .sort((a: DatiPieChart, b: DatiPieChart) => b.value - a.value)
        .slice(0, 6); // Top 6

      setDatiTipologie(datiPie);
    } catch (error) {
      console.error('Errore caricamento tipologie:', error);
    }
  }, [meseCorrente, annoCorrente]);

  const caricaUltimiIngressi = useCallback(async () => {
    try {
      const response = await IngressiService.getIngressi({
        limit: 5,
        page: 1,
      });

      setUltimiIngressi(response.data || []);
    } catch (error) {
      console.error('Errore caricamento ultimi ingressi:', error);
    }
  }, []);

  const verificaAlert = useCallback(async () => {
    const alerts: AlertNotifica[] = [];

    try {
      // Controlla fatture in bozza
      const fatture = await FatturazioneService.getFatture({
        stato: 'bozza',
        limit: 10,
      });

      if (fatture.data && fatture.data.length > 0) {
        alerts.push({
          tipo: 'warning',
          messaggio: `${fatture.data.length} fatture in bozza da completare`,
          azione: () => (window.location.href = '/fatturazione'),
        });
      }

      // Controlla giacenze basse
      const giacenze = await GiacenzeService.getGiacenze(
        new Date().toISOString().split('T')[0]
      );

      const giacenzeBasse = (giacenze.giacenze || []).filter((g: any) => (g.quantita_kg || 0) < 1000);
      if (giacenzeBasse.length > 0) {
        alerts.push({
          tipo: 'info',
          messaggio: `${giacenzeBasse.length} materiali con giacenze inferiori a 1 tonnellata`,
          azione: () => (window.location.href = '/giacenze'),
        });
      }

      setAlertNotifiche(alerts);
    } catch (error) {
      console.error('Errore verifica alert:', error);
    }
  }, []);

  const caricaDatiDashboard = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        caricaStatistiche(),
        caricaAndamentoMensile(),
        caricaRiepilogoTipologie(),
        caricaUltimiIngressi(),
        verificaAlert(),
      ]);
    } catch (error) {
      console.error('Errore caricamento dashboard:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel caricamento dei dati della dashboard',
      });
    } finally {
      setLoading(false);
    }
  }, [caricaStatistiche, caricaAndamentoMensile, caricaRiepilogoTipologie, caricaUltimiIngressi, verificaAlert, aggiungiNotifica]);

  useEffect(() => {
    caricaDatiDashboard();
  }, [caricaDatiDashboard]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Dashboard
        </Typography>
        <IconButton onClick={caricaDatiDashboard} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Alert notifications */}
      {alertNotifiche.length > 0 && (
        <Box mb={3}>
          {alertNotifiche.map((alert, index) => (
            <Alert
              key={index}
              severity={alert.tipo}
              action={
                alert.azione && (
                  <IconButton size="small" onClick={alert.azione}>
                    <WarningIcon />
                  </IconButton>
                )
              }
              sx={{ mb: 1 }}
            >
              {alert.messaggio}
            </Alert>
          ))}
        </Box>
      )}

      {/* Statistiche principali */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)' 
        }} 
        gap={3} 
        mb={4}
      >
        {statistiche.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight={600}>
                    {stat.value}
                  </Typography>
                  {stat.trend && (
                    <Box display="flex" alignItems="center" mt={1}>
                      {stat.trend.isPositive ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="body2"
                        color={stat.trend.isPositive ? 'success.main' : 'error.main'}
                        ml={0.5}
                      >
                        {Math.abs(stat.trend.value).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box
                  sx={{
                    bgcolor: `${stat.color}.main`,
                    color: 'white',
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Grafici */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ 
          xs: '1fr', 
          md: '2fr 1fr' 
        }} 
        gap={3} 
        mb={4}
      >
        {/* Andamento mensile */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Andamento Ingressi {annoCorrente}
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datiAndamento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mese" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value} t`, 'Tonnellate']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tonnellate"
                    stroke="#1976d2"
                    strokeWidth={3}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Distribuzione per tipologia */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuzione Materiali
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datiTipologie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datiTipologie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name?: string, props?: any) => {
                      const displayName = name || 'Quantità';
                      const weight = props?.payload?.kg || 0;
                      return [`${value} t (${formatWeight(weight)})`, displayName];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Ultimi ingressi */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ultimi Ingressi
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Comune</TableCell>
                  <TableCell>Materiale</TableCell>
                  <TableCell>Quantità</TableCell>
                  <TableCell>Flusso</TableCell>
                  <TableCell>Formulario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ultimiIngressi.map((ingresso: any) => (
                  <TableRow key={ingresso.id}>
                    <TableCell>{formatDate(ingresso.data_conferimento)}</TableCell>
                    <TableCell>{ingresso.Comune?.nome || 'N/A'}</TableCell>
                    <TableCell>{ingresso.TipologiaMateriale?.nome || 'N/A'}</TableCell>
                    <TableCell>{formatWeight(ingresso.quantita_kg || 0)}</TableCell>
                    <TableCell>
                      {ingresso.FlussoCorepla && (
                        <Chip
                          label={ingresso.FlussoCorepla.codice}
                          size="small"
                          color="primary"
                        />
                      )}
                    </TableCell>
                    <TableCell>{ingresso.numero_formulario || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;