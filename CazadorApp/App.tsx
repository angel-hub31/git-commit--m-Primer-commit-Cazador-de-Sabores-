import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { initDatabase } from './src/database/db';
import ListaScreen from './src/screens/ListaScreen';
import FormulariosScreen from './src/screens/FormulariosScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  const [dbLista, setDbLista] = useState(false);

  useEffect(() => {
    const preparaDb = async () => {
      try {
        await initDatabase();
        setDbLista(true);
      } catch (error) {
        console.error("Error al inicializar la base de datos", error);
      }
    };

    preparaDb();
  }, []);

  if (!dbLista) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderCircle}>
          <ActivityIndicator size="large" color="#C69C6D" />
        </View>

        <Text style={styles.loadingTitle}>
          Preparando tu experiencia
        </Text>

        <Text style={styles.loadingText}>
          Cargando base de datos...
        </Text>
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName="cazador.db">
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ListaScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#263238',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 19,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: '#F7F5F2',
            },
          }}
        >

          <Stack.Screen
            name="ListaScreen"
            component={ListaScreen}
            options={{
              title: 'Cazador de sabores',
            }}
          />

          <Stack.Screen
            name="FormulariosScreen"
            component={FormulariosScreen}
            options={{
              title: 'Nueva degustación',
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 6,
  },

  loadingText: {
    fontSize: 14,
    color: '#7A7A7A',
  },

});