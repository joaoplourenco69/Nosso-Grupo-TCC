import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OpcoesScreen } from '../screens/OpcoesScreen';
import { CadastroScreen } from '../screens/CadastroScreen';
import { ListaAlertasScreen } from '../screens/ListaAlertasScreen';
import { StatusOcorrenciaScreen } from '../screens/StatusOcorrenciaScreen';

const Stack = createNativeStackNavigator();

export function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
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
}