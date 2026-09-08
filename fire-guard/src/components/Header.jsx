import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const LOGO_IMG = require('../../assets/images/NatureFoundation.png.png');

export function Header() {
    return (
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            <Image
              source={LOGO_IMG}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </SafeAreaView>
        {}
        <View style={styles.bottomBorder} />
      </View>
    );
  }
  const styles = StyleSheet.create({
    outerContainer: {
      backgroundColor: COLORS.headerBg,
      elevation: 4, // Sombra no Android
      shadowColor: '#000', // Sombra no iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      zIndex: 10,
    },
    safeArea: {
      backgroundColor: COLORS.headerBg,
    },
    headerContent: {
      height: 70, //alturaheader
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    logo: {
      height: 60,
      width: width * 0.4, //40%
    },
    bottomBorder: {
      height: 2,
      backgroundColor: COLORS.cardBg, // begee borda inferior
    },
  });