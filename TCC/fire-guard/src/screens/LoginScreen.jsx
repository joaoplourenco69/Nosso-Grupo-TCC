import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { Header } from '../components/Header';

export const LoginScreen = ({ navigation }) => {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      // navigation.navigate('Opcoes');
    } catch (error) {
      Alert.alert('Falha', 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Login do Sistema</Text>
        <Text style={styles.instructionText}>Insira suas credenciais abaixo.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>USUÁRIO</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu usuário"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 25,
    paddingTop: 40,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: COLORS.darkText,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});