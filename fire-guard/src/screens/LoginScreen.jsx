import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { Header } from '../components/Header';

const { width } = Dimensions.get('window');

// Certifique-se de que o nome do arquivo corresponde ao seu brasão na pasta assets/images/
const LOGO_CENTER = require('../../assets/images/logoCompleta.png');

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    // Lógica de autenticação do Supabase entrará aqui
    console.log('Login com:', email, senha);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. Cabeçalho Verde Superior com Logo */}
          <Header />

          {/* 2. Brasão / Logo Central da Árvore */}
          <View style={styles.logoContainer}>
            <Image 
              source={LOGO_CENTER} 
              style={styles.centerLogo} 
              contentFit="contain" 
            />
          </View>

          {/* 3. Card Verde Escuro de Formulário */}
          <View style={styles.loginCard}>
            
            {/* Campo EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu @email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo SENHA */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SENHA</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#A0A0A0"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            {/* Botão ENVIAR */}
            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitButtonText}>ENVIAR</Text>
            </TouchableOpacity>

            {/* Link CRIAR CONTA */}
            <TouchableOpacity 
              style={styles.registerLink}
              onPress={() => navigation?.navigate && navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>CRIAR CONTA</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#053B23', // Verde escuro do topo/fundo seguro
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F5F2E9', // Fundo bege claro idêntico à imagem
    alignItems: 'center',
    paddingBottom: 30,
  },
  logoContainer: {
    paddingVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLogo: {
    width: width * 0.6,
    height: 150,
  },
  loginCard: {
    width: width * 0.85,
    backgroundColor: '#053B23', // Verde escuro idêntico ao protótipo
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#EAE3CD', // bege dourado suave do botão
    width: '65%',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  submitButtonText: {
    color: '#053B23',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontFamily: 'serif',
  },
  registerLink: {
    padding: 5,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    fontFamily: 'serif',
  },
});