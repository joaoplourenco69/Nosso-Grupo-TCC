import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importação de todas as telas da pasta screens
import { LandingScreen } from '../screens/LandingScreens';
import { LoginScreen } from '../screens/LoginScreen';
import { OpcoesScreen } from '../screens/OpcoesScreen';
import { CadastroScreen } from '../screens/CadastroScreen';
import { ListaAlertasScreen } from '../screens/ListaAlertasScreen';
import { StatusOcorrenciaScreen } from '../screens/StatusOcorrenciaScreen';

const Stack = createNativeStackNavigator();

export function AppRoutes() {
  return (
<<<<<<< HEAD
    <NavigationContainer independent>
=======
    <NavigationContainer>
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false, // Oculta o cabeçalho padrão para usar o nosso Header personalizado
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Opcoes" component={OpcoesScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="ListaAlertas" component={ListaAlertasScreen} />
        <Stack.Screen name="StatusOcorrencia" component={StatusOcorrenciaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 5455d1f5cb333ad00f076b0b954d332a2723a378
