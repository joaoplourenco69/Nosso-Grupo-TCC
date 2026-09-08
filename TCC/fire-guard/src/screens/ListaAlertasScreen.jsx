import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../constants/theme';
import { Header } from '../components/Header';
import { supabase } from '../services/supabase';

const PLACEHOLDER_IMG = require('../../assets/images/forest.png');

export const ListaAlertasScreen = ({ navigation }) => {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca os alertas cadastrados no Supabase
  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setOcorrencias(data || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const handleSelectOcorrencia = (item) => {
    navigation.navigate('StatusOcorrencia', { ocorrencia: item });
  };

  const alertaCritico = ocorrencias.length > 0 ? ocorrencias[0] : null;
  const historico = ocorrencias.length > 1 ? ocorrencias.slice(1) : [];

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Buscando alertas...</Text>
          </View>
        ) : (
          <>
            {alertaCritico ? (
              <View style={styles.criticalAlertCard}>
                <Text style={styles.criticalAlertTitle}>🔥 FOCO DETECTADO POR IA</Text>
                
                {/* Carrega a URL do Imgur diretamente */}
                <Image
                  source={
                    alertaCritico.imagem_url 
                      ? { uri: alertaCritico.imagem_url } 
                      : PLACEHOLDER_IMG
                  }
                  style={styles.iaImage}
                  contentFit="cover"
                />

                <TouchableOpacity 
                  style={styles.criticalAlertBox}
                  onPress={() => handleSelectOcorrencia(alertaCritico)}
                >
                  <Text style={styles.criticalAlertText}>
                    LOCAL: {alertaCritico.local?.toUpperCase()}
                  </Text>
                  <Text style={styles.criticalAlertSubtext}>
                    HORÁRIO: {alertaCritico.horario} - CLIQUE PARA DETALHES
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noAlertBox}>
                <Text style={styles.noAlertText}>Nenhum foco de incêndio registrado.</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>HISTÓRICO DE OCORRÊNCIAS</Text>

            <FlatList
              data={historico}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              onRefresh={fetchOcorrencias}
              refreshing={loading}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.historyCard}
                  onPress={() => handleSelectOcorrencia(item)}
                >
                  <View style={styles.historyContent}>
                    <Image
                      source={item.imagem_url ? { uri: item.imagem_url } : PLACEHOLDER_IMG}
                      style={styles.historyThumb}
                      contentFit="cover"
                    />
                    <View style={styles.historyTextGroup}>
                      <Text style={styles.historyLocalText}>Local: {item.local}</Text>
                      <Text style={styles.historyTimeText}>Horário: {item.horario}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.darkText,
    fontSize: 14,
  },
  criticalAlertCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    elevation: 4,
  },
  criticalAlertTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  iaImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  criticalAlertBox: {
    backgroundColor: '#6A1B1B',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  criticalAlertText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  criticalAlertSubtext: {
    color: '#FFD7D7',
    fontSize: 10,
    marginTop: 3,
  },
  noAlertBox: {
    padding: 15,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  noAlertText: {
    color: COLORS.darkText,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  historyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyThumb: {
    width: 45,
    height: 45,
    borderRadius: 6,
  },
  historyTextGroup: {
    flex: 1,
  },
  historyLocalText: {
    color: COLORS.darkText,
    fontSize: 13,
    fontWeight: '600',
  },
  historyTimeText: {
    color: COLORS.darkText,
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
});