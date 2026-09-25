import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

type Registro = {
    id: number;
    titulo: string;
    calificacion: number;
    comentarios: string;
    fotoBase64: string;
    fecha: string;
};

export default function ListaScreen({ navigation }: any) {

    const db = useSQLiteContext();
    const [registros, setRegistros] = useState<Registro[]>([]);

    const cargarRegistro = async () => {
        try {
            const resultado = await db.getAllAsync<Registro>('SELECT * FROM registros ORDER BY id DESC');
            setRegistros(resultado);
        } catch (error) {
            console.error("Error al cargar registros:", error);
        }
    };

    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            cargarRegistro();
        });

        return unsubscribe;

    }, [navigation]);

    const eliminarRegistro = async (id: number) => {

        if (!id) {
            Alert.alert(
                "Error",
                "No se pudo identificar el registro a eliminar."
            );

            return;
        }
        Alert.alert("Eliminar degustación", "¿Estás seguro de que deseas eliminar esta degustación?",
            [{ text: "Cancelar", style: "cancel" }, {
                text: "Eliminar", style: "destructive", onPress: async () => {
                    try {
                        await db.runAsync('DELETE FROM registros WHERE id = ?;',
                            [Number(id)]
                        );
                        cargarRegistro();

                    } catch (error) {

                        console.error("Error al eliminar el registro:", error);
                        Alert.alert("Error", "No se pudo eliminar el registro.");
                    }
                }
            }
            ]
        );
    };

    const renderItem = ({ item }: { item: Registro }) => (

        <View style={styles.card}>
            {/* Imagen */}
            {item.fotoBase64 ? (
                <Image
                    source={{ uri: item.fotoBase64 }}
                    style={styles.imagen}
                />

            ) : (
                <View style={[styles.imagen, styles.placeholderImagen]}>
                    <Ionicons
                        name="restaurant-outline"
                        size={27}
                        color="#B0A9A3"
                    />

                </View>
            )}
            {/* Información */}
            <View style={styles.infoContainer}>
                <Text
                    style={styles.titulo}
                    numberOfLines={1}
                >
                    {item.titulo}
                </Text>

                <View style={styles.ratingContainer}>

                    <Text style={styles.estrellas}>
                        {'★'.repeat(item.calificacion)}
                    </Text>

                    <Text style={styles.ratingNumber}>
                        {item.calificacion}/5
                    </Text>

                </View>

                <Text
                    style={styles.comentarios}
                    numberOfLines={2}
                >
                    {item.comentarios}
                </Text>

                <View style={styles.fechaContainer}>

                    <Ionicons
                        name="calendar-outline"
                        size={13}
                        color="#9A938D"
                    />

                    <Text style={styles.fecha}>
                        {item.fecha}
                    </Text>

                </View>

            </View>

            {/* Acciones */}
            <View style={styles.accionesContainer}>

                <TouchableOpacity
                    style={styles.btnEditar}
                    activeOpacity={0.75}
                    onPress={() =>
                        navigation.navigate(
                            'FormulariosScreen',
                            {
                                idEdicion: item.id,
                                tituloActual: item.titulo,
                                calificacionActual: item.calificacion,
                                comentariosActuales: item.comentarios,
                                fotoActual: item.fotoBase64
                            }
                        )
                    }
                >

                    <Ionicons
                        name="create-outline"
                        size={18}
                        color="#FFFFFF"
                    />

                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnEliminar}
                    activeOpacity={0.75}
                    onPress={() => eliminarRegistro(item.id)}
                >

                    <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#FFFFFF"
                    />

                </TouchableOpacity>

            </View>

        </View>
    );

    return (

        <View style={styles.container}>

            {/* Encabezado */}
            <View style={styles.encabezado}>

                <View>

                    <Text style={styles.tituloPrincipal}>
                        Mis degustaciones
                    </Text>

                    <Text style={styles.subtitulo}>
                        Guarda y recuerda tus experiencias gastronómicas
                    </Text>

                </View>

                <View style={styles.contador}>

                    <Text style={styles.numeroContador}>
                        {registros.length}
                    </Text>

                    <Text style={styles.textoContador}>
                        registros
                    </Text>

                </View>

            </View>

            {registros.length === 0 ? (

                <View style={styles.vacioContainer}>

                    <View style={styles.iconoVacio}>

                        <Ionicons
                            name="restaurant-outline"
                            size={45}
                            color="#C69C6D"
                        />

                    </View>

                    <Text style={styles.textoVacio}>
                        Aún no tienes degustaciones
                    </Text>

                    <Text style={styles.textoVacioSecundario}>
                        Registra tu primera experiencia gastronómica
                    </Text>

                </View>

            ) : (

                <FlatList
                    data={registros}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listaContainer}
                    showsVerticalScrollIndicator={false}
                />

            )}

            {/* Botón flotante */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() =>
                    navigation.navigate('FormulariosScreen')
                }
            >

                <Ionicons
                    name="add"
                    size={30}
                    color="#FFFFFF"
                />

            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F7F5F2',
    },

    encabezado: {
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    tituloPrincipal: {
        fontSize: 22,
        fontWeight: '800',
        color: '#263238',
    },

    subtitulo: {
        fontSize: 13,
        color: '#7B7470',
        marginTop: 4,
        maxWidth: 260,
    },

    contador: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFE7DE',
        width: 55,
        height: 55,
        borderRadius: 28,
    },

    numeroContador: {
        fontSize: 17,
        fontWeight: '800',
        color: '#8D6E63',
    },

    textoContador: {
        fontSize: 8,
        color: '#8D6E63',
        fontWeight: '600',
    },

    listaContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 100,
    },

    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',

        shadowColor: '#263238',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,

        elevation: 3,
    },

    imagen: {
        width: 75,
        height: 75,
        borderRadius: 12,
        backgroundColor: '#EEEAE6',
    },

    placeholderImagen: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },

    titulo: {
        fontSize: 16,
        fontWeight: '800',
        color: '#263238',
        marginBottom: 4,
    },

    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    estrellas: {
        fontSize: 13,
        color: '#C69C6D',
        letterSpacing: 1,
    },

    ratingNumber: {
        fontSize: 11,
        color: '#8A8580',
        marginLeft: 6,
        fontWeight: '600',
    },

    comentarios: {
        fontSize: 12,
        color: '#6F6A66',
        lineHeight: 17,
        marginBottom: 5,
    },

    fechaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    fecha: {
        fontSize: 10,
        color: '#9A938D',
        marginLeft: 4,
    },

    accionesContainer: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnEditar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8D6E63',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 7,
    },

    btnEliminar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#A94442',
        justifyContent: 'center',
        alignItems: 'center',
    },

    vacioContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 80,
    },

    iconoVacio: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#EFE7DE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },

    textoVacio: {
        fontSize: 18,
        fontWeight: '800',
        color: '#263238',
    },

    textoVacioSecundario: {
        fontSize: 13,
        color: '#8A8580',
        textAlign: 'center',
        marginTop: 7,
    },

    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        right: 20,
        bottom: 22,
        backgroundColor: '#263238',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,

        elevation: 8,
    },

});