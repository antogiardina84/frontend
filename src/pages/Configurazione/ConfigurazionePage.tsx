// frontend/src/pages/ConfigurazionePage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tabs,
    Tab,
    Alert,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Settings as SettingsIcon,
    Category as CategoryIcon,
    Timeline as TimelineIcon,
    Euro as EuroIcon
} from '@mui/icons-material';
import { TipologiaMateriale, FlussoCorepla } from '../../types';
import TipologieMaterialiForm from '../../components/forms/TipologieMaterialiform';
import FlussiCoreplaForm from '../../components/forms/FlussiCoreplaForm';
import { TipologieMaterialiService } from '../../services/TipologieMaterialiService';
import { FlussiService } from '../../services/FlussiService';

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
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const ConfigurazionePage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [tipologie, setTipologie] = useState<TipologiaMateriale[]>([]);
    const [flussi, setFlussi] = useState<FlussoCorepla[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ 
        id: number; 
        type: 'tipologia' | 'flusso';
        nome: string;
    } | null>(null);

    // Form states
    const [tipologiaForm, setTipologiaForm] = useState<{
        open: boolean;
        tipologia?: TipologiaMateriale;
    }>({ open: false });

    const [flussoForm, setFlussoForm] = useState<{
        open: boolean;
        flusso?: FlussoCorepla;
    }>({ open: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Caricamento dati configurazione...');

            const [tipologieRes, flussiRes] = await Promise.all([
                TipologieMaterialiService.getTipologie(),
                FlussiService.getFlussi()
            ]);

            console.log('Risposta tipologie:', tipologieRes);
            console.log('Risposta flussi:', flussiRes);

            // Controlla se response.data esiste - compatibile con la tua struttura API
            if (tipologieRes && tipologieRes.data) {
                setTipologie(tipologieRes.data);
                console.log('Tipologie caricate:', tipologieRes.data.length);
            } else {
                console.warn('Nessuna tipologia trovata o struttura risposta non valida');
                setTipologie([]);
            }

            if (flussiRes && flussiRes.data) {
                setFlussi(flussiRes.data);
                console.log('Flussi caricati:', flussiRes.data.length);
            } else {
                console.warn('Nessun flusso trovato o struttura risposta non valida');
                setFlussi([]);
            }

        } catch (err) {
            console.error('Errore nel caricamento dati:', err);
            setError(err instanceof Error ? err.message : 'Errore nel caricamento dati');
        } finally {
            setLoading(false);
        }
    };

    const handleSalvaTipologia = async (data: any) => {
        try {
            console.log('Salvando tipologia:', data);
            
            let response;
            if (tipologiaForm.tipologia) {
                response = await TipologieMaterialiService.updateTipologia(tipologiaForm.tipologia.id, data);
            } else {
                response = await TipologieMaterialiService.createTipologia(data);
            }

            console.log('Risposta salvataggio tipologia:', response);

            // Controlla se la risposta contiene dati
            if (response && response.data) {
                await loadData();
                setTipologiaForm({ open: false });
                setError(''); // Pulisci eventuali errori precedenti
            } else {
                throw new Error('Risposta API non valida');
            }
        } catch (err) {
            console.error('Errore salvataggio tipologia:', err);
            
            // Gestisci diversi tipi di errore
            let errorMessage = 'Errore sconosciuto nel salvataggio';
            
            if (err instanceof Error) {
                errorMessage = err.message;
                
                // Gestisci errori specifici
                if (errorMessage.includes('già esistente') || errorMessage.includes('duplicate')) {
                    errorMessage = 'Codice già esistente. Scegli un codice diverso.';
                } else if (errorMessage.includes('400')) {
                    errorMessage = 'Dati non validi. Controlla i campi inseriti.';
                } else if (errorMessage.includes('500')) {
                    errorMessage = 'Errore del server. Riprova più tardi.';
                }
            }
            
            setError(errorMessage);
            throw err;
        }
    };

    const handleSalvaFlusso = async (data: any) => {
        try {
            console.log('Salvando flusso:', data);
            
            let response;
            if (flussoForm.flusso) {
                response = await FlussiService.updateFlusso(flussoForm.flusso.id, data);
            } else {
                response = await FlussiService.createFlusso(data);
            }

            console.log('Risposta salvataggio flusso:', response);

            if (response && response.data) {
                await loadData();
                setFlussoForm({ open: false });
                setError(''); // Pulisci eventuali errori precedenti
            } else {
                throw new Error('Risposta API non valida');
            }
        } catch (err) {
            console.error('Errore salvataggio flusso:', err);
            
            let errorMessage = 'Errore sconosciuto nel salvataggio';
            
            if (err instanceof Error) {
                errorMessage = err.message;
                
                if (errorMessage.includes('già esistente') || errorMessage.includes('duplicate')) {
                    errorMessage = 'Codice flusso già esistente. Scegli un codice diverso.';
                } else if (errorMessage.includes('400')) {
                    errorMessage = 'Dati non validi. Controlla i campi inseriti.';
                } else if (errorMessage.includes('500')) {
                    errorMessage = 'Errore del server. Riprova più tardi.';
                }
            }
            
            setError(errorMessage);
            throw err;
        }
    };

    const openDeleteConfirm = (id: number, type: 'tipologia' | 'flusso', nome: string) => {
        setItemToDelete({ id, type, nome });
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        
        const { id, type, nome } = itemToDelete;
        setConfirmDialogOpen(false);

        try {
            console.log(`Eliminando ${type} con id ${id}:`, nome);
            
            let response;
            if (type === 'tipologia') {
                response = await TipologieMaterialiService.deleteTipologia(id);
            } else {
                response = await FlussiService.deleteFlusso(id);
            }

            console.log('Risposta eliminazione:', response);

            // Per le operazioni di delete, la risposta potrebbe essere vuota ma valida
            await loadData();
            setError(''); // Pulisci eventuali errori precedenti
            
        } catch (err) {
            console.error('Errore nell\'eliminazione:', err);
            
            let errorMessage = 'Errore nell\'eliminazione';
            
            if (err instanceof Error) {
                errorMessage = err.message;
                
                if (errorMessage.includes('utilizzat') || errorMessage.includes('foreign key')) {
                    errorMessage = `Impossibile eliminare: ${type} utilizzata in altre operazioni`;
                }
            }
            
            setError(errorMessage);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialogOpen(false);
        setItemToDelete(null);
    };

    const handleRefresh = () => {
        loadData();
    };

    if (loading) {
        return (
            <Box sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '400px'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Caricamento configurazioni...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" component="h1">
                            Configurazione Sistema
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestisci tipologie materiali e flussi COREPLA
                        </Typography>
                    </Box>
                </Box>
                
                <Button 
                    variant="outlined" 
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Aggiorna
                </Button>
            </Box>

            {/* Alert errori */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3 }} 
                    onClose={() => setError('')}
                    action={
                        <Button color="inherit" size="small" onClick={handleRefresh}>
                            Riprova
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={(_, newValue) => setCurrentTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab
                        icon={<CategoryIcon />}
                        label={`Tipologie Materiali (${tipologie.length})`}
                        iconPosition="start"
                    />
                    <Tab
                        icon={<TimelineIcon />}
                        label={`Flussi COREPLA (${flussi.length})`}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Tab Tipologie Materiali */}
            <TabPanel value={currentTab} index={0}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Gestione Tipologie Materiali
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configura i tipi di materiali plastici che la tua piattaforma può ricevere e lavorare
                    </Typography>
                </Box>

                <TableContainer component={Paper} elevation={1}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Codice</strong></TableCell>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>CER</strong></TableCell>
                                <TableCell><strong>Consorzio</strong></TableCell>
                                <TableCell><strong>Prezzo</strong></TableCell>
                                <TableCell><strong>Stato</strong></TableCell>
                                <TableCell align="right"><strong>Azioni</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tipologie.map((tipologia) => (
                                <TableRow key={tipologia.id} hover>
                                    <TableCell>
                                        <Chip 
                                            label={tipologia.codice} 
                                            variant="outlined" 
                                            size="small"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {tipologia.nome}
                                        </Typography>
                                        {tipologia.descrizione && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {tipologia.descrizione.substring(0, 60)}
                                                {tipologia.descrizione.length > 60 ? '...' : ''}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {tipologia.cer ? (
                                            <Typography variant="body2" fontFamily="monospace">
                                                {tipologia.cer}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{tipologia.consorzio || '-'}</TableCell>
                                    <TableCell>
                                        {tipologia.prezzo_medio ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <EuroIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {tipologia.prezzo_medio}/t
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={tipologia.attivo ? 'Attiva' : 'Disattiva'}
                                            color={tipologia.attivo ? 'success' : 'default'}
                                            size="small"
                                            variant={tipologia.attivo ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => setTipologiaForm({ open: true, tipologia })}
                                            title="Modifica tipologia"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => openDeleteConfirm(tipologia.id, 'tipologia', tipologia.nome)}
                                            title="Elimina tipologia"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tipologie.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                Nessuna tipologia configurata
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                Aggiungi le tipologie di materiali che gestisci
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => setTipologiaForm({ open: true })}
                                            >
                                                Aggiungi Prima Tipologia
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {tipologie.length > 0 && (
                    <Fab
                        color="primary"
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                        onClick={() => setTipologiaForm({ open: true })}
                        title="Aggiungi tipologia"
                    >
                        <AddIcon />
                    </Fab>
                )}
            </TabPanel>

            {/* Tab Flussi COREPLA */}
            <TabPanel value={currentTab} index={1}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Gestione Flussi COREPLA
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configura i flussi di raccolta secondo le convenzioni COREPLA con i relativi corrispettivi
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {flussi.map((flusso) => (
                        <Grid item xs={12} md={6} lg={4} key={flusso.id}>
                            <Card elevation={2} sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            borderRadius: 1,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2
                                        }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {flusso.codice}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6">
                                                Flusso {flusso.codice}
                                            </Typography>
                                            <Chip
                                                label={flusso.attivo ? 'Attivo' : 'Inattivo'}
                                                color={flusso.attivo ? 'success' : 'default'}
                                                size="small"
                                                variant={flusso.attivo ? 'filled' : 'outlined'}
                                            />
                                        </Box>
                                    </Box>

                                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                                        {flusso.nome}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
                                        {flusso.descrizione || 'Nessuna descrizione disponibile'}
                                    </Typography>

                                    <Stack spacing={1.5}>
                                        <Box sx={{ 
                                            p: 1.5, 
                                            backgroundColor: 'success.50',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'success.200'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="success.main" fontWeight="medium">
                                                    Corrispettivo COREPLA:
                                                </Typography>
                                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                                    {flusso.corrispettivo_unitario} €/t
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {(flusso.limite_traccianti || flusso.limite_frazione_estranea || flusso.limite_cpl) && (
                                            <Box sx={{ 
                                                p: 1.5, 
                                                backgroundColor: 'grey.50',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                    LIMITI QUALITATIVI
                                                </Typography>
                                                
                                                {flusso.limite_traccianti && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Traccianti:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            ≤ {flusso.limite_traccianti}%
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {flusso.limite_frazione_estranea && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Frazione estranea:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            ≤ {flusso.limite_frazione_estranea}%
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {flusso.limite_cpl && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            CPL minimo:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            ≥ {flusso.limite_cpl}%
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>

                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => setFlussoForm({ open: true, flusso })}
                                    >
                                        Modifica
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => openDeleteConfirm(flusso.id, 'flusso', `Flusso ${flusso.codice}`)}
                                    >
                                        Elimina
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}

                    {flussi.length === 0 && (
                        <Grid item xs={12}>
                            <Card elevation={1}>
                                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                    <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        Nessun flusso COREPLA configurato
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                                        I flussi COREPLA definiscono le tipologie di raccolta (A, B, C, D) 
                                        con i relativi corrispettivi e limiti qualitativi
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={() => setFlussoForm({ open: true })}
                                    >
                                        Configura Flussi COREPLA
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>

                {flussi.length > 0 && (
                    <Fab
                        color="primary"
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                        onClick={() => setFlussoForm({ open: true })}
                        title="Aggiungi flusso"
                    >
                        <AddIcon />
                    </Fab>
                )}
            </TabPanel>

            {/* Form Tipologie Materiali */}
            <TipologieMaterialiForm
                open={tipologiaForm.open}
                tipologia_materiale={tipologiaForm.tipologia}
                onSalva={handleSalvaTipologia}
                onAnnulla={() => setTipologiaForm({ open: false })}
            />

            {/* Form Flussi COREPLA */}
            <FlussiCoreplaForm
                open={flussoForm.open}
                flusso={flussoForm.flusso}
                onSalva={handleSalvaFlusso}
                onAnnulla={() => setFlussoForm({ open: false })}
            />

            {/* Confirmation Dialog for Deletion */}
            <Dialog 
                open={confirmDialogOpen} 
                onClose={handleCancelDelete}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeleteIcon color="error" sx={{ mr: 1 }} />
                        Conferma eliminazione
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sei sicuro di voler eliminare <strong>"{itemToDelete?.nome}"</strong>?
                        <br /><br />
                        Questa azione non può essere annullata e potrebbe impedire 
                        l'eliminazione se l'elemento è utilizzato in altre operazioni.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCancelDelete} variant="outlined">
                        Annulla
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Elimina
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConfigurazionePage;