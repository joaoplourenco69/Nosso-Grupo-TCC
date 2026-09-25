import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { Image } from 'expo-image';
<<<<<<< HEAD
import { COLORS } from '../constants/colors';
=======
import { COLORS } from '../constants/theme';
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378
import { Header } from '../components/Header';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 40; // Largura ajustada com a margem da tela

// Lista de imagens para o carrossel (ajuste os caminhos conforme seus arquivos em assets/images/)
const SLIDES = [
<<<<<<< HEAD
  { id: '1', image: require('../../assets/images/forest.png'), title: 'Monitoramento Florestal' },
  { id: '2', image: require('../../assets/images/forest.png'), title: 'Detecção por Câmeras' },
  { id: '3', image: require('../../assets/images/forest.png'), title: 'Ação Rápida de Combate' },
=======
  { id: '1', image: require('../../assets/images/carrosel1.jpg'), title: 'floresta 1 legalzinha' },
  { id: '2', image: require('../../assets/images/carrosel2.jpg'), title: 'floresta 2 lindinha ' },
  { id: '3', image: require('../../assets/images/carrosel3.jpg'), title: 'floresta 3' },
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378
];

export const LandingScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Função para mudar a foto ao clicar nas bolinhas/indicadores
  const handleScrollTo = (index) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // Atualiza a bolinha ativa quando o usuário desliza com o dedo
  const handleOnScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carrossel Interativo */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleOnScroll}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Image
                  source={item.image}
                  style={styles.carouselImage}
                  contentFit="cover"
                />
              </View>
            )}
          />

          {/* Indicadores Interativos (Bolinhas clicáveis) */}
          <View style={styles.paginationContainer}>
            {SLIDES.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index ? styles.activeDot : styles.inactiveDot
                ]}
                onPress={() => handleScrollTo(index)}
              />
            ))}
          </View>
        </View>

        {/* Card Informativo */}
        <View style={styles.infoCard}>
          <Text style={styles.appTitle}>FIRE GUARD</Text>
          <Text style={styles.appDescription}>
            Sistema inteligente voltado ao monitoramento e detecção precoce de focos de incêndio em tempo real.
          </Text>
        </View>

        {/* Botão Acessar Sistema */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.actionButtonText}>ACESSAR SISTEMA</Text>
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
  carouselContainer: {
    width: CAROUSEL_WIDTH,
    height: 230,
    marginBottom: 20,
  },
  slide: {
    width: CAROUSEL_WIDTH,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary, // Vinho
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.cardBg, // Creme escuro
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.headerBg, // Verde escuro
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    alignItems: 'center',
    elevation: 3,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  appDescription: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  actionButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    elevation: 4,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});