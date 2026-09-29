import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

// Imagens do projeto (Ajuste a extensão se for diferente em seu projeto)
const TOP_LOGO = require('../../assets/images/NatureFoundation.png');
const CENTER_LOGO = require('../../assets/images/logoCompleta.png');

// Slides do carrossel
const SLIDES = [
  { id: '1', image: require('../../assets/images/carrossel1.jpg') },
  { id: '2', image: require('../../assets/images/carrossel2.jpg') },
  { id: '3', image: require('../../assets/images/carrossel3.jpg') },
];

export const LandingScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Função otimizada para trocar de foto ao clicar nas bolinhas
  const handleScrollTo = (index) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  // Atualiza a bolinha ativa ao deslizar manualmente
  const handleOnScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Superior Verde com Logo */}
        <View style={styles.topHeader}>
          <Image 
            source={TOP_LOGO} 
            style={styles.topHeaderLogo} 
            contentFit="contain" 
          />
        </View>

        {/* Barra de Login / Entrar */}
        <View style={styles.loginBar}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation?.navigate && navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Seção da Imagem / Brasão Central */}
        <View style={styles.logoSection}>
          <Image 
            source={CENTER_LOGO} 
            style={styles.logoImage} 
            contentFit="contain" 
          />
        </View>

        <View style={styles.divider} />

        {/* 3. Carrossel Interativo */}
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
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
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

          {/* Indicadores (Bolinhas Clicáveis) */}
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

        <View style={styles.divider} />

        {/* 4. Bloco de Descrição Verde (Fire Guard) */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>FIRE GUARD</Text>
          <View style={styles.innerDivider} />
          <Text style={styles.infoText}>
            A preservação dos recursos naturais exige inteligência, rigor e pronta resposta. 
            Movida por engenharia de alta precisão, nossa tecnologia utiliza sensores térmicos 
            avançados para identificar e conter focos de incêndio no instante de sua formação, 
            neutralizando riscos antes da propagação. Inovação robusta a serviço da integridade 
            dos ecossistemas e do patrimônio ambiental.
          </Text>
          <Text style={styles.flameIcon}>🔥</Text>
        </View>

        {/* 5. Rodapé de Contatos */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>@FIRE_GUARD</Text>
          <Text style={styles.footerText}>FIREGUARD@GMAIL.COM</Text>
          <Text style={styles.footerText}>(14)9999-99999</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#053B23',
  },
  container: {
    backgroundColor: '#F5F2E9',
  },
  topHeader: {
    backgroundColor: '#053B23',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderLogo: {
    width: width * 0.7,
    height: 45,
  },
  loginBar: {
    backgroundColor: '#985252',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  loginButton: {
    paddingHorizontal: 10,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  logoSection: {
    backgroundColor: '#F5F2E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  logoImage: {
    width: width * 0.8,
    height: 160,
  },
  divider: {
    height: 2,
    backgroundColor: '#C5B390',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  carouselContainer: {
    width: width,
    alignItems: 'center',
    marginVertical: 10,
  },
  slide: {
    width: width,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#053B23',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#C5B390',
  },
  infoSection: {
    backgroundColor: '#053B23',
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: 'serif',
  },
  innerDivider: {
    width: '80%',
    height: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  flameIcon: {
    fontSize: 26,
    marginTop: 20,
  },
  footer: {
    backgroundColor: '#053B23',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 5,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});