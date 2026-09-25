import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
<<<<<<< HEAD
import { COLORS } from '../constants/colors';
=======
import { COLORS } from '../constants/theme';
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378
import { Header } from '../components/Header';
import { api } from '../services/api';

// Imagem padrão de incêndio para testes se a foto não vier do backend
<<<<<<< HEAD
const DEFAULT_FIRE_IMG = require('../../assets/images/forest.png');
=======
const DEFAULT_FIRE_IMG = require('../../assets/images/fireTop.png');
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378

export const StatusOcorrenciaScreen = ({ route }) => {
  // Pega os dados enviados pela tela de ListaAlertas
  const { ocorrencia } = route.params || {};

  const [loading, setLoading] = useState(false);

  // Ação de disparar o alerta ou acionar brigada no backend
  const handleAcionarBrigada = async () => {
    setLoading(true);
    try {
      await api.post('/acionar-brigada', {
        ocorrenciaId: ocorrencia?.id,
      });
      Alert.alert('Ação Concluída', 'Brigada de incêndio e bomba d\'água acionadas!');
    } catch (error) {
      Alert.alert('Ação Simulada', 'Comando enviado com sucesso!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>OCORRÊNCIA</Text>

        {/* Badge de Detecção */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeSubtext}>FOCO DE INCÊNDIO</Text>
          <Text style={styles.badgeText}>DETECTADO</Text>
        </View>

        {/* Bloco de Horário e Data */}
        <View style={styles.timeCard}>
          <Text style={styles.timeText}>
            ⏰ HORÁRIO: {ocorrencia?.horario || '18:15'}
          </Text>
          <Text style={styles.dateText}>
            📅 DATA: 27/08/2026
          </Text>
        </View>

        {/* Bloco de Imagem da Câmera */}
        <View style={styles.cameraCard}>
          <Text style={styles.cameraTitle}>IMAGEM DA CÂMERA</Text>
          <Image
<<<<<<< HEAD
            source={ocorrencia?.imagemUrl ? { uri: ocorrencia.imagemUrl } : DEFAULT_FIRE_IMG}
=======
            source={ocorrencia?.imagem_url ? { uri: ocorrencia.imagem_url } : DEFAULT_FIRE_IMG}
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378
            style={styles.cameraImage}
            contentFit="cover"
          />
        </View>

        {/* Botão de Ação (Vinho) */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleAcionarBrigada}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.actionButtonText}>
              BRIGADISTA A CAMINHO / BOMBA D'ÁGUA ACIONADA
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 15,
    letterSpacing: 1,
  },
  badgeContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeSubtext: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  badgeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  timeCard: {
    width: '100%',
    backgroundColor: COLORS.primary, // Vinho
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  dateText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cameraCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  cameraImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  actionButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});